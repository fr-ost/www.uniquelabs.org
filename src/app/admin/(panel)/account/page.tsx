import type { Metadata } from "next";
import { InlineSubmit } from "@/components/admin/form";
import { PasswordForm } from "@/components/admin/forms/site-forms";
import { AdminPageHeader, Panel, Pill } from "@/components/admin/ui";
import { requireAdmin } from "@/lib/auth/guards";
import { prisma } from "@/lib/db";
import { formatDateTime } from "@/lib/utils";
import { changePasswordAction, revokeSessionAction } from "@/server/actions/auth";

export const metadata: Metadata = { title: "Account & security" };

export default async function AccountPage() {
  const session = await requireAdmin();
  const sessions = await prisma.adminSession.findMany({
    where: { userId: session.user.id, expiresAt: { gt: new Date() } },
    orderBy: { lastSeenAt: "desc" },
  });
  return (
    <div className="space-y-6">
      <AdminPageHeader title="Account & security" description={`${session.user.name} · ${session.user.email} · ${session.user.role === "OWNER" ? "Owner" : "Editor"}`} />
      <Panel title="Change password" description="Changing your password signs out all other sessions.">
        <PasswordForm action={changePasswordAction} />
      </Panel>
      <Panel title="Active sessions" description="Sessions expire automatically after inactivity.">
        <ul className="divide-y divide-white/[0.06]">
          {sessions.map((s) => (
            <li key={s.id} className="flex flex-col gap-2 py-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0">
                <p className="truncate text-sm text-ink-200">{s.userAgent ?? "Unknown browser"}</p>
                <p className="text-xs text-ink-500">
                  Signed in {formatDateTime(s.createdAt)} · last active {formatDateTime(s.lastSeenAt)}
                </p>
              </div>
              {s.id === session.sessionId ? (
                <Pill tone="good">This session</Pill>
              ) : (
                <form action={revokeSessionAction.bind(null, s.id)}>
                  <InlineSubmit variant="danger">Sign out</InlineSubmit>
                </form>
              )}
            </li>
          ))}
        </ul>
      </Panel>
    </div>
  );
}
