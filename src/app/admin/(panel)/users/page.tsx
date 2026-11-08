import type { Metadata } from "next";
import { InlineSubmit } from "@/components/admin/form";
import { NewAdminUserForm } from "@/components/admin/forms/site-forms";
import { AdminPageHeader, AdminTable, Panel, Pill, Td, Th } from "@/components/admin/ui";
import { requireAdmin } from "@/lib/auth/guards";
import { prisma } from "@/lib/db";
import { formatDateTime } from "@/lib/utils";
import { createAdminUser, setAdminActive } from "@/server/actions/site";

export const metadata: Metadata = { title: "Admin users" };

export default async function UsersPage() {
  const session = await requireAdmin("OWNER");
  const users = await prisma.adminUser.findMany({ orderBy: { createdAt: "asc" } });
  return (
    <div className="space-y-6">
      <AdminPageHeader title="Admin users" description="There is no public registration. Owners create accounts here or with `npm run admin:create`." />
      <AdminTable>
        <thead>
          <tr>
            <Th>User</Th>
            <Th>Role</Th>
            <Th>Last sign-in</Th>
            <Th className="text-right">Actions</Th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id}>
              <Td>
                <p className="text-ink-100">{user.name}</p>
                <p className="text-xs text-ink-500">{user.email}</p>
              </Td>
              <Td>
                <div className="flex gap-1.5">
                  <Pill tone={user.role === "OWNER" ? "accent" : "neutral"}>{user.role === "OWNER" ? "Owner" : "Editor"}</Pill>
                  {!user.isActive ? <Pill tone="bad">Deactivated</Pill> : null}
                </div>
              </Td>
              <Td className="text-xs text-ink-400">{user.lastLoginAt ? formatDateTime(user.lastLoginAt) : "Never"}</Td>
              <Td className="text-right">
                {user.id === session.user.id ? (
                  <span className="text-xs text-ink-500">You</span>
                ) : (
                  <form action={setAdminActive.bind(null, user.id, !user.isActive)}>
                    <InlineSubmit variant={user.isActive ? "danger" : "secondary"}>{user.isActive ? "Deactivate" : "Reactivate"}</InlineSubmit>
                  </form>
                )}
              </Td>
            </tr>
          ))}
        </tbody>
      </AdminTable>
      <Panel title="Create an account">
        <NewAdminUserForm action={createAdminUser} />
      </Panel>
    </div>
  );
}
