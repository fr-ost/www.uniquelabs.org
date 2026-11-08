import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Eye } from "lucide-react";
import { ConfirmAction } from "@/components/admin/confirm";
import { TeamMemberForm } from "@/components/admin/forms/content-forms";
import { AdminPageHeader, StatusBadge } from "@/components/admin/ui";
import { prisma } from "@/lib/db";
import { adminMediaSelect, toDateInputValue, toPicked } from "@/lib/admin/data";
import { deleteTeamMember, saveTeamMember } from "@/server/actions/content";

export const metadata: Metadata = { title: "Edit team member" };

export default async function EditTeamMemberPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ created?: string }> }) {
  const [{ id }, sp] = await Promise.all([params, searchParams]);
  const isNew = id === "new";
  const [member, groups] = await Promise.all([
    isNew ? null : prisma.teamMember.findUnique({ where: { id }, include: { photo: { select: adminMediaSelect } } }),
    prisma.teamGroup.findMany({ orderBy: [{ sortOrder: "asc" }, { name: "asc" }] }),
  ]);
  if (!isNew && !member) notFound();

  return (
    <div className="space-y-6">
      <AdminPageHeader
        breadcrumbs={[{ label: "Team", href: "/admin/team" }, { label: isNew ? "New" : (member?.name ?? "") }]}
        title={isNew ? "Add team member" : member!.name}
        actions={
          member ? (
            <>
              <StatusBadge status={member.status} />
              {member.hasProfilePage ? (
                <a href={`/api/admin/preview?path=/team/${member.slug}`} target="_blank" rel="noopener noreferrer" className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-white/12 px-3 text-sm text-ink-100 hover:border-white/25">
                  <Eye aria-hidden className="h-4 w-4" /> Preview
                </a>
              ) : null}
              <ConfirmAction action={deleteTeamMember.bind(null, member.id)} trigger="Delete" size="md" title={`Delete ${member.name}?`} confirmLabel="Delete" />
            </>
          ) : null
        }
      />
      {sp.created ? <p className="rounded-lg border border-live/30 bg-live/10 px-4 py-2 text-sm text-live">Team member added.</p> : null}
      <TeamMemberForm
        action={saveTeamMember.bind(null, member?.id ?? null)}
        isNew={isNew}
        groups={groups.map((g) => ({ value: g.id, label: g.name }))}
        values={{
          name: member?.name ?? "",
          slug: member?.slug ?? "",
          position: member?.position ?? "",
          shortBio: member?.shortBio ?? "",
          bio: member?.bio ?? "",
          responsibilities: member?.responsibilities.join("\n") ?? "",
          expertise: member?.expertise.join(", ") ?? "",
          photo: toPicked(member?.photo),
          linkedinUrl: member?.linkedinUrl ?? "",
          xUrl: member?.xUrl ?? "",
          githubUrl: member?.githubUrl ?? "",
          websiteUrl: member?.websiteUrl ?? "",
          joinDate: toDateInputValue(member?.joinDate),
          joinDatePrecision: member?.joinDatePrecision ?? "MONTH",
          joinDateVerified: member?.joinDateVerified ?? false,
          memberType: member?.memberType ?? "CURRENT",
          isLeadership: member?.isLeadership ?? false,
          hasProfilePage: member?.hasProfilePage ?? true,
          groupId: member?.groupId ?? "",
          status: member?.status ?? "DRAFT",
        }}
      />
    </div>
  );
}
