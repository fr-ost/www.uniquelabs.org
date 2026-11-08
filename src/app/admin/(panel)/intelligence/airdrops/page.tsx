import type { Metadata } from "next";
import Link from "next/link";
import { Plus } from "lucide-react";
import { InlineSubmit } from "@/components/admin/form";
import { AdminButtonLink, AdminPageHeader, AdminTable, EmptyPanel, Pill, StatusBadge, Td, Th } from "@/components/admin/ui";
import { requireAdmin } from "@/lib/auth/guards";
import { prisma } from "@/lib/db";
import { airdropStatus } from "@/lib/market/normalize";
import { formatEventDate, renderTimestamp } from "@/lib/market/format";
import { setAirdropStatus } from "@/server/actions/intelligence";

export const metadata: Metadata = { title: "Airdrops" };

const PHASE_LABEL = { ONGOING: "Live", UPCOMING: "Upcoming", ENDED: "Ended" } as const;

export default async function AirdropsAdminPage() {
  await requireAdmin();
  const now = renderTimestamp();
  const airdrops = await prisma.airdrop.findMany({ orderBy: [{ status: "asc" }, { endsAt: "desc" }, { createdAt: "desc" }], take: 300 });
  return (
    <div className="space-y-6">
      <AdminPageHeader
        breadcrumbs={[{ label: "Intelligence", href: "/admin/intelligence" }, { label: "Airdrops" }]}
        title="Airdrops"
        description="Curated airdrops appear on the Intelligence page next to CoinMarketCap's feed. Only verified entries can be published."
        actions={
          <AdminButtonLink href="/admin/intelligence/airdrops/new" variant="primary">
            <Plus aria-hidden className="h-4 w-4" /> Add airdrop
          </AdminButtonLink>
        }
      />
      {airdrops.length === 0 ? (
        <EmptyPanel title="No curated airdrops yet" body="Add airdrops announced on official project channels. Visitors are sent to the official link you provide." />
      ) : (
        <AdminTable minWidth="lg">
          <thead>
            <tr>
              <Th>Project</Th>
              <Th>Dates</Th>
              <Th>Phase</Th>
              <Th>Status</Th>
              <Th className="text-right">Actions</Th>
            </tr>
          </thead>
          <tbody>
            {airdrops.map((a) => {
              const phase = airdropStatus(a.startsAt?.toISOString() ?? null, a.endsAt?.toISOString() ?? null, now);
              return (
                <tr key={a.id} className="hover:bg-white/[0.02]">
                  <Td>
                    <Link href={`/admin/intelligence/airdrops/${a.id}`} className="font-medium text-ink-50 hover:underline">
                      {a.projectName}
                    </Link>
                    <p className="text-xs text-ink-500">{a.tokenSymbol ?? "—"}</p>
                  </Td>
                  <Td className="text-xs text-ink-300">
                    {formatEventDate(a.startsAt?.toISOString())} → {formatEventDate(a.endsAt?.toISOString())}
                  </Td>
                  <Td>
                    <Pill tone={phase === "ONGOING" ? "good" : phase === "UPCOMING" ? "info" : undefined}>{PHASE_LABEL[phase]}</Pill>
                  </Td>
                  <Td>
                    <div className="flex flex-wrap gap-1.5">
                      <StatusBadge status={a.status} />
                      {a.verifiedAt ? <Pill tone="good">Verified</Pill> : <Pill tone="warn">Unverified</Pill>}
                    </div>
                  </Td>
                  <Td>
                    <div className="flex justify-end gap-1.5">
                      {a.status === "PUBLISHED" ? (
                        <form action={setAirdropStatus.bind(null, a.id, "DRAFT")}>
                          <InlineSubmit>Unpublish</InlineSubmit>
                        </form>
                      ) : a.verifiedAt ? (
                        <form action={setAirdropStatus.bind(null, a.id, "PUBLISHED")}>
                          <InlineSubmit variant="primary">Publish</InlineSubmit>
                        </form>
                      ) : (
                        <AdminButtonLink href={`/admin/intelligence/airdrops/${a.id}`} size="sm">
                          Verify to publish
                        </AdminButtonLink>
                      )}
                    </div>
                  </Td>
                </tr>
              );
            })}
          </tbody>
        </AdminTable>
      )}
    </div>
  );
}
