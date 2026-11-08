import type { Metadata } from "next";
import Link from "next/link";
import { Plus } from "lucide-react";
import { ConfirmAction } from "@/components/admin/confirm";
import { InlineSubmit } from "@/components/admin/form";
import { AdminButtonLink, AdminPageHeader, AdminTable, EmptyPanel, Pill, StatusBadge, Td, Th } from "@/components/admin/ui";
import { prisma } from "@/lib/db";
import { MILESTONE_KIND_LABELS } from "@/lib/labels";
import { formatDate } from "@/lib/utils";
import { deleteMilestone, setMilestoneStatus } from "@/server/actions/content";

export const metadata: Metadata = { title: "Company timeline" };

export default async function AdminTimelinePage() {
  const milestones = await prisma.companyMilestone.findMany({
    orderBy: [{ date: "desc" }],
    include: { product: { select: { name: true } }, collaboration: { select: { title: true } } },
  });
  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Company timeline"
        description="Milestones for the Journey page, ordered by date. Only verified milestones can be published."
        actions={
          <AdminButtonLink href="/admin/timeline/new" variant="primary">
            <Plus aria-hidden className="h-4 w-4" /> Add milestone
          </AdminButtonLink>
        }
      />
      {milestones.length === 0 ? (
        <EmptyPanel title="No milestones yet" body="Record verified moments: establishment, launches, collaborations, new platforms." action={<AdminButtonLink href="/admin/timeline/new" variant="primary">Add milestone</AdminButtonLink>} />
      ) : (
        <AdminTable>
          <thead>
            <tr>
              <Th>Date</Th>
              <Th>Milestone</Th>
              <Th>Status</Th>
              <Th className="text-right">Actions</Th>
            </tr>
          </thead>
          <tbody>
            {milestones.map((milestone) => (
              <tr key={milestone.id} className="hover:bg-white/[0.02]">
                <Td className="whitespace-nowrap text-xs text-ink-400">{formatDate(milestone.date, milestone.datePrecision, "short")}</Td>
                <Td>
                  <Link href={`/admin/timeline/${milestone.id}`} className="font-medium text-ink-50 hover:underline">{milestone.title}</Link>
                  <p className="text-xs text-ink-500">
                    {MILESTONE_KIND_LABELS[milestone.kind]}
                    {milestone.product ? ` · ${milestone.product.name}` : ""}
                    {milestone.collaboration ? ` · ${milestone.collaboration.title}` : ""}
                  </p>
                </Td>
                <Td>
                  <div className="flex flex-wrap gap-1.5">
                    <StatusBadge status={milestone.status} />
                    {milestone.verifiedAt ? <Pill tone="good">Verified</Pill> : <Pill tone="warn">Unverified</Pill>}
                    {milestone.featured ? <Pill tone="accent">Featured</Pill> : null}
                    {milestone.isPlaceholder ? <Pill tone="warn">Sample</Pill> : null}
                  </div>
                </Td>
                <Td>
                  <div className="flex justify-end gap-1.5">
                    {milestone.status === "PUBLISHED" ? (
                      <form action={setMilestoneStatus.bind(null, milestone.id, "DRAFT")}><InlineSubmit>Unpublish</InlineSubmit></form>
                    ) : milestone.verifiedAt ? (
                      <form action={setMilestoneStatus.bind(null, milestone.id, "PUBLISHED")}><InlineSubmit variant="primary">Publish</InlineSubmit></form>
                    ) : (
                      <AdminButtonLink href={`/admin/timeline/${milestone.id}`} size="sm">Verify to publish</AdminButtonLink>
                    )}
                    <ConfirmAction action={deleteMilestone.bind(null, milestone.id)} trigger="Delete" title={`Delete “${milestone.title}”?`} confirmLabel="Delete" />
                  </div>
                </Td>
              </tr>
            ))}
          </tbody>
        </AdminTable>
      )}
    </div>
  );
}
