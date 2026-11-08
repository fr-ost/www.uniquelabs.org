import Link from "next/link";
import type { CandidateKind, CandidateStatus, ImportCandidate } from "@/generated/prisma/client";
import { InlineSubmit } from "@/components/admin/form";
import { AdminTable, EmptyPanel, Pill, Td, Th } from "@/components/admin/ui";
import { prisma } from "@/lib/db";
import { COLLABORATION_CATEGORY_LABELS, EVIDENCE_STAGE_LABELS, VERIFICATION_LABELS } from "@/lib/labels";
import { cn, formatDate } from "@/lib/utils";
import { archiveCandidate, mergeCandidates } from "@/server/actions/candidates";

const TABS: Array<{ key: CandidateStatus; label: string }> = [
  { key: "PENDING", label: "Pending review" },
  { key: "APPROVED", label: "Approved" },
  { key: "REJECTED", label: "Rejected" },
  { key: "ARCHIVED", label: "Archived" },
  { key: "MERGED", label: "Merged" },
];

export function ConfidenceBar({ value }: { value: number }) {
  const tone = value >= 70 ? "bg-live" : value >= 45 ? "bg-beta" : "bg-ink-400";
  return (
    <div className="flex items-center gap-2" title={`${value}% confidence`}>
      <div className="h-1.5 w-16 overflow-hidden rounded-full bg-white/[0.08]">
        <div className={cn("h-full rounded-full", tone)} style={{ width: `${value}%` }} />
      </div>
      <span className="text-xs text-ink-400 tabular">{value}%</span>
    </div>
  );
}

export function ClassificationPill({ candidate }: { candidate: Pick<ImportCandidate, "productStage" | "collaborationCategory"> }) {
  if (candidate.productStage) {
    const tone = candidate.productStage === "PUBLISHED" ? "good" : candidate.productStage === "BETA" ? "warn" : candidate.productStage === "CANCELLED" ? "bad" : "neutral";
    return <Pill tone={tone}>{EVIDENCE_STAGE_LABELS[candidate.productStage]}</Pill>;
  }
  if (candidate.collaborationCategory) return <Pill tone="info">{COLLABORATION_CATEGORY_LABELS[candidate.collaborationCategory]}</Pill>;
  return null;
}

export function VerificationPill({ value }: { value: ImportCandidate["verification"] }) {
  return <Pill tone={value === "VERIFIED" ? "good" : value === "EVIDENCE_FOUND" ? "info" : "warn"}>{VERIFICATION_LABELS[value]}</Pill>;
}

export async function CandidatesList({ kind, status, basePath }: { kind: CandidateKind; status: CandidateStatus; basePath: string }) {
  const [candidates, counts] = await Promise.all([
    prisma.importCandidate.findMany({
      where: { kind, status },
      orderBy: [{ confidence: "desc" }, { lastSeenAt: "desc" }],
      take: 300,
      include: { _count: { select: { evidence: true } } },
    }),
    prisma.importCandidate.groupBy({ by: ["status"], where: { kind }, _count: { _all: true } }),
  ]);
  const countFor = (key: CandidateStatus) => counts.find((c) => c.status === key)?._count._all ?? 0;
  const mergeable = status === "PENDING" && candidates.length > 1;

  return (
    <div className="space-y-5">
      <nav className="flex flex-wrap gap-2" aria-label="Candidate status">
        {TABS.map((tab) => (
          <Link
            key={tab.key}
            href={`${basePath}?status=${tab.key}`}
            className={cn("rounded-lg px-3 py-1.5 text-sm", tab.key === status ? "bg-white/[0.08] text-ink-50" : "text-ink-400 hover:text-ink-100")}
          >
            {tab.label} <span className="text-ink-500 tabular">{countFor(tab.key)}</span>
          </Link>
        ))}
      </nav>

      {candidates.length === 0 ? (
        <EmptyPanel
          title={status === "PENDING" ? "Nothing waiting for review" : "No candidates here"}
          body={status === "PENDING" ? "Run an import to discover new candidates." : undefined}
        />
      ) : (
        <form action={mergeCandidates} className="space-y-4">
          <AdminTable minWidth="xl">
            <thead>
              <tr>
                {mergeable ? <Th className="w-10"><span className="sr-only">Select</span></Th> : null}
                <Th>Candidate</Th>
                <Th>Classification</Th>
                <Th>Confidence</Th>
                <Th>Sources</Th>
                <Th>Seen</Th>
                <Th className="text-right">Actions</Th>
              </tr>
            </thead>
            <tbody>
              {candidates.map((candidate) => (
                <tr key={candidate.id} className="hover:bg-white/[0.02]">
                  {mergeable ? (
                    <Td>
                      <input type="checkbox" name="sourceIds" value={candidate.id} aria-label={`Select ${candidate.title}`} className="h-4 w-4 accent-signal-500" />
                    </Td>
                  ) : null}
                  <Td>
                    <Link href={`${basePath}/${candidate.id}`} className="font-medium text-ink-50 hover:underline">
                      {candidate.title}
                    </Link>
                    {candidate.summary ? <p className="line-clamp-1 max-w-md text-xs text-ink-500">{candidate.summary}</p> : null}
                  </Td>
                  <Td>
                    <div className="flex flex-wrap gap-1.5">
                      <ClassificationPill candidate={candidate} />
                      <VerificationPill value={candidate.verification} />
                    </div>
                  </Td>
                  <Td>
                    <ConfidenceBar value={candidate.confidence} />
                  </Td>
                  <Td className="text-xs text-ink-400">{candidate._count.evidence}</Td>
                  <Td className="whitespace-nowrap text-xs text-ink-400">
                    {candidate.firstSeenAt ? formatDate(candidate.firstSeenAt, "DAY", "short") : "—"}
                    {candidate.lastSeenAt && candidate.firstSeenAt && candidate.lastSeenAt.getTime() !== candidate.firstSeenAt.getTime()
                      ? ` → ${formatDate(candidate.lastSeenAt, "DAY", "short")}`
                      : ""}
                  </Td>
                  <Td>
                    <div className="flex justify-end gap-1.5">
                      <Link href={`${basePath}/${candidate.id}`} className="inline-flex h-8 items-center rounded-lg bg-ink-50 px-3 text-xs font-medium text-ink-950 hover:bg-white">
                        Review
                      </Link>
                      {status === "PENDING" ? (
                        <button formAction={archiveCandidate.bind(null, candidate.id)} className="inline-flex h-8 items-center rounded-lg px-2.5 text-xs text-ink-300 hover:bg-white/[0.05] hover:text-ink-50">
                          Archive
                        </button>
                      ) : null}
                    </div>
                  </Td>
                </tr>
              ))}
            </tbody>
          </AdminTable>
          {mergeable ? (
            <div className="flex flex-col gap-3 rounded-2xl border border-white/[0.08] bg-ink-900/60 p-4 sm:flex-row sm:items-center">
              <p className="text-sm text-ink-300">Merge duplicates: tick the duplicates above, choose the record to keep, then merge.</p>
              <select name="targetId" aria-label="Keep this candidate" className="h-9 rounded-lg border border-white/10 bg-ink-950 px-3 text-sm text-ink-100 sm:ml-auto">
                {candidates.map((candidate) => (
                  <option key={candidate.id} value={candidate.id}>
                    Keep: {candidate.title}
                  </option>
                ))}
              </select>
              <InlineSubmit size="md">Merge selected</InlineSubmit>
            </div>
          ) : null}
        </form>
      )}
    </div>
  );
}
