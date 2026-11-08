import type { Metadata } from "next";
import { CandidatesList } from "@/components/admin/candidates-list";
import { AdminButtonLink, AdminPageHeader } from "@/components/admin/ui";
import type { CandidateStatus } from "@/generated/prisma/enums";

export const metadata: Metadata = { title: "Collaboration candidates" };

const STATUSES: CandidateStatus[] = ["PENDING", "APPROVED", "REJECTED", "ARCHIVED", "MERGED"];

export default async function CollaborationCandidatesPage({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  const raw = (await searchParams).status;
  const status = STATUSES.includes(raw as CandidateStatus) ? (raw as CandidateStatus) : "PENDING";
  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Collaboration candidates"
        description="Possible collaborations found in your X archive. A mention is not proof of a partnership — approve only genuine collaborations, and merge duplicates of the same one."
        actions={<AdminButtonLink href="/admin/imports/x">New import</AdminButtonLink>}
      />
      <CandidatesList kind="COLLABORATION" status={status} basePath="/admin/candidates/collaborations" />
    </div>
  );
}
