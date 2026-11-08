"use client";

import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { useLiveMarket, useNow } from "@/components/market/live-market";
import { AssetLogo, Change, Gauge, LiveDot, Meter, Sparkline } from "@/components/market/primitives";
import { formatCompact, formatInteger, formatPercent, formatPrice, formatRelativeTime, formatUsdCompact } from "@/lib/market/format";
import type { MarketAsset } from "@/lib/market/types";
import { cn } from "@/lib/utils";

export function MarketStatus({ className }: { className?: string }) {
  const { snapshot } = useLiveMarket();
  const now = useNow();
  const updated = now && snapshot.updatedAt ? formatRelativeTime(snapshot.updatedAt, now) : null;
  return (
    <p className={cn("inline-flex items-center gap-2.5 rounded-full border border-white/10 bg-white/[0.04] px-3.5 py-1.5 text-xs text-ink-200 backdrop-blur", className)} aria-live="polite">
      <LiveDot stale={snapshot.stale || !snapshot.available} />
      {snapshot.available ? (
        <span>
          {snapshot.stale ? "Delayed data" : "Live market data"}
          {updated ? <span className="text-ink-400"> · updated {updated}</span> : null}
        </span>
      ) : (
        <span>Market data is temporarily unavailable</span>
      )}
    </p>
  );
}

function TickerItem({ asset }: { asset: MarketAsset }) {
  return (
    <Link
      href={`/intelligence/${asset.slug}`}
      className="flex shrink-0 items-center gap-2.5 rounded-full px-3 py-1.5 transition-colors hover:bg-white/[0.06]"
    >
      <AssetLogo id={asset.id} symbol={asset.symbol} size={20} />
      <span className="text-sm font-medium text-ink-100">{asset.symbol}</span>
      <span className="tabular text-sm text-ink-300">{formatPrice(asset.price)}</span>
      <Change value={asset.change24h} className="text-xs" />
    </Link>
  );
}

/** Infinite price ticker. Static, scrollable row when reduced motion is requested. */
export function MarketTicker({ count = 24, className }: { count?: number; className?: string }) {
  const { snapshot } = useLiveMarket();
  const assets = snapshot.assets.slice(0, count);
  if (assets.length === 0) return null;
  return (
    <div className={cn("group relative overflow-hidden border-y border-white/[0.07] bg-ink-950/60 backdrop-blur", className)}>
      <div className="mask-fade-x">
        <div className="flex w-max animate-marquee items-center gap-2 py-2.5 group-hover:[animation-play-state:paused] motion-reduce:w-full motion-reduce:animate-none motion-reduce:overflow-x-auto">
          {assets.map((asset) => (
            <TickerItem key={`a-${asset.id}`} asset={asset} />
          ))}
          <div aria-hidden className="flex items-center gap-2 motion-reduce:hidden">
            {assets.map((asset) => (
              <TickerItem key={`b-${asset.id}`} asset={asset} />
            ))}
          </div>
        </div>
      </div>
      <p className="sr-only">Live prices for the {assets.length} largest cryptocurrencies by market capitalisation.</p>
    </div>
  );
}

function StatCard({ label, value, change, hint, className }: { label: string; value: string; change?: number | null; hint?: string; className?: string }) {
  return (
    <div className={cn("ring-gradient glass rounded-[var(--radius-card)] p-5 md:p-6", className)}>
      <p className="text-eyebrow text-ink-400">{label}</p>
      <p className="tabular mt-3 font-display text-[1.75rem] leading-none font-medium tracking-[-0.04em] text-ink-50 md:text-[2rem]">{value}</p>
      <div className="mt-3 flex min-h-5 items-center gap-2 text-xs text-ink-400">
        {change !== undefined ? <Change value={change} pill /> : null}
        {hint ? <span>{hint}</span> : null}
      </div>
    </div>
  );
}

export function GlobalStats() {
  const { snapshot } = useLiveMarket();
  const g = snapshot.global;
  if (!g) return null;
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:gap-4 lg:grid-cols-4">
      <StatCard label="Total market cap" value={formatUsdCompact(g.totalMarketCap)} change={g.totalMarketCapChange24h} hint="vs. yesterday" />
      <StatCard label="24h volume" value={formatUsdCompact(g.totalVolume24h)} change={g.totalVolumeChange24h} hint="vs. yesterday" />
      <StatCard label="Bitcoin dominance" value={formatPercent(g.btcDominance, { signed: false })} change={g.btcDominanceChange24h} hint="pts, 24h" />
      <StatCard label="Ethereum dominance" value={formatPercent(g.ethDominance, { signed: false })} change={g.ethDominanceChange24h} hint="pts, 24h" />
      <StatCard label="DeFi market cap" value={formatUsdCompact(g.defiMarketCap)} hint={`24h volume ${formatUsdCompact(g.defiVolume24h)}`} />
      <StatCard label="Stablecoin market cap" value={formatUsdCompact(g.stablecoinMarketCap)} hint={`24h volume ${formatUsdCompact(g.stablecoinVolume24h)}`} />
      <StatCard label="Derivatives volume" value={formatUsdCompact(g.derivativesVolume24h)} hint="24h" />
      <StatCard
        label="Active assets"
        value={formatInteger(g.activeCryptocurrencies)}
        hint={`${formatInteger(g.activeExchanges)} exchanges · ${formatCompact(g.activeMarketPairs)} pairs`}
      />
    </div>
  );
}

