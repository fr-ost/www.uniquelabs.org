import type { Metadata } from "next";
import Link from "next/link";
import { AdminPageHeader, AdminTable, EmptyPanel, Td, Th } from "@/components/admin/ui";
import { inputClass } from "@/components/admin/form";
import { prisma } from "@/lib/db";
import { formatDateTime } from "@/lib/utils";
import { requireAdmin } from "@/lib/auth/guards";

export const metadata: Metadata = { title: "Audit logs" };

export default async function AuditPage({ searchParams }: { searchParams: Promise<{ q?: string; page?: string }> }) {
  await requireAdmin();
  const sp = await searchParams;
  const q = (sp.q ?? "").trim().slice(0, 80);
  const page = Math.max(1, Number(sp.page) || 1);
  const take = 50;
  const where = q
    ? {
        OR: [
          { action: { contains: q, mode: "insensitive" as const } },
          { summary: { contains: q, mode: "insensitive" as const } },
          { actorLabel: { contains: q, mode: "insensitive" as const } },
          { entityType: { contains: q, mode: "insensitive" as const } },
        ],
      }
    : {};
  const [entries, total] = await Promise.all([
    prisma.auditLog.findMany({ where, orderBy: { createdAt: "desc" }, skip: (page - 1) * take, take }),
    prisma.auditLog.count({ where }),
  ]);
  const pages = Math.max(1, Math.ceil(total / take));
  return (
    <div className="space-y-6">
      <AdminPageHeader title="Audit logs" description="An append-only record of administrative actions, sign-ins and imports. IP addresses are stored only as keyed hashes." />
      <form className="max-w-sm" role="search">
        <input name="q" defaultValue={q} placeholder="Filter by action, person or text…" className={inputClass} aria-label="Filter audit log" />
      </form>
      {entries.length === 0 ? (
        <EmptyPanel title="No entries" />
      ) : (
        <AdminTable>
          <thead>
            <tr>
              <Th>When</Th>
              <Th>Who</Th>
              <Th>Action</Th>
              <Th>Summary</Th>
            </tr>
          </thead>
          <tbody>
            {entries.map((entry) => (
              <tr key={entry.id}>
                <Td className="whitespace-nowrap text-xs text-ink-400">{formatDateTime(entry.createdAt)}</Td>
                <Td className="text-xs text-ink-300">{entry.actorLabel}</Td>
                <Td className="font-mono text-xs text-ink-400">{entry.action}</Td>
                <Td>{entry.summary}</Td>
              </tr>
            ))}
          </tbody>
        </AdminTable>
      )}
      {pages > 1 ? (
        <nav className="flex items-center justify-between text-sm" aria-label="Pagination">
          {page > 1 ? <Link href={`/admin/audit?q=${encodeURIComponent(q)}&page=${page - 1}`} className="text-ink-300 hover:text-ink-50">← Newer</Link> : <span />}
          <span className="text-ink-500">Page {page} of {pages}</span>
          {page < pages ? <Link href={`/admin/audit?q=${encodeURIComponent(q)}&page=${page + 1}`} className="text-ink-300 hover:text-ink-50">Older →</Link> : <span />}
        </nav>
      ) : null}
    </div>
  );
}
