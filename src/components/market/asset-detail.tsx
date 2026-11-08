"use client";

import type { ReactNode } from "react";
import { ArrowUpRight } from "lucide-react";
import { useLiveMarket, useNow } from "@/components/market/live-market";
import { AssetLogo, Change, LiveDot } from "@/components/market/primitives";
import { formatCompact, formatEventDate, formatPercent, formatPrice, formatRelativeTime, formatUsdCompact } from "@/lib/market/format";
import { MARKET_CATEGORIES } from "@/lib/market/normalize";
import type { AssetInfo, MarketAsset } from "@/lib/market/types";
import { cn } from "@/lib/utils";

const CATEGORY_LABEL = new Map<string, string>(MARKET_CATEGORIES.map((c) => [c.key, c.label]));

function Stat({ label, value, sub, className }: { label: string; value: string; sub?: ReactNode; className?: string }) {
  return (
    <div className={cn("glass rounded-[var(--radius-card)] p-5", className)}>
      <dt className="text-xs text-ink-400">{label}</dt>
      <dd className="tabular mt-2 font-display text-xl font-medium tracking-[-0.03em] text-ink-50">{value}</dd>
      {sub ? <dd className="mt-1.5 text-xs text-ink-400">{sub}</dd> : null}
    </div>
  );
}

