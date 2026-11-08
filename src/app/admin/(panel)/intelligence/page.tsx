import type { Metadata } from "next";
import { RefreshCw } from "lucide-react";
import { InlineSubmit } from "@/components/admin/form";
import { IntelligenceSettingsForm } from "@/components/admin/forms/intelligence-forms";
import { AdminButtonLink, AdminPageHeader, Panel, Pill, StatCard } from "@/components/admin/ui";
import { requireAdmin } from "@/lib/auth/guards";
import { prisma } from "@/lib/db";
import { isPlanRestricted } from "@/lib/market/cmc";
import { formatInteger, formatRelativeTime, renderTimestamp } from "@/lib/market/format";
import { DEFAULT_INTELLIGENCE_SETTINGS, estimateMonthlyCredits, getMarketStatus } from "@/lib/market/service";
import { formatDateTime } from "@/lib/utils";
import { refreshMarketData, saveIntelligenceSettings } from "@/server/actions/intelligence";

export const metadata: Metadata = { title: "Market Intelligence" };

const DATASET_LABELS: Record<string, string> = {
  listings: "Prices & market caps",
  global: "Global metrics",
  "fear-greed": "Fear & Greed",
  "fear-greed-history": "Fear & Greed history",
  "altcoin-season": "Altcoin Season index",
  cmc100: "CMC100 index",
  airdrops: "CoinMarketCap airdrops",
};

export default async function IntelligenceAdminPage() {
  await requireAdmin();
  const now = renderTimestamp();
  const [row, status, airdrops, unlocks, upcomingUnlocks] = await Promise.all([
    prisma.intelligenceSettings.findUnique({ where: { id: 1 } }),
    getMarketStatus(),
    prisma.airdrop.groupBy({ by: ["status"], _count: true }),
    prisma.tokenUnlock.groupBy({ by: ["status"], _count: true }),
    prisma.tokenUnlock.count({ where: { status: "PUBLISHED", unlockAt: { gte: new Date(now) } } }),
  ]);
  const settings = row ?? { ...DEFAULT_INTELLIGENCE_SETTINGS };
  const count = (groups: Array<{ status: string; _count: number }>, s: string) => groups.find((g) => g.status === s)?._count ?? 0;
  const keyed = status.mode === "keyed";
  const credits = estimateMonthlyCredits(settings.refreshSeconds, keyed);

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Market Intelligence"
        description="Live crypto market data from CoinMarketCap, plus the airdrops and token unlocks you curate."
        actions={
          <>
            <AdminButtonLink href="/intelligence" target="_blank">
              View page
            </AdminButtonLink>
            <form action={refreshMarketData}>
              <InlineSubmit size="md">
                <RefreshCw aria-hidden className="h-3.5 w-3.5" /> Refresh data
              </InlineSubmit>
            </form>
          </>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Data source" value={keyed ? "Pro API" : "Keyless"} hint={keyed ? "CMC_API_KEY is set" : "Shared public limits"} />
        <StatCard label="Published airdrops" value={count(airdrops, "PUBLISHED")} href="/admin/intelligence/airdrops" hint={`${count(airdrops, "DRAFT")} drafts`} />
        <StatCard label="Upcoming unlocks" value={upcomingUnlocks} href="/admin/intelligence/unlocks" hint={`${count(unlocks, "DRAFT")} drafts`} />
        <StatCard label="Est. credits / month" value={keyed ? formatInteger(credits) : "—"} hint={keyed ? "worst case, constant traffic" : "no credits used keyless"} />
      </div>

      {!keyed ? (
        <div className="rounded-2xl border border-beta/30 bg-beta/[0.06] p-5 text-sm text-ink-200">
          <p className="font-medium text-beta">Running on CoinMarketCap&apos;s keyless public API</p>
          <p className="mt-1.5 text-ink-300">
            It works without signing up, but its rate limits are shared by everyone on the same IP, so data can pause on busy hosts. Create a free key at
            coinmarketcap.com/api, then set <code className="rounded bg-white/10 px-1 font-mono text-xs">CMC_API_KEY</code> in your hosting environment and
            redeploy. A paid plan (Hobbyist or above) also enables the live airdrop feed.
          </p>
        </div>
      ) : null}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        <Panel title="Data status" description="Each dataset is cached on the server and refreshed only while people are viewing the site." className="lg:col-span-3">
          {status.datasets.length === 0 ? (
            <p className="text-sm text-ink-400">Nothing fetched yet — open the public page to load data.</p>
          ) : (
            <ul className="divide-y divide-white/[0.06]">
              {status.datasets.map((d) => (
                <li key={d.key} className="flex flex-wrap items-center justify-between gap-2 py-3 text-sm">
                  <span className="text-ink-100">{DATASET_LABELS[d.key] ?? d.key}</span>
                  <span className="flex items-center gap-2">
                    {d.fetchedAt ? <span className="text-xs text-ink-400">updated {formatRelativeTime(new Date(d.fetchedAt).toISOString(), now)}</span> : null}
                    {d.error ? (
                      <Pill tone={isPlanRestricted(d.error) ? "warn" : "bad"}>{isPlanRestricted(d.error) ? "Not in plan" : "Error"}</Pill>
                    ) : d.fetchedAt ? (
                      <Pill tone="good">OK</Pill>
                    ) : null}
                  </span>
                  {d.error ? <p className="w-full text-xs text-ink-500">{d.error}</p> : null}
                </li>
              ))}
            </ul>
          )}
        </Panel>
        <Panel title="API usage" className="lg:col-span-2">
          {status.usage ? (
            <dl className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <dt className="text-xs text-ink-500">Used this month</dt>
                <dd className="tabular mt-1 text-ink-50">{formatInteger(status.usage.creditsUsedMonth)}</dd>
              </div>
              <div>
                <dt className="text-xs text-ink-500">Monthly limit</dt>
                <dd className="tabular mt-1 text-ink-50">{formatInteger(status.usage.creditLimitMonthly)}</dd>
              </div>
              <div>
                <dt className="text-xs text-ink-500">Used today</dt>
                <dd className="tabular mt-1 text-ink-50">{formatInteger(status.usage.creditsUsedDay)}</dd>
              </div>
              <div>
                <dt className="text-xs text-ink-500">Requests / minute</dt>
                <dd className="tabular mt-1 text-ink-50">{formatInteger(status.usage.rateLimitMinute)}</dd>
              </div>
              {status.usage.resetsAt ? <p className="col-span-2 text-xs text-ink-500">Resets {formatDateTime(status.usage.resetsAt)}</p> : null}
            </dl>
          ) : (
            <p className="text-sm text-ink-400">{keyed ? (status.usageError ?? "Usage will appear after the first request.") : "Usage figures are available once an API key is configured."}</p>
          )}
        </Panel>
      </div>

      <Panel title="Settings">
        <IntelligenceSettingsForm
          action={saveIntelligenceSettings}
          values={{
            enabled: settings.enabled,
            showOnHomepage: settings.showOnHomepage,
            assetLimit: settings.assetLimit,
            refreshMinutes: Math.round((settings.refreshSeconds / 60) * 100) / 100,
            watchlist: settings.watchlist.join(", "),
          }}
        />
      </Panel>
    </div>
  );
}
