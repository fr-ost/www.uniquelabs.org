import type { ReactNode } from "react";
import { AdminShell } from "@/components/admin/shell";
import { requireAdmin } from "@/lib/auth/guards";
import { prisma } from "@/lib/db";

export default async function AdminPanelLayout({ children }: { children: ReactNode }) {
  const session = await requireAdmin();
  const [productCandidates, collaborationCandidates, messages] = await Promise.all([
    prisma.importCandidate.count({ where: { kind: "PRODUCT", status: "PENDING" } }),
    prisma.importCandidate.count({ where: { kind: "COLLABORATION", status: "PENDING" } }),
    prisma.contactMessage.count({ where: { status: "NEW" } }),
  ]);
  return (
    <AdminShell user={session.user} counts={{ productCandidates, collaborationCandidates, messages }}>
      {children}
    </AdminShell>
  );
}
