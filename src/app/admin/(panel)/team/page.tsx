import type { Metadata } from "next";
import Link from "next/link";
import { ArrowDown, ArrowUp, Plus } from "lucide-react";
import { ConfirmAction } from "@/components/admin/confirm";
import { InlineSubmit } from "@/components/admin/form";
import { AdminButtonLink, AdminPageHeader, AdminTable, EmptyPanel, Pill, StatusBadge, Td, Th } from "@/components/admin/ui";
import { prisma } from "@/lib/db";
import { mediaUrl } from "@/lib/media/storage";
import { deleteTeamMember, moveTeamMember, setTeamMemberStatus } from "@/server/actions/content";

export const metadata: Metadata = { title: "Team members" };

export default async function AdminTeamPage() {
  const members = await prisma.teamMember.findMany({
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    include: { group: { select: { name: true } }, photo: { select: { id: true, fileName: true } } },
  });
  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Team members"
        description="The public team directory. Never add people without their consent."
        actions={
          <>
            <AdminButtonLink href="/admin/team/groups">Groups</AdminButtonLink>
            <AdminButtonLink href="/admin/team/new" variant="primary">
              <Plus aria-hidden className="h-4 w-4" /> Add member
            </AdminButtonLink>
          </>
        }
      />
      {members.length === 0 ? (
        <EmptyPanel title="No team members yet" body="Add the people behind Unique Labs. Profiles stay private until published." action={<AdminButtonLink href="/admin/team/new" variant="primary">Add member</AdminButtonLink>} />
      ) : (
        <AdminTable>
          <thead>
            <tr>
              <Th className="w-20">Order</Th>
              <Th>Person</Th>
              <Th>Group</Th>
              <Th>Status</Th>
              <Th className="text-right">Actions</Th>
            </tr>
          </thead>
          <tbody>
            {members.map((member) => (
              <tr key={member.id} className="hover:bg-white/[0.02]">
                <Td>
                  <div className="flex gap-1">
                    <form action={moveTeamMember.bind(null, member.id, "up")}><InlineSubmit variant="ghost" title="Move up"><ArrowUp className="h-3.5 w-3.5" aria-label="Move up" /></InlineSubmit></form>
                    <form action={moveTeamMember.bind(null, member.id, "down")}><InlineSubmit variant="ghost" title="Move down"><ArrowDown className="h-3.5 w-3.5" aria-label="Move down" /></InlineSubmit></form>
                  </div>
                </Td>
                <Td>
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 shrink-0 overflow-hidden rounded-full border border-white/10 bg-ink-800">
                      {member.photo ? (
                        // eslint-disable-next-line @next/next/no-img-element -- admin thumbnail
                        <img src={mediaUrl(member.photo)} alt="" className="h-full w-full object-cover" />
                      ) : (
                        <span className="flex h-full w-full items-center justify-center text-xs text-ink-300">{member.name.charAt(0)}</span>
                      )}
                    </div>
                    <div>
                      <Link href={`/admin/team/${member.id}`} className="font-medium text-ink-50 hover:underline">{member.name}</Link>
                      <p className="text-xs text-ink-500">{member.position}</p>
                    </div>
                  </div>
                </Td>
                <Td className="text-ink-300">
                  {member.group?.name ?? "—"}
                  {member.isLeadership ? <Pill tone="accent" className="ml-2">Leadership</Pill> : null}
                </Td>
                <Td>
                  <div className="flex flex-wrap gap-1.5">
                    <StatusBadge status={member.status} />
                    {member.memberType === "FORMER" ? <Pill>Former</Pill> : null}
                    {member.isPlaceholder ? <Pill tone="warn">Sample</Pill> : null}
                  </div>
                </Td>
                <Td>
                  <div className="flex justify-end gap-1.5">
                    {member.status === "PUBLISHED" ? (
                      <form action={setTeamMemberStatus.bind(null, member.id, "DRAFT")}><InlineSubmit>Hide</InlineSubmit></form>
                    ) : (
                      <form action={setTeamMemberStatus.bind(null, member.id, "PUBLISHED")}><InlineSubmit variant="primary">Publish</InlineSubmit></form>
                    )}
                    <ConfirmAction action={deleteTeamMember.bind(null, member.id)} trigger="Delete" title={`Delete ${member.name}?`} body="The profile is removed permanently." confirmLabel="Delete" />
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