function hostOf(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

function LinkList({ title, urls }: { title: string; urls: Array<{ label: string; url: string }> }) {
  if (urls.length === 0) return null;
  return (
    <div>
      <p className="text-xs text-ink-500">{title}</p>
      <ul className="mt-2 flex flex-wrap gap-2">
        {urls.map((link) => (
          <li key={link.url}>
            <a
              href={link.url}
              target="_blank"
              rel="noopener noreferrer nofollow"
              className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5 text-xs text-ink-200 transition-colors hover:border-white/25 hover:text-ink-50"
            >
              {link.label}
              <ArrowUpRight aria-hidden className="h-3 w-3" />
              <span className="sr-only"> (opens in a new tab)</span>
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function AssetDetail({ fallback, info }: { fallback: MarketAsset; info: AssetInfo | null }) {
  const { snapshot, flashes, revision } = useLiveMarket();
  const now = useNow();
  const asset = snapshot.assets.find((a) => a.id === fallback.id) ?? fallback;
  const flash = flashes[asset.id];
  const supplyPct = asset.maxSupply && asset.circulatingSupply ? Math.min(100, (asset.circulatingSupply / asset.maxSupply) * 100) : null;
  const changes: Array<[string, number | null]> = [
    ["1h", asset.change1h],
    ["24h", asset.change24h],
    ["7d", asset.change7d],
    ["30d", asset.change30d],
    ["90d", asset.change90d],
  ];

  return (
    <div>
      <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="flex items-center gap-4">
            <AssetLogo id={asset.id} symbol={asset.symbol} size={56} />
            <div>
              <h1 className="font-display text-[clamp(2rem,5vw,3.25rem)] leading-none font-medium tracking-[-0.045em] text-ink-50">{asset.name}</h1>
              <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
                <span className="rounded-md bg-white/[0.07] px-2 py-0.5 font-mono text-ink-200">{asset.symbol}</span>
                {asset.rank ? <span className="rounded-md bg-signal-500/10 px-2 py-0.5 text-signal-300">Rank #{asset.rank}</span> : null}
                {asset.categories.map((key) => (
                  <span key={key} className="rounded-md border border-white/10 px-2 py-0.5 text-ink-300">
                    {CATEGORY_LABEL.get(key) ?? key}
                  </span>
                ))}
              </div>
            </div>
          </div>
          <div className="mt-8 flex flex-wrap items-end gap-4">
            <p
              key={`${asset.id}-${flash ? revision : 0}`}
              className={cn("tabular -mx-2 rounded-xl px-2 font-display text-[clamp(2.5rem,7vw,4.5rem)] leading-none font-medium tracking-[-0.05em] text-ink-50", flash === "up" && "animate-flash-up", flash === "down" && "animate-flash-down")}
            >
              {formatPrice(asset.price)}
            </p>
            <Change value={asset.change24h} pill className="mb-2 text-sm" />
          </div>
          <p className="mt-3 flex items-center gap-2 text-xs text-ink-400">
            <LiveDot stale={snapshot.stale} />
            {asset.lastUpdated && now ? `Updated ${formatRelativeTime(asset.lastUpdated, now)}` : "Live price"} · USD
          </p>
        </div>
        <ul className="grid grid-cols-5 gap-2 sm:w-auto" aria-label="Price change">
          {changes.map(([label, value]) => (
            <li key={label} className="glass rounded-2xl px-3 py-3 text-center">
              <p className="text-[0.7rem] text-ink-500">{label}</p>
              <Change value={value} className="mt-1 text-xs sm:text-sm" digits={1} />
            </li>
          ))}
        </ul>
      </div>

      <dl className="mt-10 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Market cap" value={formatUsdCompact(asset.marketCap)} sub={asset.dominance != null ? `${formatPercent(asset.dominance, { signed: false })} of the crypto market` : undefined} />
        <Stat label="Fully diluted valuation" value={formatUsdCompact(asset.fdv)} />
        <Stat label="Volume (24h)" value={formatUsdCompact(asset.volume24h)} sub={asset.volumeChange24h != null ? <Change value={asset.volumeChange24h} className="text-xs" /> : undefined} />
        <Stat
          label="Volume / market cap"
          value={asset.volume24h != null && asset.marketCap ? formatPercent((asset.volume24h / asset.marketCap) * 100, { signed: false }) : "—"}
          sub="Turnover in the last 24 hours"
        />
        <Stat
          label="Circulating supply"
          value={`${formatCompact(asset.circulatingSupply)} ${asset.symbol}`}
          sub={
            supplyPct !== null ? (
              <span className="mt-1 block">
                <span className="block h-1.5 overflow-hidden rounded-full bg-white/[0.07]">
                  <span className="block h-full rounded-full bg-[linear-gradient(90deg,var(--color-signal-500),var(--color-ember-400))]" style={{ width: `${supplyPct}%` }} />
                </span>
                <span className="mt-1.5 block">{supplyPct.toFixed(1)}% of max supply</span>
              </span>
            ) : undefined
          }
        />
        <Stat label="Total supply" value={`${formatCompact(asset.totalSupply)} ${asset.symbol}`} />
        <Stat label="Max supply" value={asset.infiniteSupply ? "No cap" : asset.maxSupply ? `${formatCompact(asset.maxSupply)} ${asset.symbol}` : "—"} />
        <Stat label="Market pairs" value={formatCompact(asset.marketPairs)} sub={asset.dateAdded ? `Listed on CoinMarketCap ${formatEventDate(asset.dateAdded)}` : undefined} />
      </dl>

      {info && (info.description || info.links.website.length || info.links.explorer.length) ? (
        <div className="mt-10 grid grid-cols-1 gap-3 lg:grid-cols-3">
          {info.description ? (
            <div className="glass rounded-[var(--radius-panel)] p-6 md:p-8 lg:col-span-2">
              <h2 className="font-display text-xl font-medium tracking-[-0.02em] text-ink-50">About {asset.name}</h2>
              <p className="mt-4 text-[0.95rem] leading-relaxed whitespace-pre-line text-ink-300">{info.description}</p>
              <p className="mt-4 text-xs text-ink-500">Description: CoinMarketCap.</p>
            </div>
          ) : null}
          <div className={cn("glass space-y-5 rounded-[var(--radius-panel)] p-6 md:p-8", !info.description && "lg:col-span-3")}>
            <h2 className="font-display text-xl font-medium tracking-[-0.02em] text-ink-50">Links</h2>
            <LinkList title="Website" urls={info.links.website.map((url) => ({ label: hostOf(url), url }))} />
            <LinkList title="Explorers" urls={info.links.explorer.map((url) => ({ label: hostOf(url), url }))} />
            <LinkList title="Documentation" urls={info.links.docs.map((url) => ({ label: hostOf(url), url }))} />
            <LinkList title="Source code" urls={info.links.sourceCode.map((url) => ({ label: hostOf(url), url }))} />
            <LinkList title="Community" urls={info.links.community} />
            {info.dateLaunched ? <p className="text-xs text-ink-500">Launched {formatEventDate(info.dateLaunched)}</p> : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}