export function SentimentPanel() {
  const { snapshot } = useLiveMarket();
  const { fearGreed, altSeason, index } = snapshot;
  if (!fearGreed && !altSeason && !index) return null;
  const history = fearGreed?.history.slice(-30) ?? [];
  return (
    <div className="grid grid-cols-1 gap-3 md:gap-4 lg:grid-cols-3">
      {fearGreed ? (
        <div className="ring-gradient glass flex flex-col rounded-[var(--radius-panel)] p-6 md:p-7">
          <div className="flex items-center justify-between gap-3">
            <h3 className="font-display text-lg font-medium tracking-[-0.02em] text-ink-50">Fear &amp; Greed</h3>
            <span className="text-eyebrow text-ink-500">CMC index</span>
          </div>
          <div className="mt-6">
            <Gauge value={fearGreed.value} label={fearGreed.classification} />
          </div>
          {history.length > 1 ? (
            <div className="mt-6 border-t border-white/[0.07] pt-4">
              <p className="text-xs text-ink-400">Last {history.length} days</p>
              <Sparkline values={history.map((p) => p.value)} className="mt-2 h-12" label={`Fear and greed over the last ${history.length} days`} />
            </div>
          ) : null}
        </div>
      ) : null}

      {altSeason ? (
        <div className="ring-gradient glass flex flex-col rounded-[var(--radius-panel)] p-6 md:p-7">
          <div className="flex items-center justify-between gap-3">
            <h3 className="font-display text-lg font-medium tracking-[-0.02em] text-ink-50">Altcoin Season</h3>
            <span className="text-eyebrow text-ink-500">0–100</span>
          </div>
          <p className="tabular mt-6 font-display text-6xl font-medium tracking-[-0.05em] text-ink-50">{altSeason.index}</p>
          <p className="mt-1 text-sm text-ink-300">
            {altSeason.index >= 75 ? "Altcoin season" : altSeason.index <= 25 ? "Bitcoin season" : "Neither season — mixed market"}
          </p>
          <Meter value={altSeason.index} left="Bitcoin season" right="Altcoin season" className="mt-auto pt-8" />
          {altSeason.yearlyHigh !== null && altSeason.yearlyLow !== null ? (
            <p className="mt-4 text-xs text-ink-400">
              12-month range {altSeason.yearlyLow}–{altSeason.yearlyHigh}
            </p>
          ) : null}
        </div>
      ) : null}

      {index ? (
        <div className="ring-gradient glass flex flex-col rounded-[var(--radius-panel)] p-6 md:p-7">
          <div className="flex items-center justify-between gap-3">
            <h3 className="font-display text-lg font-medium tracking-[-0.02em] text-ink-50">CoinMarketCap 100</h3>
            <span className="text-eyebrow text-ink-500">Index</span>
          </div>
          <div className="mt-6 flex items-end gap-3">
            <p className="tabular font-display text-6xl font-medium tracking-[-0.05em] text-ink-50">{index.value.toFixed(2)}</p>
            <Change value={index.change24h} pill className="mb-2" />
          </div>
          <p className="mt-1 text-sm text-ink-300">Top 100 assets, weighted by market cap</p>
          {index.constituents.length > 0 ? (
            <ul className="mt-auto space-y-2.5 pt-6">
              {index.constituents.slice(0, 5).map((c) => (
                <li key={c.id} className="flex items-center gap-3 text-sm">
                  <span className="w-12 font-medium text-ink-100">{c.symbol}</span>
                  <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/[0.06]">
                    <span className="block h-full rounded-full bg-[linear-gradient(90deg,var(--color-signal-500),var(--color-ember-400))]" style={{ width: `${Math.min(100, c.weight)}%` }} />
                  </span>
                  <span className="tabular w-14 text-right text-ink-300">{c.weight.toFixed(1)}%</span>
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

function MoverList({ title, assets, tone }: { title: string; assets: MarketAsset[]; tone: "up" | "down" }) {
  return (
    <div className="ring-gradient glass rounded-[var(--radius-panel)] p-5 md:p-6">
      <div className="flex items-center justify-between">
        <h3 className="font-display text-lg font-medium tracking-[-0.02em] text-ink-50">{title}</h3>
        <span className={cn("text-eyebrow", tone === "up" ? "text-up" : "text-down")}>24h</span>
      </div>
      <ol className="mt-4 divide-y divide-white/[0.06]">
        {assets.map((asset, i) => (
          <li key={asset.id}>
            <Link href={`/intelligence/${asset.slug}`} className="group flex items-center gap-3 py-3">
              <span className="tabular w-4 text-xs text-ink-500">{i + 1}</span>
              <AssetLogo id={asset.id} symbol={asset.symbol} size={30} />
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-medium text-ink-100 group-hover:text-white">{asset.name}</span>
                <span className="block text-xs text-ink-400">{asset.symbol}</span>
              </span>
              <span className="text-right">
                <span className="tabular block text-sm text-ink-100">{formatPrice(asset.price)}</span>
                <Change value={asset.change24h} className="text-xs" />
              </span>
            </Link>
          </li>
        ))}
      </ol>
    </div>
  );
}

export function TopMovers({ count = 5 }: { count?: number }) {
  const { snapshot } = useLiveMarket();
  // Ignore thin markets so a tiny pair can't dominate the list.
  const liquid = snapshot.assets.filter((a) => a.change24h !== null && (a.volume24h ?? 0) >= 1_000_000 && !a.categories.includes("stablecoin"));
  if (liquid.length < count * 2) return null;
  const sorted = [...liquid].sort((a, b) => (b.change24h ?? 0) - (a.change24h ?? 0));
  const gainers = sorted.slice(0, count).filter((a) => (a.change24h ?? 0) > 0);
  const losers = sorted.slice(-count).reverse().filter((a) => (a.change24h ?? 0) < 0);
  return (
    <div className="grid grid-cols-1 gap-3 md:gap-4 lg:grid-cols-2">
      {gainers.length ? <MoverList title="Top gainers" assets={gainers} tone="up" /> : null}
      {losers.length ? <MoverList title="Top losers" assets={losers} tone="down" /> : null}
    </div>
  );
}

/** Compact live widget for the homepage hero. */
export function MarketPulse({ symbols = [], className }: { symbols?: string[]; className?: string }) {
  const { snapshot, flashes, revision } = useLiveMarket();
  if (!snapshot.available) return null;
  const pinned = symbols
    .map((s) => snapshot.assets.find((a) => a.symbol.toUpperCase() === s.toUpperCase()))
    .filter((a): a is MarketAsset => Boolean(a));
  const rows = [...pinned, ...snapshot.assets.filter((a) => !pinned.includes(a) && !a.categories.includes("stablecoin"))].slice(0, 5);
  const g = snapshot.global;
  return (
    <div className={cn("ring-gradient glass relative overflow-hidden rounded-[var(--radius-panel)] p-5 shadow-[0_40px_120px_-40px_rgba(255,107,53,0.45)] sm:p-6", className)}>
      <div className="flex items-center justify-between gap-3">
        <p className="flex items-center gap-2 text-sm font-medium text-ink-50">
          <LiveDot stale={snapshot.stale} /> Market pulse
        </p>
        <Link href="/intelligence" className="inline-flex items-center gap-1 text-xs text-ink-300 transition-colors hover:text-ink-50">
          Intelligence <ArrowUpRight aria-hidden className="h-3.5 w-3.5" />
        </Link>
      </div>
      {g ? (
        <div className="mt-5 grid grid-cols-2 gap-3">
          <div className="rounded-2xl bg-white/[0.04] p-3.5">
            <p className="text-[0.7rem] text-ink-400">Market cap</p>
            <p className="tabular mt-1 font-display text-xl font-medium tracking-[-0.03em] text-ink-50">{formatUsdCompact(g.totalMarketCap)}</p>
            <Change value={g.totalMarketCapChange24h} className="text-xs" />
          </div>
          <div className="rounded-2xl bg-white/[0.04] p-3.5">
            <p className="text-[0.7rem] text-ink-400">{snapshot.fearGreed ? "Fear & Greed" : "BTC dominance"}</p>
            <p className="tabular mt-1 font-display text-xl font-medium tracking-[-0.03em] text-ink-50">
              {snapshot.fearGreed ? snapshot.fearGreed.value : formatPercent(g.btcDominance, { signed: false })}
            </p>
            <p className="text-xs text-ink-300">{snapshot.fearGreed ? snapshot.fearGreed.classification : "of total market cap"}</p>
          </div>
        </div>
      ) : null}
      <ul className="mt-4 space-y-1">
        {rows.map((asset) => (
          <li key={`${asset.id}-${flashes[asset.id] ? revision : 0}`}>
            <Link
              href={`/intelligence/${asset.slug}`}
              className={cn(
                "flex items-center gap-3 rounded-xl px-2 py-2 transition-colors hover:bg-white/[0.05]",
                flashes[asset.id] === "up" && "animate-flash-up",
                flashes[asset.id] === "down" && "animate-flash-down",
              )}
            >
              <AssetLogo id={asset.id} symbol={asset.symbol} size={28} />
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-medium text-ink-100">{asset.name}</span>
                <span className="block text-xs text-ink-500">{asset.symbol}</span>
              </span>
              <span className="text-right">
                <span className="tabular block text-sm text-ink-50">{formatPrice(asset.price)}</span>
                <Change value={asset.change24h} className="text-xs" />
              </span>
            </Link>
          </li>
        ))}
      </ul>
      <p className="mt-4 text-[0.68rem] text-ink-500">Data: CoinMarketCap · Not financial advice</p>
    </div>
  );
}

/** Home page teaser: live headline figures + top gainers, linking to the full view. */
export function IntelligenceSpotlight() {
  const { snapshot } = useLiveMarket();
  if (!snapshot.available) return null;
  const g = snapshot.global;
  const liquid = snapshot.assets.filter((a) => a.change24h !== null && (a.volume24h ?? 0) >= 1_000_000 && !a.categories.includes("stablecoin"));
  const gainers = [...liquid].sort((a, b) => (b.change24h ?? 0) - (a.change24h ?? 0)).slice(0, 3).filter((a) => (a.change24h ?? 0) > 0);
  const tiles: Array<{ label: string; value: string; change?: number | null }> = [];
  if (g) {
    tiles.push({ label: "Total market cap", value: formatUsdCompact(g.totalMarketCap), change: g.totalMarketCapChange24h });
    tiles.push({ label: "24h volume", value: formatUsdCompact(g.totalVolume24h), change: g.totalVolumeChange24h });
    tiles.push({ label: "BTC dominance", value: formatPercent(g.btcDominance, { signed: false }), change: g.btcDominanceChange24h });
  }
  if (snapshot.fearGreed) tiles.push({ label: "Fear & Greed", value: `${snapshot.fearGreed.value} · ${snapshot.fearGreed.classification}` });

  return (
    <div className="grid grid-cols-1 gap-3 md:gap-4 lg:grid-cols-12">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:gap-4 lg:col-span-7">
        {tiles.map((tile) => (
          <div key={tile.label} className="ring-gradient glass rounded-[var(--radius-card)] p-5 md:p-6">
            <p className="text-eyebrow text-ink-400">{tile.label}</p>
            <p className="tabular mt-3 font-display text-2xl font-medium tracking-[-0.035em] text-ink-50 md:text-[1.75rem]">{tile.value}</p>
            {tile.change !== undefined ? <Change value={tile.change} pill className="mt-3" /> : <span className="mt-3 block h-5" />}
          </div>
        ))}
      </div>
      {gainers.length > 0 ? (
        <div className="ring-gradient glass rounded-[var(--radius-panel)] p-5 md:p-6 lg:col-span-5">
          <div className="flex items-center justify-between">
            <p className="font-display text-lg font-medium tracking-[-0.02em] text-ink-50">Leading today</p>
            <span className="text-eyebrow text-up">24h</span>
          </div>
          <ul className="mt-3 divide-y divide-white/[0.06]">
            {gainers.map((asset) => (
              <li key={asset.id}>
                <Link href={`/intelligence/${asset.slug}`} className="group flex items-center gap-3 py-3.5">
                  <AssetLogo id={asset.id} symbol={asset.symbol} size={34} />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-medium text-ink-100 group-hover:text-white">{asset.name}</span>
                    <span className="block text-xs text-ink-400">{asset.symbol}</span>
                  </span>
                  <span className="text-right">
                    <span className="tabular block text-sm text-ink-50">{formatPrice(asset.price)}</span>
                    <Change value={asset.change24h} className="text-xs" />
                  </span>
                </Link>
              </li>
            ))}
          </ul>
          <Link href="/intelligence#markets" className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-ink-100 hover:text-white">
            See all {snapshot.assets.length} assets <ArrowUpRight aria-hidden className="h-4 w-4" />
          </Link>
        </div>
      ) : null}
    </div>
  );
}
