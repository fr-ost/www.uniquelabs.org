import type { Metadata } from "next";
import { ArrowDown, ArrowUp } from "lucide-react";
import { ConfirmAction } from "@/components/admin/confirm";
import { InlineSubmit } from "@/components/admin/form";
import { NamedItemForm } from "@/components/admin/forms/simple-forms";
import { AdminPageHeader, Panel } from "@/components/admin/ui";
import { prisma } from "@/lib/db";
import { deleteTeamGroup, moveTeamGroup, saveTeamGroup } from "@/server/actions/content";
import { requireAdmin } from "@/lib/auth/guards";

export const metadata: Metadata = { title: "Team groups" };

export default async function TeamGroupsPage() {
  await requireAdmin();
  const groups = await prisma.teamGroup.findMany({ orderBy: [{ sortOrder: "asc" }, { name: "asc" }], include: { _count: { select: { members: true } } } });
  return (
    <div className="space-y-6">
      <AdminPageHeader breadcrumbs={[{ label: "Team", href: "/admin/team" }, { label: "Groups" }]} title="Team groups" description="Custom groupings for the team page, shown in this order." />
      <Panel title="Add a group">
        <NamedItemForm action={saveTeamGroup.bind(null, null)} values={{ name: "", slug: "", description: "" }} submitLabel="Add group" />
      </Panel>
      {groups.map((group) => (
        <Panel
          key={group.id}
          title={group.name}
          description={`${group._count.members} member${group._count.members === 1 ? "" : "s"}`}
          actions={
            <>
              <form action={moveTeamGroup.bind(null, group.id, "up")}><InlineSubmit variant="ghost" title="Move up"><ArrowUp className="h-3.5 w-3.5" aria-label="Move up" /></InlineSubmit></form>
              <form action={moveTeamGroup.bind(null, group.id, "down")}><InlineSubmit variant="ghost" title="Move down"><ArrowDown className="h-3.5 w-3.5" aria-label="Move down" /></InlineSubmit></form>
              <ConfirmAction action={deleteTeamGroup.bind(null, group.id)} trigger="Delete" title={`Delete “${group.name}”?`} body="Members are kept and become ungrouped." confirmLabel="Delete group" />
            </>
          }
        >
          <NamedItemForm action={saveTeamGroup.bind(null, group.id)} values={{ name: group.name, slug: group.slug, description: group.description ?? "" }} submitLabel="Save" />
        </Panel>
      ))}
    </div>
  );
}
