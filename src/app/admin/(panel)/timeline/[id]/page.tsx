import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ConfirmAction } from "@/components/admin/confirm";
import { MilestoneForm } from "@/components/admin/forms/content-forms";
import { AdminPageHeader, Pill, StatusBadge } from "@/components/admin/ui";
import { prisma } from "@/lib/db";
import { adminMediaSelect, toDateInputValue, toPicked } from "@/lib/admin/data";
import { deleteMilestone, saveMilestone } from "@/server/actions/content";

export const metadata: Metadata = { title: "Edit milestone" };

export default async function EditMilestonePage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ created?: string; needsVerification?: string }> }) {
  const [{ id }, sp] = await Promise.all([params, searchParams]);
  const isNew = id === "new";
  const [milestone, products, collaborations] = await Promise.all([
    isNew ? null : prisma.companyMilestone.findUnique({ where: { id }, include: { image: { select: adminMediaSelect } } }),
    prisma.product.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } }),
    prisma.collaboration.findMany({ orderBy: { title: "asc" }, select: { id: true, title: true } }),
  ]);
  if (!isNew && !milestone) notFound();

  return (
    <div className="space-y-6">
      <AdminPageHeader
        breadcrumbs={[{ label: "Timeline", href: "/admin/timeline" }, { label: isNew ? "New" : (milestone?.title ?? "") }]}
        title={isNew ? "Add milestone" : milestone!.title}
        actions={
          milestone ? (
            <>
              <StatusBadge status={milestone.status} />
              {milestone.verifiedAt ? <Pill tone="good">Verified</Pill> : <Pill tone="warn">Unverified</Pill>}
              <ConfirmAction action={deleteMilestone.bind(null, milestone.id)} trigger="Delete" size="md" title={`Delete “${milestone.title}”?`} confirmLabel="Delete" />
            </>
          ) : null
        }
      />
      {sp.created ? <p className="rounded-lg border border-live/30 bg-live/10 px-4 py-2 text-sm text-live">Milestone added.</p> : null}
      {sp.needsVerification ? <p className="rounded-lg border border-beta/30 bg-beta/10 px-4 py-2 text-sm text-beta">Mark this milestone as verified before publishing it.</p> : null}
      <MilestoneForm
        action={saveMilestone.bind(null, milestone?.id ?? null)}
        isNew={isNew}
        products={products.map((p) => ({ value: p.id, label: p.name }))}
        collaborations={collaborations.map((c) => ({ value: c.id, label: c.title }))}
        values={{
          title: milestone?.title ?? "",
          slug: milestone?.slug ?? "",
          description: milestone?.description ?? "",
          date: toDateInputValue(milestone?.date),
          datePrecision: milestone?.datePrecision ?? "DAY",
          kind: milestone?.kind ?? "MILESTONE",
          image: toPicked(milestone?.image),
          productId: milestone?.productId ?? "",
          collaborationId: milestone?.collaborationId ?? "",
          sourceUrl: milestone?.sourceUrl ?? "",
          sourceLabel: milestone?.sourceLabel ?? "",
          featured: milestone?.featured ?? false,
          verified: Boolean(milestone?.verifiedAt),
          status: milestone?.status ?? "DRAFT",
        }}
      />
    </div>
  );
}
