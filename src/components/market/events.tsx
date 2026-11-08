"use client";

import { useMemo, useState } from "react";
import { ArrowUpRight, CalendarClock, Gift, LockOpen } from "lucide-react";
import { useLiveMarket, useNow } from "@/components/market/live-market";
import { AssetLogo } from "@/components/market/primitives";
import { formatCompact, formatCountdown, formatEventDate, formatEventDateTime, formatUsdCompact } from "@/lib/market/format";
import type { AirdropItem, AirdropStatus, MarketAsset, TokenUnlockItem } from "@/lib/market/types";
import { cn } from "@/lib/utils";

function useAssetLookup() {
  const { snapshot } = useLiveMarket();
  return useMemo(() => {
    const bySlug = new Map<string, MarketAsset>(snapshot.assets.map((a) => [a.slug, a]));
    return (slug: string | null) => (slug ? (bySlug.get(slug) ?? null) : null);
  }, [snapshot.assets]);
}

const STATUS_LABEL: Record<AirdropStatus, string> = { ONGOING: "Live now", UPCOMING: "Upcoming", ENDED: "Ended" };
const EMPTY_AIRDROP_TITLE: Record<AirdropStatus, string> = {
  ONGOING: "No airdrops are live right now",
  UPCOMING: "No upcoming airdrops yet",
  ENDED: "No recently ended airdrops",
};

function EmptyState({ icon: Icon, title, body }: { icon: typeof Gift; title: string; body: string }) {
  return (
    <div className="glass rounded-[var(--radius-panel)] px-6 py-14 text-center">
      <Icon aria-hidden className="mx-auto h-6 w-6 text-ink-400" />
      <p className="mt-4 font-medium text-ink-100">{title}</p>
      <p className="mx-auto mt-2 max-w-md text-sm text-ink-400">{body}</p>
    </div>
  );
}

