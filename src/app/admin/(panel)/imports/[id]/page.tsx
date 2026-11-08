import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AlertTriangle } from "lucide-react";
import { JOB_STATUS_TONE, jobStatusLabel } from "@/components/admin/import-pages";
import { ImportJobProgress } from "@/components/admin/import-uploader";
import { AdminButtonLink, AdminPageHeader, Panel, Pill } from "@/components/admin/ui";
import { prisma } from "@/lib/db";
import { markStaleJobs, type StoredFile } from "@/lib/importers/pipeline";
import { EVIDENCE_STAGE_LABELS, COLLABORATION_CATEGORY_LABELS } from "@/lib/labels";
import { formatBytes, formatDateTime } from "@/lib/utils";
import { requireAdmin } from "@/lib/auth/guards";

export const metadata: Metadata = { title: "Import report" };

const STAT_LABELS: Record<string, string> = {
  files: "Files uploaded",
  sourceFiles: "Data files read",
  conversationsScanned: "Conversations scanned",
  projectsScanned: "Projects scanned",
  memoryEntries: "Memory entries",
  messagesScanned: "Messages scanned",
  productRelated: "Product-related sources",
  tweetsScanned: "Posts scanned",
  retweetsExcluded: "Retweets excluded",
  repliesSeen: "Replies (down-weighted)",
  collaborationSignals: "Posts with collaboration signals",
  duplicateTweets: "Duplicate posts skipped",
  candidatesFound: "Candidates found",
  candidatesCreated: "New candidates",
  candidatesUpdated: "Existing candidates updated",
  evidenceAdded: "New evidence items",
  evidenceAlreadyKnown: "Evidence already known (skipped)",
  closedCandidatesWithNewEvidence: "Reviewed candidates with new evidence",
  skippedOversized: "Oversized items skipped",
  skippedMalformed: "Unrecognised items skipped",
  skippedEmpty: "Empty conversations",
};

interface PreviewItem {
  title: string;
  kind: string;
  stage: string | null;
  category: string | null;
  confidence: number;
  verification: string;
  summary: string | null;
  sources: number;
  signals: string[];
}

export default async function ImportJobPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;
  await markStaleJobs();
  const job = await prisma.importJob.findUnique({ where: { id }, include: { createdBy: { select: { email: true } } } });
  if (!job) notFound();
  const files = (job.files as unknown as StoredFile[]) ?? [];
  const stats = (job.stats ?? {}) as Record<string, number>;
  const warnings = (job.warnings ?? []) as string[];
  const preview = (job.preview ?? []) as unknown as PreviewItem[];
  const reviewHref = job.kind === "CLAUDE_EXPORT" ? "/admin/candidates/products" : "/admin/candidates/collaborations";

  return (
    <div className="space-y-6">
      <AdminPageHeader
        breadcrumbs={[{ label: "Import history", href: "/admin/imports" }, { label: formatDateTime(job.createdAt) }]}
        title={`${job.kind === "CLAUDE_EXPORT" ? "Claude export" : "X archive"} import${job.dryRun ? " — preview" : ""}`}
        description={`Started ${formatDateTime(job.createdAt)}${job.createdBy ? ` by ${job.createdBy.email}` : ""}${job.finishedAt ? ` · finished ${formatDateTime(job.finishedAt)}` : ""}`}
        actions={
          <>
            <Pill tone={JOB_STATUS_TONE[job.status]}>{jobStatusLabel(job.status)}</Pill>
            {job.status === "COMPLETED" && !job.dryRun ? <AdminButtonLink href={reviewHref} variant="primary">Review candidates</AdminButtonLink> : null}
          </>
        }
      />

      <ImportJobProgress jobId={job.id} initial={{ status: job.status, phase: job.phase, progress: job.progress, processedItems: job.processedItems }} />

      {job.errorMessage ? (
        <p role="alert" className="flex items-start gap-2 rounded-xl border border-danger/30 bg-danger/10 px-4 py-3 text-sm text-ink-100">
          <AlertTriangle aria-hidden className="mt-0.5 h-4 w-4 shrink-0 text-danger" /> {job.errorMessage}
        </p>
      ) : null}

      {job.status === "COMPLETED" && job.dryRun ? (
        <p className="rounded-xl border border-soon/30 bg-soon/10 px-4 py-3 text-sm text-ink-100">
          This was a preview — nothing was saved. Upload the same files again without “Preview only” to create candidates.
        </p>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-2">
        <Panel title="Results">
          {Object.keys(stats).length === 0 ? (
            <p className="text-sm text-ink-400">Results appear when processing finishes.</p>
          ) : (
            <dl className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
              {Object.entries(stats)
                .filter(([key]) => STAT_LABELS[key])
                .map(([key, value]) => (
                  <div key={key} className="flex items-baseline justify-between gap-3 border-b border-white/[0.05] pb-2">
                    <dt className="text-ink-400">{STAT_LABELS[key]}</dt>
                    <dd className="font-medium text-ink-100 tabular">{Number(value).toLocaleString()}</dd>
                  </div>
                ))}
            </dl>
          )}
        </Panel>
        <Panel title="Files" description="Raw files are deleted after processing; only names and SHA-256 checksums are kept.">
          <ul className="space-y-2 text-sm">
            {files.map((file) => (
              <li key={file.storedAs} className="flex items-center justify-between gap-3">
                <span className="min-w-0">
                  <span className="block truncate text-ink-100">{file.name}</span>
                  <span className="block font-mono text-[0.6875rem] text-ink-600">{file.sha256.slice(0, 24)}…</span>
                </span>
                <span className="shrink-0 text-xs text-ink-500">{formatBytes(file.size)}</span>
              </li>
            ))}
          </ul>
        </Panel>
      </div>

      {warnings.length > 0 ? (
        <Panel title={`Warnings (${warnings.length})`}>
          <ul className="space-y-1.5 text-sm text-beta">
            {warnings.map((warning, index) => (
              <li key={index}>• {warning}</li>
            ))}
          </ul>
        </Panel>
      ) : null}

      {preview.length > 0 ? (
        <Panel title="Preview" description="What a real import would create (top results).">
          <ul className="divide-y divide-white/[0.06]">
            {preview.map((item, index) => (
              <li key={index} className="py-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="font-medium text-ink-100">{item.title}</p>
                  <div className="flex gap-1.5">
                    {item.stage ? <Pill tone={item.stage === "PUBLISHED" ? "good" : "neutral"}>{EVIDENCE_STAGE_LABELS[item.stage as keyof typeof EVIDENCE_STAGE_LABELS]}</Pill> : null}
                    {item.category ? <Pill>{COLLABORATION_CATEGORY_LABELS[item.category as keyof typeof COLLABORATION_CATEGORY_LABELS]}</Pill> : null}
                    <Pill tone="info">{item.confidence}% confidence</Pill>
                  </div>
                </div>
                {item.summary ? <p className="mt-1 line-clamp-2 text-sm text-ink-400">{item.summary}</p> : null}
                <p className="mt-1 text-xs text-ink-600">{item.signals.join(" · ")}</p>
              </li>
            ))}
          </ul>
        </Panel>
      ) : null}
    </div>
  );
}
