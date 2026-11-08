import path from "node:path";
import { prisma } from "@/lib/db";
import { audit } from "@/lib/audit";
import { getImporter } from "@/lib/importers/registry";
import { jobDir, removeJobFiles } from "@/lib/importers/storage";
import { ImportCancelledError, ImportFormatError, type CandidateDraft, type UploadedFile } from "@/lib/importers/core/types";
import type { Prisma } from "@/generated/prisma/client";

/**
 * Runs an import job end to end:
 *   files → importer (parse, normalise, extract, classify) → deduplicate →
 *   persist candidates + evidence (idempotent) → job report.
 *
 * Idempotency: evidence rows are unique per (candidate, source type, source
 * id). Re-importing the same archive adds nothing new; a newer archive only
 * adds new evidence. Candidates that were approved, rejected, archived or
 * merged are never resurrected — new evidence is attached and reported.
 */

export interface StoredFile {
  name: string;
  storedAs: string;
  size: number;
  sha256: string;
}

const HEARTBEAT_STALE_MS = 3 * 60 * 1000;

function asJson(value: unknown): Prisma.InputJsonValue {
  return JSON.parse(JSON.stringify(value)) as Prisma.InputJsonValue;
}

export async function markStaleJobs(): Promise<void> {
  const cutoff = new Date(Date.now() - HEARTBEAT_STALE_MS);
  const stale = await prisma.importJob.findMany({
    where: { status: { in: ["PROCESSING", "QUEUED"] }, OR: [{ heartbeatAt: { lt: cutoff } }, { heartbeatAt: null, createdAt: { lt: cutoff } }] },
    select: { id: true },
  });
  for (const job of stale) {
    await prisma.importJob.update({
      where: { id: job.id },
      data: {
        status: "FAILED",
        finishedAt: new Date(),
        errorMessage: "Processing was interrupted (for example by a server restart). Upload the files again — re-importing is safe and creates no duplicates.",
      },
    });
    await removeJobFiles(job.id);
  }
}

async function persistCandidates(jobId: string, drafts: CandidateDraft[]) {
  const counts = { candidatesCreated: 0, candidatesUpdated: 0, evidenceAdded: 0, evidenceAlreadyKnown: 0, closedCandidatesWithNewEvidence: 0 };

  for (const draft of drafts) {
    await prisma.$transaction(async (tx) => {
      // 1. Find an existing candidate: by shared evidence first, then by fingerprint.
      const evidenceIds = draft.evidence.map((e) => e.sourceId);
      const sharedEvidence = await tx.sourceEvidence.findFirst({
        where: {
          sourceType: { in: [...new Set(draft.evidence.map((e) => e.sourceType))] },
          sourceId: { in: evidenceIds },
          candidate: { kind: draft.kind },
        },
        select: { candidateId: true },
      });
      let candidate = sharedEvidence?.candidateId
        ? await tx.importCandidate.findUnique({ where: { id: sharedEvidence.candidateId } })
        : await tx.importCandidate.findUnique({ where: { kind_fingerprint: { kind: draft.kind, fingerprint: draft.fingerprint } } });

      // Follow merges to the surviving candidate.
      for (let hops = 0; candidate?.status === "MERGED" && candidate.mergedIntoId && hops < 5; hops += 1) {
        candidate = await tx.importCandidate.findUnique({ where: { id: candidate.mergedIntoId } });
      }

      if (!candidate) {
        candidate = await tx.importCandidate.create({
          data: {
            kind: draft.kind,
            fingerprint: draft.fingerprint,
            title: draft.title.slice(0, 200),
            summary: draft.summary,
            productStage: draft.productStage ?? null,
            collaborationCategory: draft.collaborationCategory ?? null,
            confidence: Math.max(0, Math.min(100, Math.round(draft.confidence))),
            verification: draft.verification,
            data: asJson(draft.data),
            signals: asJson(draft.signals),
            firstSeenAt: draft.firstSeenAt,
            lastSeenAt: draft.lastSeenAt,
            jobId,
          },
        });
        counts.candidatesCreated += 1;
      } else if (candidate.status === "PENDING") {
        // Refresh the open candidate with the latest analysis, keeping owner edits to the title.
        await tx.importCandidate.update({
          where: { id: candidate.id },
          data: {
            summary: candidate.summary ?? draft.summary,
            productStage: draft.productStage ?? candidate.productStage,
            collaborationCategory: draft.collaborationCategory ?? candidate.collaborationCategory,
            confidence: Math.max(candidate.confidence, Math.round(draft.confidence)),
            verification: draft.verification === "EVIDENCE_FOUND" ? "EVIDENCE_FOUND" : candidate.verification,
            data: asJson({ ...(candidate.data as Record<string, unknown>), ...draft.data }),
            signals: asJson(draft.signals),
            firstSeenAt: candidate.firstSeenAt && draft.firstSeenAt && candidate.firstSeenAt < draft.firstSeenAt ? candidate.firstSeenAt : (draft.firstSeenAt ?? candidate.firstSeenAt),
            lastSeenAt: candidate.lastSeenAt && draft.lastSeenAt && candidate.lastSeenAt > draft.lastSeenAt ? candidate.lastSeenAt : (draft.lastSeenAt ?? candidate.lastSeenAt),
          },
        });
        counts.candidatesUpdated += 1;
      }

      // 2. Attach evidence (duplicates are skipped by the unique constraint).
      const result = await tx.sourceEvidence.createMany({
        data: draft.evidence.map((e) => ({
          candidateId: candidate!.id,
          sourceType: e.sourceType,
          sourceId: e.sourceId.slice(0, 200),
          sourceTitle: e.sourceTitle?.slice(0, 300) ?? null,
          sourceUrl: e.sourceUrl,
          excerpt: e.excerpt?.slice(0, 4000) ?? null,
          sourceTimestamp: e.sourceTimestamp,
          author: e.author,
          details: asJson(e.details),
          // Approved candidates pass their provenance on to the content record.
          productId: candidate!.productId,
          collaborationId: candidate!.collaborationId,
          jobId,
        })),
        skipDuplicates: true,
      });
      counts.evidenceAdded += result.count;
      counts.evidenceAlreadyKnown += draft.evidence.length - result.count;
      if (result.count > 0 && candidate.status !== "PENDING") counts.closedCandidatesWithNewEvidence += 1;
    });
  }
  return counts;
}

