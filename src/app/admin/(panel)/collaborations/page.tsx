import type { Metadata } from "next";
import Link from "next/link";
import { ArrowDown, ArrowUp, Eye, Plus, Star } from "lucide-react";
import { ConfirmAction } from "@/components/admin/confirm";
import { InlineSubmit } from "@/components/admin/form";
import { AdminButtonLink, AdminPageHeader, AdminTable, EmptyPanel, Pill, StatusBadge, Td, Th } from "@/components/admin/ui";
import { prisma } from "@/lib/db";
import { COLLABORATION_CATEGORY_LABELS } from "@/lib/labels";
import { formatDate } from "@/lib/utils";
import { deleteCollaboration, moveCollaboration, setCollaborationStatus, toggleCollaborationFeatured } from "@/server/actions/collaborations";

export const metadata: Metadata = { title: "Collaborations" };

export default async function AdminCollaborationsPage() {
  const items = await prisma.collaboration.findMany({
    orderBy: [{ sortOrder: "asc" }, { date: "desc" }],
    include: { partners: { include: { partner: { select: { name: true } } } }, _count: { select: { evidence: true } } },
  });
  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Collaborations"
        description="Partnerships and joint projects. Only Published + verified entries appear publicly."
        actions={
          <>
            <AdminButtonLink href="/admin/collaborations/partners">Partners</AdminButtonLink>
            <AdminButtonLink href="/admin/collaborations/new" variant="primary">
              <Plus aria-hidden className="h-4 w-4" /> New collaboration
            </AdminButtonLink>
          </>
        }
      />
      {items.length === 0 ? (
        <EmptyPanel
          title="No collaborations yet"
          body="Import your X archive to discover candidates, or add a collaboration manually."
          action={
            <div className="flex gap-2">
              <AdminButtonLink href="/admin/imports/x" variant="primary">Import X archive</AdminButtonLink>
              <AdminButtonLink href="/admin/collaborations/new">Add manually</AdminButtonLink>
            </div>
          }
        />
      ) : (
        <AdminTable minWidth="lg">
          <thead>
            <tr>
              <Th className="w-20">Order</Th>
              <Th>Collaboration</Th>
              <Th>Status</Th>
              <Th>Date</Th>
              <Th className="text-right">Actions</Th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id} className="hover:bg-white/[0.02]">
                <Td>
                  <div className="flex gap-1">
                    <form action={moveCollaboration.bind(null, item.id, "up")}>
                      <InlineSubmit variant="ghost" title="Move up"><ArrowUp className="h-3.5 w-3.5" aria-label="Move up" /></InlineSubmit>
                    </form>
                    <form action={moveCollaboration.bind(null, item.id, "down")}>
                      <InlineSubmit variant="ghost" title="Move down"><ArrowDown className="h-3.5 w-3.5" aria-label="Move down" /></InlineSubmit>
                    </form>
                  </div>
                </Td>
                <Td>
                  <Link href={`/admin/collaborations/${item.id}`} className="font-medium text-ink-50 hover:underline">{item.title}</Link>
                  <div className="mt-0.5 flex flex-wrap gap-1.5 text-xs text-ink-500">
                    <span>{COLLABORATION_CATEGORY_LABELS[item.category]}</span>
                    {item.partners.length ? <span>· {item.partners.map((p) => p.partner.name).join(", ")}</span> : null}
                    {item._count.evidence ? <Pill tone="info">Imported · {item._count.evidence} sources</Pill> : null}
                    {item.isPlaceholder ? <Pill tone="warn">Sample</Pill> : null}
                  </div>
                </Td>
                <Td>
                  <div className="flex flex-wrap gap-1.5">
                    <StatusBadge status={item.status} />
                    {item.verifiedAt ? <Pill tone="good">Verified</Pill> : <Pill tone="warn">Unverified</Pill>}
                    {item.featured ? <Pill tone="accent">Featured</Pill> : null}
                  </div>
                </Td>
                <Td className="text-xs text-ink-400">{item.date ? formatDate(item.date, item.datePrecision, "short") : "—"}</Td>
                <Td>
                  <div className="flex flex-wrap justify-end gap-1.5">
                    <form action={toggleCollaborationFeatured.bind(null, item.id)}>
                      <InlineSubmit variant="ghost" title="Toggle featured">
                        <Star className={item.featured ? "h-3.5 w-3.5 fill-signal-500 text-signal-500" : "h-3.5 w-3.5"} aria-label="Toggle featured" />
                      </InlineSubmit>
                    </form>
                    <a href={`/api/admin/preview?path=/collaborations/${item.slug}`} target="_blank" rel="noopener noreferrer" className="inline-flex h-8 items-center gap-1 rounded-lg px-2.5 text-xs text-ink-300 hover:bg-white/[0.05] hover:text-ink-50">
                      <Eye className="h-3.5 w-3.5" aria-hidden /> Preview
                    </a>
                    {item.status === "PUBLISHED" ? (
                      <form action={setCollaborationStatus.bind(null, item.id, "DRAFT")}><InlineSubmit>Unpublish</InlineSubmit></form>
                    ) : item.verifiedAt ? (
                      <form action={setCollaborationStatus.bind(null, item.id, "PUBLISHED")}><InlineSubmit variant="primary">Publish</InlineSubmit></form>
                    ) : (
                      <AdminButtonLink href={`/admin/collaborations/${item.id}`} size="sm">Verify to publish</AdminButtonLink>
                    )}
                    <ConfirmAction
                      action={deleteCollaboration.bind(null, item.id)}
                      trigger="Delete"
                      title={`Delete “${item.title}”?`}
                      body="The collaboration is removed permanently. Linked import candidates return to the review queue."
                      confirmLabel="Delete"
                    />
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