export function AirdropBoard({ items }: { items: AirdropItem[] }) {
  const counts = useMemo(() => {
    const c: Record<AirdropStatus, number> = { ONGOING: 0, UPCOMING: 0, ENDED: 0 };
    for (const item of items) c[item.status] += 1;
    return c;
  }, [items]);
  const [tab, setTab] = useState<AirdropStatus>(counts.ONGOING > 0 || counts.UPCOMING === 0 ? "ONGOING" : "UPCOMING");
  const lookup = useAssetLookup();
  const now = useNow();
  const shown = items.filter((i) => i.status === tab).slice(0, 24);

  return (
    <div>
      <div role="tablist" aria-label="Airdrop status" className="inline-flex rounded-full border border-white/10 bg-white/[0.03] p-1">
        {(Object.keys(STATUS_LABEL) as AirdropStatus[]).map((status) => (
          <button
            key={status}
            type="button"
            role="tab"
            aria-selected={tab === status}
            onClick={() => setTab(status)}
            className={cn(
              "h-9 rounded-full px-4 text-sm transition-colors",
              tab === status ? "bg-ink-50 font-medium text-ink-950" : "text-ink-300 hover:text-ink-50",
            )}
          >
            {STATUS_LABEL[status]} <span className={cn("tabular ml-1 text-xs", tab === status ? "text-ink-600" : "text-ink-500")}>{counts[status]}</span>
          </button>
        ))}
      </div>

      <div className="mt-6" role="tabpanel">
        {shown.length === 0 ? (
          <EmptyState icon={Gift} title={EMPTY_AIRDROP_TITLE[tab]} body="Airdrops are listed here once they are announced on official channels and verified." />
        ) : (
          <ul className="grid grid-cols-1 gap-3 md:grid-cols-2 md:gap-4 xl:grid-cols-3">
            {shown.map((item) => {
              const asset = lookup(item.slug);
              const deadline = item.status === "UPCOMING" ? item.startsAt : item.status === "ONGOING" ? item.endsAt : null;
              return (
                <li key={item.id} className="ring-gradient glass flex flex-col rounded-[var(--radius-card)] p-5 md:p-6">
                  <div className="flex items-start gap-3">
                    {asset ? (
                      <AssetLogo id={asset.id} symbol={asset.symbol} size={40} />
                    ) : (
                      <span aria-hidden className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[linear-gradient(135deg,var(--color-signal-500),var(--color-iris-500))] font-display text-sm font-semibold text-white">
                        {item.projectName.charAt(0)}
                      </span>
                    )}
                    <div className="min-w-0 flex-1">
                      <h3 className="truncate font-display text-lg font-medium tracking-[-0.02em] text-ink-50">{item.projectName}</h3>
                      <p className="text-xs text-ink-400">
                        {item.symbol ?? "Token"} · {item.source === "cmc" ? "via CoinMarketCap" : "Curated by Unique Labs"}
                      </p>
                    </div>
                    <span
                      className={cn(
                        "shrink-0 rounded-full px-2.5 py-1 text-[0.7rem] font-medium",
                        item.status === "ONGOING" && "bg-up/10 text-up",
                        item.status === "UPCOMING" && "bg-soon/10 text-soon",
                        item.status === "ENDED" && "bg-white/5 text-ink-400",
                      )}
                    >
                      {STATUS_LABEL[item.status]}
                    </span>
                  </div>
                  {item.description ? <p className="mt-4 line-clamp-3 text-sm text-ink-300">{item.description}</p> : null}
                  <dl className="mt-5 grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <dt className="text-xs text-ink-500">Starts</dt>
                      <dd className="mt-0.5 text-ink-100">{formatEventDate(item.startsAt)}</dd>
                    </div>
                    <div>
                      <dt className="text-xs text-ink-500">Ends</dt>
                      <dd className="mt-0.5 text-ink-100">{formatEventDate(item.endsAt)}</dd>
                    </div>
                    {item.reward ? (
                      <div>
                        <dt className="text-xs text-ink-500">Reward pool</dt>
                        <dd className="mt-0.5 text-ink-100">{item.reward}</dd>
                      </div>
                    ) : null}
                    {item.winnerCount ? (
                      <div>
                        <dt className="text-xs text-ink-500">Winners</dt>
                        <dd className="tabular mt-0.5 text-ink-100">{formatCompact(item.winnerCount)}</dd>
                      </div>
                    ) : null}
                  </dl>
                  {item.requirements ? <p className="mt-4 rounded-xl bg-white/[0.04] px-3.5 py-2.5 text-xs text-ink-300">{item.requirements}</p> : null}
                  <div className="mt-auto flex items-center justify-between gap-3 pt-5">
                    <span className="text-xs text-ink-400">{deadline && now ? (item.status === "UPCOMING" ? `Starts ${formatCountdown(deadline, now)}` : `Ends ${formatCountdown(deadline, now)}`) : null}</span>
                    {item.url ? (
                      <a href={item.url} target="_blank" rel="noopener noreferrer nofollow" className="inline-flex items-center gap-1 text-sm font-medium text-ink-100 hover:text-white">
                        Details <ArrowUpRight aria-hidden className="h-3.5 w-3.5" />
                        <span className="sr-only"> about {item.projectName} (opens in a new tab)</span>
                      </a>
                    ) : null}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}

const UNLOCK_TYPE: Record<TokenUnlockItem["unlockType"], string> = { CLIFF: "Cliff unlock", LINEAR: "Linear vesting", OTHER: "Unlock" };

export function UnlockBoard({ items, renderedAt }: { items: TokenUnlockItem[]; renderedAt: number }) {
  const lookup = useAssetLookup();
  const now = useNow();
  const [showPast, setShowPast] = useState(false);
  // Until the client clock starts, split by the server's render time so the
  // hydrated markup matches what the server sent.
  const reference = now ?? renderedAt;
  const upcoming = items.filter((u) => Date.parse(u.unlockAt) >= reference).slice(0, 30);
  const past = items.filter((u) => Date.parse(u.unlockAt) < reference && Date.parse(u.unlockAt) > reference - 30 * 86_400_000).reverse();

  if (items.length === 0) {
    return <EmptyState icon={LockOpen} title="No token unlocks scheduled" body="Verified unlock events are published here with a link to their source." />;
  }

  const row = (u: TokenUnlockItem) => {
    const asset = lookup(u.slug);
    const value = asset?.price != null && u.amount != null ? asset.price * u.amount : u.valueUsd;
    const d = new Date(u.unlockAt);
    return (
      <li key={u.id} className="ring-gradient glass grid grid-cols-[auto_minmax(0,1fr)] items-center gap-4 rounded-[var(--radius-card)] p-4 sm:grid-cols-[auto_minmax(0,1fr)_auto] md:p-5">
        <div className="flex w-14 flex-col items-center rounded-2xl bg-white/[0.05] py-2 text-center">
          <span className="text-[0.65rem] font-medium tracking-[0.12em] text-signal-400 uppercase">{d.toLocaleString("en-US", { month: "short", timeZone: "UTC" })}</span>
          <span className="tabular font-display text-2xl leading-tight font-medium text-ink-50">{d.getUTCDate()}</span>
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-2.5">
            {asset ? <AssetLogo id={asset.id} symbol={asset.symbol} size={24} /> : null}
            <h3 className="truncate font-medium text-ink-50">
              {u.tokenName} <span className="text-ink-400">{u.symbol}</span>
            </h3>
          </div>
          <p className="mt-1 text-xs text-ink-400">
            {UNLOCK_TYPE[u.unlockType]}
            {u.allocation ? ` · ${u.allocation}` : ""} · {formatEventDateTime(u.unlockAt)}
          </p>
          {u.description ? <p className="mt-2 line-clamp-2 text-sm text-ink-300">{u.description}</p> : null}
        </div>
        <div className="col-span-2 flex flex-wrap items-center justify-between gap-x-5 gap-y-2 border-t border-white/[0.06] pt-3 sm:col-span-1 sm:flex-col sm:items-end sm:border-0 sm:pt-0">
          <div className="sm:text-right">
            <p className="tabular text-sm font-medium text-ink-50">
              {u.amount != null ? `${formatCompact(u.amount)} ${u.symbol}` : "Amount n/a"}
              {u.percentOfSupply != null ? <span className="text-ink-400"> · {u.percentOfSupply}% of supply</span> : null}
            </p>
            <p className="tabular text-xs text-ink-400">{value != null ? `≈ ${formatUsdCompact(value)} at today’s price` : " "}</p>
          </div>
          <div className="flex items-center gap-3">
            {now ? (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-signal-500/10 px-2.5 py-1 text-xs text-signal-300">
                <CalendarClock aria-hidden className="h-3.5 w-3.5" />
                {formatCountdown(u.unlockAt, now)}
              </span>
            ) : null}
            <a href={u.sourceUrl} target="_blank" rel="noopener noreferrer nofollow" className="inline-flex items-center gap-1 text-xs text-ink-300 hover:text-ink-50">
              Source <ArrowUpRight aria-hidden className="h-3 w-3" />
              <span className="sr-only"> for the {u.tokenName} unlock (opens in a new tab)</span>
            </a>
          </div>
        </div>
      </li>
    );
  };

  return (
    <div>
      {upcoming.length > 0 ? (
        <ul className="space-y-3">{upcoming.map(row)}</ul>
      ) : (
        <EmptyState icon={LockOpen} title="No upcoming unlocks" body="Nothing is scheduled at the moment. Recent unlocks are listed below." />
      )}
      {past.length > 0 ? (
        <div className="mt-6">
          <button type="button" onClick={() => setShowPast((v) => !v)} aria-expanded={showPast} className="text-sm font-medium text-ink-300 underline decoration-white/20 underline-offset-4 hover:text-ink-50">
            {showPast ? "Hide" : "Show"} recent unlocks ({past.length})
          </button>
          {showPast ? <ul className="mt-4 space-y-3 opacity-80">{past.map(row)}</ul> : null}
        </div>
      ) : null}
    </div>
  );
}
