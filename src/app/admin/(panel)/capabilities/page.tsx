import type { Metadata } from "next";
import Link from "next/link";
import { ArrowDown, ArrowUp, Plus } from "lucide-react";
import { ConfirmAction } from "@/components/admin/confirm";
import { InlineSubmit } from "@/components/admin/form";
import { AdminButtonLink, AdminPageHeader, AdminTable, EmptyPanel, Pill, StatusBadge, Td, Th } from "@/components/admin/ui";
import { CapabilityIconView } from "@/components/visuals/capability-icon";
import { prisma } from "@/lib/db";
import { deleteCapability, moveCapability, publishAllDraftCapabilities, setCapabilityStatus } from "@/server/actions/content";

export const metadata: Metadata = { title: "What We Do" };

export default async function AdminCapabilitiesPage() {
  const capabilities = await prisma.capability.findMany({ orderBy: [{ sortOrder: "asc" }, { title: "asc" }], include: { _count: { select: { products: true } } } });
  const drafts = capabilities.filter((c) => c.status === "DRAFT").length;
  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="What We Do"
        description="Areas of focus shown on the What We Do page and homepage."
        actions={
          <AdminButtonLink href="/admin/capabilities/new" variant="primary">
            <Plus aria-hidden className="h-4 w-4" /> Add focus area
          </AdminButtonLink>
        }
      />
      {drafts > 0 ? (
        <div className="flex flex-col gap-3 rounded-2xl border border-beta/30 bg-beta/[0.06] p-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-ink-200">
            <strong className="text-beta">{drafts} focus area{drafts === 1 ? "" : "s"}</strong> from your brief {drafts === 1 ? "is" : "are"} waiting for review. They describe areas of focus,
            not completed projects — edit anything that doesn&apos;t fit, then publish.
          </p>
          <ConfirmAction
            action={publishAllDraftCapabilities}
            trigger="Publish all drafts"
            triggerVariant="primary"
            variant="primary"
            title="Publish all draft focus areas?"
            body="Every focus area currently in draft becomes visible on the website. You can unpublish any of them later."
            confirmLabel="Publish all"
          />
        </div>
      ) : null}
      {capabilities.length === 0 ? (
        <EmptyPanel title="No focus areas yet" action={<AdminButtonLink href="/admin/capabilities/new" variant="primary">Add focus area</AdminButtonLink>} />
      ) : (
        <AdminTable>
          <thead>
            <tr>
              <Th className="w-20">Order</Th>
              <Th>Focus area</Th>
              <Th>Status</Th>
              <Th className="text-right">Actions</Th>
            </tr>
          </thead>
          <tbody>
            {capabilities.map((capability) => (
              <tr key={capability.id} className="hover:bg-white/[0.02]">
                <Td>
                  <div className="flex gap-1">
                    <form action={moveCapability.bind(null, capability.id, "up")}><InlineSubmit variant="ghost" title="Move up"><ArrowUp className="h-3.5 w-3.5" aria-label="Move up" /></InlineSubmit></form>
                    <form action={moveCapability.bind(null, capability.id, "down")}><InlineSubmit variant="ghost" title="Move down"><ArrowDown className="h-3.5 w-3.5" aria-label="Move down" /></InlineSubmit></form>
                  </div>
                </Td>
                <Td>
                  <div className="flex items-center gap-3">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-ink-800 text-ink-200">
                      <CapabilityIconView name={capability.icon} className="h-4 w-4" />
                    </span>
                    <div>
                      <Link href={`/admin/capabilities/${capability.id}`} className="font-medium text-ink-50 hover:underline">{capability.title}</Link>
                      <p className="line-clamp-1 text-xs text-ink-500">{capability.summary}</p>
                    </div>
                  </div>
                </Td>
                <Td>
                  <div className="flex flex-wrap gap-1.5">
                    <StatusBadge status={capability.status} />
                    {capability.featured ? <Pill tone="accent">Homepage</Pill> : null}
                    {capability._count.products ? <Pill>{capability._count.products} products</Pill> : null}
                  </div>
                </Td>
                <Td>
                  <div className="flex justify-end gap-1.5">
                    {capability.status === "PUBLISHED" ? (
                      <form action={setCapabilityStatus.bind(null, capability.id, "DRAFT")}><InlineSubmit>Unpublish</InlineSubmit></form>
                    ) : (
                      <form action={setCapabilityStatus.bind(null, capability.id, "PUBLISHED")}><InlineSubmit variant="primary">Publish</InlineSubmit></form>
                    )}
                    <ConfirmAction action={deleteCapability.bind(null, capability.id)} trigger="Delete" title={`Delete “${capability.title}”?`} confirmLabel="Delete" />
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
