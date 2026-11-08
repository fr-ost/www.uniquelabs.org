import type { Metadata } from "next";
import { ArrowDown, ArrowUp } from "lucide-react";
import { ConfirmAction } from "@/components/admin/confirm";
import { InlineSubmit } from "@/components/admin/form";
import { PrincipleForm } from "@/components/admin/forms/simple-forms";
import { AdminPageHeader, Panel, StatusBadge } from "@/components/admin/ui";
import { prisma } from "@/lib/db";
import { deletePrinciple, movePrinciple, savePrinciple } from "@/server/actions/content";
import { requireAdmin } from "@/lib/auth/guards";

export const metadata: Metadata = { title: "Philosophy principles" };

export default async function PrinciplesPage() {
  await requireAdmin();
  const principles = await prisma.principle.findMany({ orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }] });
  return (
    <div className="space-y-6">
      <AdminPageHeader
        breadcrumbs={[{ label: "Company", href: "/admin/company" }, { label: "Principles" }]}
        title="Philosophy principles"
        description="Shown on the homepage and About page, in this order."
      />
      <Panel title="Add a principle">
        <PrincipleForm action={savePrinciple.bind(null, null)} values={{ title: "", description: "", status: "PUBLISHED" }} submitLabel="Add principle" />
      </Panel>
      {principles.map((principle, index) => (
        <Panel
          key={principle.id}
          title={`${String(index + 1).padStart(2, "0")} — ${principle.title}`}
          actions={
            <>
              <StatusBadge status={principle.status} />
              <form action={movePrinciple.bind(null, principle.id, "up")}><InlineSubmit variant="ghost" title="Move up"><ArrowUp className="h-3.5 w-3.5" aria-label="Move up" /></InlineSubmit></form>
              <form action={movePrinciple.bind(null, principle.id, "down")}><InlineSubmit variant="ghost" title="Move down"><ArrowDown className="h-3.5 w-3.5" aria-label="Move down" /></InlineSubmit></form>
              <ConfirmAction action={deletePrinciple.bind(null, principle.id)} trigger="Delete" title={`Delete “${principle.title}”?`} confirmLabel="Delete" />
            </>
          }
        >
          <PrincipleForm action={savePrinciple.bind(null, principle.id)} values={{ title: principle.title, description: principle.description, status: principle.status }} submitLabel="Save" />
        </Panel>
      ))}
    </div>
  );
}
