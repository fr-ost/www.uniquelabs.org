import type { Metadata } from "next";
import Link from "next/link";
import { AdminPageHeader, AdminTable, EmptyPanel, Pill, Td, Th } from "@/components/admin/ui";
import { prisma } from "@/lib/db";
import { INQUIRY_TYPE_LABELS } from "@/lib/labels";
import { formatDateTime, truncate } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { requireAdmin } from "@/lib/auth/guards";

export const metadata: Metadata = { title: "Messages" };

const FILTERS = [
  { key: "inbox", label: "Inbox", where: { status: { in: ["NEW", "READ"] as Array<"NEW" | "READ"> } } },
  { key: "archived", label: "Archived", where: { status: "ARCHIVED" as const } },
  { key: "spam", label: "Spam", where: { status: "SPAM" as const } },
];

export default async function MessagesPage({ searchParams }: { searchParams: Promise<{ view?: string }> }) {
  await requireAdmin();
  const view = (await searchParams).view ?? "inbox";
  const filter = FILTERS.find((f) => f.key === view) ?? FILTERS[0]!;
  const messages = await prisma.contactMessage.findMany({ where: filter.where, orderBy: { createdAt: "desc" }, take: 200 });
  return (
    <div className="space-y-6">
      <AdminPageHeader title="Messages" description="Contact form submissions. Suspected spam is filed separately, never silently discarded." />
      <nav className="flex gap-2" aria-label="Message folders">
        {FILTERS.map((f) => (
          <Link
            key={f.key}
            href={`/admin/messages?view=${f.key}`}
            className={cn("rounded-lg px-3 py-1.5 text-sm", f.key === filter.key ? "bg-white/[0.08] text-ink-50" : "text-ink-400 hover:text-ink-100")}
          >
            {f.label}
          </Link>
        ))}
      </nav>
      {messages.length === 0 ? (
        <EmptyPanel title="No messages here" />
      ) : (
        <AdminTable>
          <thead>
            <tr>
              <Th>From</Th>
              <Th>Subject</Th>
              <Th>Type</Th>
              <Th>Received</Th>
            </tr>
          </thead>
          <tbody>
            {messages.map((message) => (
              <tr key={message.id} className="hover:bg-white/[0.02]">
                <Td>
                  <Link href={`/admin/messages/${message.id}`} className={message.status === "NEW" ? "font-semibold text-ink-50" : "text-ink-200"}>
                    {message.name}
                  </Link>
                  <p className="text-xs text-ink-500">{message.email}</p>
                </Td>
                <Td>
                  <Link href={`/admin/messages/${message.id}`} className="hover:underline">
                    {message.status === "NEW" ? <Pill tone="accent" className="mr-2">New</Pill> : null}
                    {truncate(message.subject, 80)}
                  </Link>
                </Td>
                <Td className="text-xs text-ink-400">{INQUIRY_TYPE_LABELS[message.inquiryType]}</Td>
                <Td className="whitespace-nowrap text-xs text-ink-400">{formatDateTime(message.createdAt)}</Td>
              </tr>
            ))}
          </tbody>
        </AdminTable>
      )}
    </div>
  );
}
