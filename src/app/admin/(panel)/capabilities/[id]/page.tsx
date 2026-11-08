import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ConfirmAction } from "@/components/admin/confirm";
import { CapabilityForm } from "@/components/admin/forms/content-forms";
import { AdminPageHeader, StatusBadge } from "@/components/admin/ui";
import { prisma } from "@/lib/db";
import { deleteCapability, saveCapability } from "@/server/actions/content";

export const metadata: Metadata = { title: "Edit focus area" };

export default async function EditCapabilityPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ created?: string }> }) {
  const [{ id }, sp] = await Promise.all([params, searchParams]);
  const isNew = id === "new";
  const [capability, products] = await Promise.all([
    isNew ? null : prisma.capability.findUnique({ where: { id }, include: { products: { select: { id: true } } } }),
    prisma.product.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } }),
  ]);
  if (!isNew && !capability) notFound();
  return (
    <div className="space-y-6">
      <AdminPageHeader
        breadcrumbs={[{ label: "What We Do", href: "/admin/capabilities" }, { label: isNew ? "New" : (capability?.title ?? "") }]}
        title={isNew ? "Add focus area" : capability!.title}
        actions={
          capability ? (
            <>
              <StatusBadge status={capability.status} />
              <ConfirmAction action={deleteCapability.bind(null, capability.id)} trigger="Delete" size="md" title={`Delete “${capability.title}”?`} confirmLabel="Delete" />
            </>
          ) : null
        }
      />
      {sp.created ? <p className="rounded-lg border border-live/30 bg-live/10 px-4 py-2 text-sm text-live">Focus area added.</p> : null}
      <CapabilityForm
        action={saveCapability.bind(null, capability?.id ?? null)}
        isNew={isNew}
        products={products.map((p) => ({ value: p.id, label: p.name }))}
        values={{
          title: capability?.title ?? "",
          slug: capability?.slug ?? "",
          summary: capability?.summary ?? "",
          description: capability?.description ?? "",
          icon: capability?.icon ?? "sparkles",
          featured: capability?.featured ?? false,
          status: capability?.status ?? "DRAFT",
          productIds: capability?.products.map((p) => p.id) ?? [],
        }}
      />
    </div>
  );
}