export async function runImportJob(jobId: string): Promise<void> {
  const job = await prisma.importJob.findUnique({ where: { id: jobId } });
  if (!job || job.status !== "QUEUED") return;
  const importer = getImporter(job.kind);
  const warnings: string[] = [];
  const startedAt = new Date();

  await prisma.importJob.update({
    where: { id: jobId },
    data: { status: "PROCESSING", startedAt, heartbeatAt: startedAt, phase: "Starting", progress: 0, errorMessage: null },
  });

  try {
    if (!importer) throw new ImportFormatError(`No importer is registered for ${job.kind}.`);
    const stored = (job.files as unknown as StoredFile[]) ?? [];
    const files: UploadedFile[] = stored.map((f) => ({ path: path.join(jobDir(jobId), f.storedAs), name: f.name, size: f.size }));

    const result = await importer.run({
      files,
      warn: (message) => {
        if (warnings.length < 200) warnings.push(message);
      },
      onProgress: async ({ phase, percent, processedItems }) => {
        await prisma.importJob.update({
          where: { id: jobId },
          data: { phase, progress: Math.max(0, Math.min(99, percent)), processedItems, heartbeatAt: new Date() },
        });
      },
      checkCancelled: async () => {
        const current = await prisma.importJob.findUnique({ where: { id: jobId }, select: { status: true } });
        if (current?.status === "CANCELLED") throw new ImportCancelledError();
      },
    });

    let persisted: Record<string, number> = {};
    if (job.dryRun) {
      await prisma.importJob.update({
        where: { id: jobId },
        data: {
          preview: asJson(
            result.candidates.slice(0, 100).map((c) => ({
              title: c.title,
              kind: c.kind,
              stage: c.productStage ?? null,
              category: c.collaborationCategory ?? null,
              confidence: c.confidence,
              verification: c.verification,
              summary: c.summary,
              sources: c.evidence.length,
              signals: c.signals.slice(0, 3),
            })),
          ),
        },
      });
    } else {
      await prisma.importJob.update({ where: { id: jobId }, data: { phase: "Saving candidates", progress: 97, heartbeatAt: new Date() } });
      persisted = await persistCandidates(jobId, result.candidates);
    }

    const stats = { ...result.stats, candidatesFound: result.candidates.length, ...persisted };
    await prisma.importJob.update({
      where: { id: jobId },
      data: { status: "COMPLETED", phase: "Completed", progress: 100, finishedAt: new Date(), heartbeatAt: new Date(), stats: asJson(stats), warnings: asJson(warnings) },
    });
    await audit({
      actor: { id: job.createdById, label: "import" },
      action: job.dryRun ? "import.preview" : "import.complete",
      entityType: "ImportJob",
      entityId: jobId,
      summary: job.dryRun
        ? `Previewed ${importer!.label}: ${result.candidates.length} potential candidates (nothing saved)`
        : `Imported ${importer!.label}: ${persisted.candidatesCreated ?? 0} new candidates, ${persisted.evidenceAdded ?? 0} new evidence items`,
      metadata: asJson(stats),
    });
  } catch (error) {
    const cancelled = error instanceof ImportCancelledError;
    const message = cancelled
      ? "Cancelled by an administrator."
      : error instanceof ImportFormatError
        ? error.message
        : "The import failed unexpectedly. Check the server logs for details.";
    if (!cancelled && !(error instanceof ImportFormatError)) console.error(`[import ${jobId}]`, error);
    await prisma.importJob.update({
      where: { id: jobId },
      data: { status: cancelled ? "CANCELLED" : "FAILED", errorMessage: message, finishedAt: new Date(), warnings: asJson(warnings) },
    });
    await audit({ actor: { id: job.createdById, label: "import" }, action: cancelled ? "import.cancelled" : "import.failed", entityType: "ImportJob", entityId: jobId, summary: message });
  } finally {
    // Raw uploads are never kept after processing.
    await removeJobFiles(jobId);
  }
}
