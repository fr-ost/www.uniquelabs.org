import Link from "next/link";
import type { ImportJob } from "@/generated/prisma/client";
import { AdminTable, Pill, Td, Th } from "@/components/admin/ui";
import { formatDateTime, formatBytes } from "@/lib/utils";

export const JOB_STATUS_TONE = {
  COMPLETED: "good",
  FAILED: "bad",
  PROCESSING: "info",
  QUEUED: "info",
  AWAITING_FILES: "neutral",
  CANCELLED: "neutral",
} as const;

export function jobStatusLabel(status: ImportJob["status"]): string {
  return { COMPLETED: "Completed", FAILED: "Failed", PROCESSING: "Processing", QUEUED: "Queued", AWAITING_FILES: "Awaiting files", CANCELLED: "Cancelled" }[status];
}

export function JobsTable({ jobs }: { jobs: ImportJob[] }) {
  return (
    <AdminTable minWidth="lg">
      <thead>
        <tr>
          <Th>Started</Th>
          <Th>Source</Th>
          <Th>Files</Th>
          <Th>Result</Th>
          <Th>Status</Th>
        </tr>
      </thead>
      <tbody>
        {jobs.map((job) => {
          const files = (job.files as Array<{ name: string; size: number }>) ?? [];
          const stats = (job.stats ?? {}) as Record<string, number>;
          return (
            <tr key={job.id} className="hover:bg-white/[0.02]">
              <Td className="whitespace-nowrap text-xs text-ink-400">
                <Link href={`/admin/imports/${job.id}`} className="hover:text-ink-50 hover:underline">
                  {formatDateTime(job.createdAt)}
                </Link>
              </Td>
              <Td>
                {job.kind === "CLAUDE_EXPORT" ? "Claude export" : "X archive"}
                {job.dryRun ? <Pill className="ml-2">Preview</Pill> : null}
              </Td>
              <Td className="text-xs text-ink-400">
                {files.length} file{files.length === 1 ? "" : "s"} · {formatBytes(files.reduce((s, f) => s + f.size, 0))}
              </Td>
              <Td className="text-xs text-ink-300">
                {job.status === "COMPLETED"
                  ? job.dryRun
                    ? `${stats.candidatesFound ?? 0} found (not saved)`
                    : `${stats.candidatesCreated ?? 0} new · ${stats.evidenceAdded ?? 0} evidence`
                  : (job.errorMessage ?? "—")}
              </Td>
              <Td>
                <Pill tone={JOB_STATUS_TONE[job.status]}>{jobStatusLabel(job.status)}</Pill>
              </Td>
            </tr>
          );
        })}
      </tbody>
    </AdminTable>
  );
}

/** Shown on serverless hosts, where uploads are small and instances don't share files. */
export function ServerlessImportNotice() {
  return (
    <div className="rounded-2xl border border-beta/30 bg-beta/[0.06] p-5 text-sm">
      <p className="font-medium text-beta">Large archives: import from your computer</p>
      <p className="mt-1.5 text-ink-300">
        This site runs on Vercel, where each upload is limited to about 4 MB and serverless instances don&apos;t share files, so a full export may
        not import here. Instead, run the project locally (<code className="rounded bg-white/10 px-1 font-mono text-xs">npm run dev</code>) with the
        production <code className="rounded bg-white/10 px-1 font-mono text-xs">DATABASE_URL</code> and import there — the candidates appear in this
        admin for review. Small files (a few MB) work here directly.
      </p>
    </div>
  );
}
