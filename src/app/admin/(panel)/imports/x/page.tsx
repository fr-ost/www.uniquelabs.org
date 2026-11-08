import type { Metadata } from "next";
import { ShieldCheck } from "lucide-react";
import { JobsTable } from "@/components/admin/import-pages";
import { ImportUploader } from "@/components/admin/import-uploader";
import { AdminButtonLink, AdminPageHeader, Panel } from "@/components/admin/ui";
import { prisma } from "@/lib/db";
import { env } from "@/lib/env";

export const metadata: Metadata = { title: "Import X Archive" };

export default async function XImportPage() {
  const [jobs, pending] = await Promise.all([
    prisma.importJob.findMany({ where: { kind: "X_ARCHIVE" }, orderBy: { createdAt: "desc" }, take: 10 }),
    prisma.importCandidate.count({ where: { kind: "COLLABORATION", status: "PENDING" } }),
  ]);
  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Import X Archive"
        description="Discover collaboration and partnership announcements in your X/Twitter archive. Mentions, replies, retweets and thank-you posts are not treated as collaborations."
        actions={pending ? <AdminButtonLink href="/admin/candidates/collaborations" variant="primary">Review {pending} candidate{pending === 1 ? "" : "s"}</AdminButtonLink> : null}
      />
      <div className="grid gap-6 lg:grid-cols-[1fr_22rem]">
        <Panel title="Upload your archive">
          <ImportUploader
            kind="X_ARCHIVE"
            accept=".zip,.js,.json,application/zip,text/javascript,application/json"
            maxMb={env().IMPORT_MAX_UPLOAD_MB}
            hint={`Upload the archive ZIP (or multiple part ZIPs), or data files such as tweets.js, tweets-part1.js, note-tweet.js and account.js. Up to ${env().IMPORT_MAX_UPLOAD_MB} MB per file.`}
          />
        </Panel>
        <div className="space-y-4">
          <Panel title="How to download your archive">
            <ol className="list-decimal space-y-2 pl-4 text-sm text-ink-300">
              <li>On X, open <strong className="text-ink-100">Settings → Your account</strong>.</li>
              <li>Choose <strong className="text-ink-100">Download an archive of your data</strong>.</li>
              <li>When it&apos;s ready, download the ZIP.</li>
              <li>Upload the ZIP here, or just <code>data/tweets.js</code> (plus <code>account.js</code> for correct post links).</li>
            </ol>
          </Panel>
          <Panel>
            <div className="flex gap-3">
              <ShieldCheck aria-hidden className="h-5 w-5 shrink-0 text-live" />
              <div className="space-y-2 text-xs leading-relaxed text-ink-400">
                <p className="text-sm font-medium text-ink-100">Safe parsing</p>
                <p>The archive&apos;s JavaScript files are parsed as data and never executed. Only tweet data is read — direct messages, deleted tweets and account details (other than your username) are ignored.</p>
                <p>The archive is deleted after processing.</p>
              </div>
            </div>
          </Panel>
        </div>
      </div>
      {jobs.length > 0 ? (
        <div className="space-y-3">
          <h2 className="text-sm font-semibold text-ink-50">Recent X imports</h2>
          <JobsTable jobs={jobs} />
        </div>
      ) : null}
    </div>
  );
}
