import type { Metadata } from "next";
import { JobsTable } from "@/components/admin/import-pages";
import { AdminButtonLink, AdminPageHeader, EmptyPanel } from "@/components/admin/ui";
import { prisma } from "@/lib/db";
import { markStaleJobs } from "@/lib/importers/pipeline";
import { requireAdmin } from "@/lib/auth/guards";

export const metadata: Metadata = { title: "Import history" };

export default async function ImportHistoryPage() {
  await requireAdmin();
  await markStaleJobs();
  const jobs = await prisma.importJob.findMany({ orderBy: { createdAt: "desc" }, take: 100 });
  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Import history"
        description="Every import, with its source files (names and checksums only — raw files are never kept), results, warnings and errors."
        actions={
          <>
            <AdminButtonLink href="/admin/imports/claude">Claude import</AdminButtonLink>
            <AdminButtonLink href="/admin/imports/x">X import</AdminButtonLink>
          </>
        }
      />
      {jobs.length === 0 ? <EmptyPanel title="No imports yet" /> : <JobsTable jobs={jobs} />}
    </div>
  );
}
