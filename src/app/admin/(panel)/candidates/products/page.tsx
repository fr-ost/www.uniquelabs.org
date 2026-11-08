import type { Metadata } from "next";
import { CandidatesList } from "@/components/admin/candidates-list";
import { AdminButtonLink, AdminPageHeader } from "@/components/admin/ui";
import type { CandidateStatus } from "@/generated/prisma/enums";
import { requireAdmin } from "@/lib/auth/guards";

export const metadata: Metadata = { title: "Product candidates" };

const STATUSES: CandidateStatus[] = ["PENDING", "APPROVED", "REJECTED", "ARCHIVED", "MERGED"];

export default async function ProductCandidatesPage({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  await requireAdmin();
  const raw = (await searchParams).status;
  const status = STATUSES.includes(raw as CandidateStatus) ? (raw as CandidateStatus) : "PENDING";
  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Product candidates"
        description="Products detected in your Claude history. Ideas, plans and unfinished work are labelled as such — only you decide what becomes a product, and approval never publishes automatically."
        actions={<AdminButtonLink href="/admin/imports/claude">New import</AdminButtonLink>}
      />
      <CandidatesList kind="PRODUCT" status={status} basePath="/admin/candidates/products" />
    </div>
  );
}
