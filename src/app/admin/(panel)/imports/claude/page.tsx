import type { Metadata } from "next";
import { ShieldCheck } from "lucide-react";
import { JobsTable, ServerlessImportNotice } from "@/components/admin/import-pages";
import { ImportUploader } from "@/components/admin/import-uploader";
import { AdminButtonLink, AdminPageHeader, Panel } from "@/components/admin/ui";
import { prisma } from "@/lib/db";
import { env, ON_VERCEL } from "@/lib/env";
import { requireAdmin } from "@/lib/auth/guards";

export const metadata: Metadata = { title: "Claude history import" };

export default async function ClaudeImportPage() {
  await requireAdmin();
  const [jobs, pending] = await Promise.all([
    prisma.importJob.findMany({ where: { kind: "CLAUDE_EXPORT" }, orderBy: { createdAt: "desc" }, take: 10 }),
    prisma.importCandidate.count({ where: { kind: "PRODUCT", status: "PENDING" } }),
  ]);
  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Claude history import"
        description="Find products you've actually launched in your Claude conversation history. Ideas and plans are classified separately — nothing is published without your approval."
        actions={pending ? <AdminButtonLink href="/admin/candidates/products" variant="primary">Review {pending} candidate{pending === 1 ? "" : "s"}</AdminButtonLink> : null}
      />
      {ON_VERCEL ? <ServerlessImportNotice /> : null}
      <div className="grid gap-6 lg:grid-cols-[1fr_22rem]">
        <Panel title="Upload your export">
          <ImportUploader
            kind="CLAUDE_EXPORT"
            accept=".zip,.json,application/zip,application/json"
            maxMb={env().IMPORT_MAX_UPLOAD_MB}
            hint={`Upload the export ZIP (or several batch ZIPs for large accounts), or the extracted conversations.json, projects.json and memories.json. Up to ${env().IMPORT_MAX_UPLOAD_MB} MB per file.`}
          />
        </Panel>
        <div className="space-y-4">
          <Panel title="How to export from Claude">
            <ol className="list-decimal space-y-2 pl-4 text-sm text-ink-300">
              <li>Open Claude → <strong className="text-ink-100">Settings → Privacy</strong>.</li>
              <li>Choose <strong className="text-ink-100">Export data</strong>.</li>
              <li>Download the archive from the email link (it expires quickly).</li>
              <li>Upload the ZIP here — no need to unzip it.</li>
            </ol>
            <p className="mt-3 text-xs text-ink-500">Uploaded original files (images, PDFs) are not always included in exports, so screenshots may need to be added manually.</p>
          </Panel>
          <Panel>
            <div className="flex gap-3">
              <ShieldCheck aria-hidden className="h-5 w-5 shrink-0 text-live" />
              <div className="space-y-2 text-xs leading-relaxed text-ink-400">
                <p className="text-sm font-medium text-ink-100">Private by design</p>
                <p>Processing runs entirely on this server. Conversation content is never sent to any AI service or third party.</p>
                <p>Only short excerpts needed as evidence are stored, privately. The uploaded archive is deleted as soon as processing finishes.</p>
                <p>Re-importing a newer export is safe: existing candidates are updated, never duplicated.</p>
              </div>
            </div>
          </Panel>
        </div>
      </div>
      {jobs.length > 0 ? (
        <div className="space-y-3">
          <h2 className="text-sm font-semibold text-ink-50">Recent Claude imports</h2>
          <JobsTable jobs={jobs} />
        </div>
      ) : null}
    </div>
  );
}
