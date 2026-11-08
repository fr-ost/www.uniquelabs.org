import "server-only";
import { redirect } from "next/navigation";
import { getSession, type AdminSessionInfo } from "@/lib/auth/session";
import type { AdminRole } from "@/generated/prisma/enums";

/**
 * Server-side authorization for admin pages AND server actions.
 * Never rely on the proxy alone: every admin entry point calls this.
 */
export async function requireAdmin(role?: AdminRole): Promise<AdminSessionInfo> {
  const session = await getSession();
  if (!session) {
    redirect("/admin/login");
  }
  if (role === "OWNER" && session.user.role !== "OWNER") {
    redirect("/admin?denied=owner");
  }
  return session;
}

export function isOwner(session: AdminSessionInfo): boolean {
  return session.user.role === "OWNER";
}
