import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Eye } from "lucide-react";
import { ConfirmAction } from "@/components/admin/confirm";
import { CollaborationForm } from "@/components/admin/forms/collaboration-form";
import { EvidenceList } from "@/components/admin/evidence-list";
import { AdminPageHeader, Panel, Pill, StatusBadge } from "@/components/admin/ui";
import { prisma } from "@/lib/db";
import { adminMediaSelect, toDateInputValue, toPicked } from "@/lib/admin/data";
import { deleteCollaboration, saveCollaboration } from "@/server/actions/collaborations";
import { requireAdmin } from "@/lib/auth/guards";

export const metadata: Metadata = { title: "Edit collaboration" };

export default async function EditCollaborationPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ created?: string; needsVerification?: string }>;
}) {
  await requireAdmin();
  const [{ id }, sp] = await Promise.all([params, searchParams]);
  const isNew = id === "new";
  const [record, partners, products] = await Promise.all([
    isNew
      ? null
      : prisma.collaboration.findUnique({
          where: { id },
          include: {
            cover: { select: adminMediaSelect },
            partners: { orderBy: { sortOrder: "asc" } },
            products: { select: { id: true } },
            evidence: { orderBy: { sourceTimestamp: "asc" } },
          },
        }),
    prisma.partner.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } }),
    prisma.product.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } }),
  ]);
  if (!isNew && !record) notFound();

  return (
    <div className="space-y-6">
      <AdminPageHeader
        breadcrumbs={[{ label: "Collaborations", href: "/admin/collaborations" }, { label: isNew ? "New" : (record?.title ?? "") }]}
        title={isNew ? "New collaboration" : record!.title}
        actions={
          record ? (
            <>
              <StatusBadge status={record.status} />
              {record.verifiedAt ? <Pill tone="good">Verified</Pill> : <Pill tone="warn">Unverified</Pill>}
              <a href={`/api/admin/preview?path=/collaborations/${record.slug}`} target="_blank" rel="noopener noreferrer" className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-white/12 px-3 text-sm text-ink-100 hover:border-white/25">
                <Eye aria-hidden className="h-4 w-4" /> Preview
              </a>
              <ConfirmAction action={deleteCollaboration.bind(null, record.id)} trigger="Delete" size="md" title={`Delete “${record.title}”?`} confirmLabel="Delete" />
            </>
          ) : null
        }
      />
      {sp.created ? <p className="rounded-lg border border-live/30 bg-live/10 px-4 py-2 text-sm text-live">Collaboration created.</p> : null}
      {sp.needsVerification ? <p className="rounded-lg border border-beta/30 bg-beta/10 px-4 py-2 text-sm text-beta">Mark this collaboration as verified before publishing it.</p> : null}
      <div className="grid gap-6 xl:grid-cols-[1fr_20rem]">
        <CollaborationForm
          action={saveCollaboration.bind(null, record?.id ?? null)}
          isNew={isNew}
          partners={partners.map((p) => ({ value: p.id, label: p.name }))}
          products={products.map((p) => ({ value: p.id, label: p.name }))}
          values={{
            title: record?.title ?? "",
            slug: record?.slug ?? "",
            summary: record?.summary ?? "",
            description: record?.description ?? "",
            category: record?.category ?? "OTHER",
            date: toDateInputValue(record?.date),
            datePrecision: record?.datePrecision ?? "DAY",
            sourceUrl: record?.sourceUrl ?? "",
            sourceLabel: record?.sourceLabel ?? "",
            externalUrl: record?.externalUrl ?? "",
            cover: toPicked(record?.cover),
            featured: record?.featured ?? false,
            verified: Boolean(record?.verifiedAt),
            status: record?.status ?? "DRAFT",
            partnerIds: record?.partners.map((p) => p.partnerId) ?? [],
            productIds: record?.products.map((p) => p.id) ?? [],
          }}
        />
        {record && record.evidence.length > 0 ? (
          <aside>
            <Panel title="Source evidence" description="Private provenance from the X archive import.">
              <EvidenceList evidence={record.evidence} />
            </Panel>
          </aside>
        ) : null}
      </div>
    </div>
  );
}
