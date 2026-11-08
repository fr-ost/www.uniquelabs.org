import type { Metadata } from "next";
import { ConfirmAction } from "@/components/admin/confirm";
import { PartnerForm } from "@/components/admin/forms/collaboration-form";
import { AdminPageHeader, Panel } from "@/components/admin/ui";
import { prisma } from "@/lib/db";
import { adminMediaSelect, toPicked } from "@/lib/admin/data";
import { deletePartner, savePartner } from "@/server/actions/collaborations";
import { requireAdmin } from "@/lib/auth/guards";

export const metadata: Metadata = { title: "Partners" };

export default async function PartnersPage() {
  await requireAdmin();
  const partners = await prisma.partner.findMany({
    orderBy: { name: "asc" },
    include: { logo: { select: adminMediaSelect }, _count: { select: { collaborations: true } } },
  });
  return (
    <div className="space-y-6">
      <AdminPageHeader
        breadcrumbs={[{ label: "Collaborations", href: "/admin/collaborations" }, { label: "Partners" }]}
        title="Partners"
        description="Partner organisations and people. Only partners linked to a published collaboration appear publicly."
      />
      <Panel title="Add a partner">
        <PartnerForm action={savePartner.bind(null, null)} submitLabel="Add partner" values={{ name: "", slug: "", description: "", websiteUrl: "", xHandle: "", logo: null }} />
      </Panel>
      <div className="space-y-3">
        {partners.map((partner) => (
          <Panel
            key={partner.id}
            title={partner.name}
            description={`${partner._count.collaborations} collaboration${partner._count.collaborations === 1 ? "" : "s"}${partner.xHandle ? ` · @${partner.xHandle}` : ""}`}
            actions={
              <ConfirmAction
                action={deletePartner.bind(null, partner.id)}
                trigger="Delete"
                title={`Delete “${partner.name}”?`}
                body="The partner is removed from all collaborations. The collaborations themselves are kept."
                confirmLabel="Delete partner"
              />
            }
          >
            <PartnerForm
              action={savePartner.bind(null, partner.id)}
              submitLabel="Save"
              values={{
                name: partner.name,
                slug: partner.slug,
                description: partner.description ?? "",
                websiteUrl: partner.websiteUrl ?? "",
                xHandle: partner.xHandle ?? "",
                logo: toPicked(partner.logo),
              }}
            />
          </Panel>
        ))}
      </div>
    </div>
  );
}
