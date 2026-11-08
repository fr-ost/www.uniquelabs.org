import type { Metadata } from "next";
import Link from "next/link";
import { Plus } from "lucide-react";
import { InlineSubmit } from "@/components/admin/form";
import { AdminButtonLink, AdminPageHeader, AdminTable, EmptyPanel, Pill, StatusBadge, Td, Th } from "@/components/admin/ui";
import { requireAdmin } from "@/lib/auth/guards";
import { prisma } from "@/lib/db";
import { formatCompact, formatEventDateTime, renderTimestamp } from "@/lib/market/format";
import { setTokenUnlockStatus } from "@/server/actions/intelligence";

export const metadata: Metadata = { title: "Token unlocks" };

export default async function UnlocksAdminPage() {
  await requireAdmin();
  const now = renderTimestamp();
  const unlocks = await prisma.tokenUnlock.findMany({ orderBy: { unlockAt: "desc" }, take: 400 });
  return (
    <div className="space-y-6">
      <AdminPageHeader
        breadcrumbs={[{ label: "Intelligence", href: "/admin/intelligence" }, { label: "Token unlocks" }]}
        title="Token unlocks"
        description="CoinMarketCap's API has no unlock calendar, so unlocks are curated here — each with a public source and owner verification."
        actions={
          <AdminButtonLink href="/admin/intelligence/unlocks/new" variant="primary">
            <Plus aria-hidden className="h-4 w-4" /> Add unlock
          </AdminButtonLink>
        }
      />
      {unlocks.length === 0 ? (
        <EmptyPanel title="No token unlocks yet" body="Add scheduled unlocks from vesting schedules, tokenomics documentation or official announcements." />
      ) : (
        <AdminTable minWidth="lg">
          <thead>
            <tr>
              <Th>Token</Th>
              <Th>Unlock</Th>
              <Th>Amount</Th>
              <Th>Status</Th>
              <Th className="text-right">Actions</Th>
            </tr>
          </thead>
          <tbody>
            {unlocks.map((u) => (
              <tr key={u.id} className={u.unlockAt.getTime() < now ? "opacity-60 hover:bg-white/[0.02]" : "hover:bg-white/[0.02]"}>
                <Td>
                  <Link href={`/admin/intelligence/unlocks/${u.id}`} className="font-medium text-ink-50 hover:underline">
                    {u.tokenName}
                  </Link>
                  <p className="text-xs text-ink-500">{u.tokenSymbol}</p>
                </Td>
                <Td className="text-xs text-ink-300">{formatEventDateTime(u.unlockAt.toISOString())}</Td>
                <Td className="text-xs text-ink-300">
                  {u.amount != null ? `${formatCompact(Number(u.amount))} ${u.tokenSymbol}` : "—"}
                  {u.percentOfSupply != null ? ` · ${Number(u.percentOfSupply)}%` : ""}
                </Td>
                <Td>
                  <div className="flex flex-wrap gap-1.5">
                    <StatusBadge status={u.status} />
                    {u.verifiedAt ? <Pill tone="good">Verified</Pill> : <Pill tone="warn">Unverified</Pill>}
                  </div>
                </Td>
                <Td>
                  <div className="flex justify-end gap-1.5">
                    {u.status === "PUBLISHED" ? (
                      <form action={setTokenUnlockStatus.bind(null, u.id, "DRAFT")}>
                        <InlineSubmit>Unpublish</InlineSubmit>
                      </form>
                    ) : u.verifiedAt ? (
                      <form action={setTokenUnlockStatus.bind(null, u.id, "PUBLISHED")}>
                        <InlineSubmit variant="primary">Publish</InlineSubmit>
                      </form>
                    ) : (
                      <AdminButtonLink href={`/admin/intelligence/unlocks/${u.id}`} size="sm">
                        Verify to publish
                      </AdminButtonLink>
                    )}
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
