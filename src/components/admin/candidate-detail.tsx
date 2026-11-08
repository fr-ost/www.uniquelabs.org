import Link from "next/link";
import type { ReactNode } from "react";
import type { ImportCandidate, SourceEvidence } from "@/generated/prisma/client";
import { ClassificationPill, ConfidenceBar, VerificationPill } from "@/components/admin/candidates-list";
import { ConfirmAction } from "@/components/admin/confirm";
import { EvidenceList } from "@/components/admin/evidence-list";
import { InlineSubmit } from "@/components/admin/form";
import { AdminPageHeader, Panel, Pill } from "@/components/admin/ui";
import { formatDateTime } from "@/lib/utils";
import { archiveCandidate, rejectCandidate, restoreCandidate } from "@/server/actions/candidates";

/** Shared layout for product and collaboration candidate review pages. */
export function CandidateDetail({
  candidate,
  evidence,
  listHref,
  listLabel,
  extracted,
  approval,
  linkedRecord,
}: {
  candidate: ImportCandidate;
  evidence: SourceEvidence[];
  listHref: string;
  listLabel: string;
  extracted: ReactNode;
  approval: ReactNode;
  linkedRecord?: { href: string; label: string } | null;
}) {
  const signals = (candidate.signals ?? []) as string[];
  return (
    <div className="space-y-6">
      <AdminPageHeader
        breadcrumbs={[{ label: listLabel, href: listHref }, { label: candidate.title }]}
        title={candidate.title}
        description={`Found ${candidate.firstSeenAt ? `from ${formatDateTime(candidate.firstSeenAt)}` : ""}${candidate.lastSeenAt ? ` to ${formatDateTime(candidate.lastSeenAt)}` : ""} · fingerprint ${candidate.fingerprint}`}
        actions={
          <>
            <ClassificationPill candidate={candidate} />
            <VerificationPill value={candidate.verification} />
            <Pill>{candidate.status.toLowerCase()}</Pill>
          </>
        }
      />

      {candidate.status !== "PENDING" ? (
        <div className="flex flex-col gap-3 rounded-2xl border border-white/[0.08] bg-ink-900/60 p-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-ink-300">
            Reviewed {candidate.reviewedAt ? formatDateTime(candidate.reviewedAt) : ""} — {candidate.status.toLowerCase()}.
            {candidate.reviewNote ? <span className="mt-1 block text-ink-400">Note: {candidate.reviewNote}</span> : null}
            {linkedRecord ? (
              <Link href={linkedRecord.href} className="mt-1 block text-signal-400 hover:underline">
                {linkedRecord.label} →
              </Link>
            ) : null}
          </p>
          {candidate.status === "REJECTED" || candidate.status === "ARCHIVED" ? (
            <form action={restoreCandidate.bind(null, candidate.id)}>
              <InlineSubmit size="md">Restore to pending</InlineSubmit>
            </form>
          ) : null}
        </div>
      ) : null}

      <div className="grid gap-6 xl:grid-cols-[1fr_24rem]">
        <div className="space-y-6">
          <Panel title="Why this was flagged">
            <div className="mb-4 flex items-center gap-3">
              <span className="text-xs text-ink-500">Confidence</span>
              <ConfidenceBar value={candidate.confidence} />
            </div>
            <ul className="space-y-1.5 text-sm text-ink-200">
              {signals.map((signal, index) => (
                <li key={index} className="flex gap-2">
                  <span aria-hidden className="mt-2 h-1 w-1 shrink-0 rounded-full bg-signal-500" />
                  {signal}
                </li>
              ))}
            </ul>
            {candidate.summary ? <p className="mt-4 rounded-lg bg-white/[0.03] px-3 py-2 text-sm text-ink-300">{candidate.summary}</p> : null}
          </Panel>
          <Panel title="Extracted details">{extracted}</Panel>
          <Panel title={`Source evidence (${evidence.length})`} description="Private. Excerpts are stored only so you can trace this record to its source.">
            <EvidenceList evidence={evidence} />
          </Panel>
        </div>
        {candidate.status === "PENDING" ? (
          <aside className="space-y-4">
            <Panel title="Approve">{approval}</Panel>
            <Panel title="Other decisions">
              <div className="flex flex-wrap gap-2">
                <ConfirmAction
                  action={rejectCandidate.bind(null, candidate.id)}
                  trigger="Reject"
                  title="Reject this candidate?"
                  body="Rejected candidates stay rejected: future imports attach new evidence but never bring them back to the queue."
                  confirmLabel="Reject"
                >
                  <label className="block text-xs text-ink-400" htmlFor="reject-note">
                    Reason (private, optional)
                  </label>
                  <textarea id="reject-note" name="note" rows={2} maxLength={1000} className="mt-1 w-full rounded-lg border border-white/10 bg-ink-950 px-3 py-2 text-sm text-ink-100" />
                </ConfirmAction>
                <form action={archiveCandidate.bind(null, candidate.id)}>
                  <InlineSubmit>Archive</InlineSubmit>
                </form>
              </div>
            </Panel>
          </aside>
        ) : null}
      </div>
    </div>
  );
}

export function KeyValueList({ items }: { items: Array<{ label: string; value: ReactNode }> }) {
  return (
    <dl className="grid gap-x-6 gap-y-4 text-sm sm:grid-cols-2">
      {items.map((item) => (
        <div key={item.label}>
          <dt className="text-xs text-ink-500">{item.label}</dt>
          <dd className="mt-1 break-words text-ink-100">{item.value || <span className="text-ink-600">—</span>}</dd>
        </div>
      ))}
    </dl>
  );
}
