import type { Metadata } from "next";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import { Activity, Gauge as GaugeIcon, Gift, LineChart, LockOpen, TrendingUp } from "lucide-react";
import { AirdropBoard, UnlockBoard } from "@/components/market/events";
import { LiveMarketProvider } from "@/components/market/live-market";
import { MarketTable } from "@/components/market/market-table";
import { GlobalStats, MarketStatus, MarketTicker, SentimentPanel, TopMovers } from "@/components/market/sections";
import { Eyebrow } from "@/components/ui/section";
import { Aurora } from "@/components/visuals/aurora";
import { renderTimestamp } from "@/lib/market/format";
import { getAirdrops, getIntelligenceSettings, getMarketSnapshot, getTokenUnlocks } from "@/lib/market/service";
import { pageMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = pageMetadata({
  title: "Market Intelligence — live crypto prices, sentiment, airdrops & unlocks",
  description:
    "Live cryptocurrency prices, market cap, volume, Fear & Greed, altcoin season, airdrops and token unlocks — clear and fast, powered by CoinMarketCap data.",
  path: "/intelligence",
});

function SectionTitle({ id, icon, eyebrow, title, description }: { id: string; icon: ReactNode; eyebrow: string; title: string; description?: string }) {
  return (
    <div className="mb-7 flex flex-col gap-3 md:mb-9 md:flex-row md:items-end md:justify-between">
      <div>
        <p className="text-eyebrow flex items-center gap-2 text-signal-400">
          <span aria-hidden className="inline-flex h-6 w-6 items-center justify-center rounded-lg bg-signal-500/10">
            {icon}
          </span>
          {eyebrow}
        </p>
        <h2 id={id} className="mt-3 font-display text-[clamp(1.6rem,3vw,2.4rem)] leading-tight font-medium tracking-[-0.035em] text-ink-50">
          {title}
        </h2>
      </div>
      {description ? <p className="max-w-md text-sm text-ink-400 md:text-right">{description}</p> : null}
    </div>
  );
}

const JUMP_LINKS = [
  { href: "#overview", label: "Overview" },
  { href: "#sentiment", label: "Sentiment" },
  { href: "#markets", label: "Markets" },
  { href: "#airdrops", label: "Airdrops" },
  { href: "#unlocks", label: "Unlocks" },
];

export default async function IntelligencePage() {
  const settings = await getIntelligenceSettings();
  if (!settings.enabled) notFound();
  const snapshot = await getMarketSnapshot();
  const [{ items: airdrops }, unlocks] = await Promise.all([getAirdrops(), getTokenUnlocks(snapshot.assets)]);
  const pollSeconds = Math.min(120, Math.max(30, Math.round(settings.refreshSeconds / 2)));

  return (
    <LiveMarketProvider initial={snapshot} pollSeconds={pollSeconds}>
      <section className="relative overflow-hidden pt-[calc(var(--header-height)+3rem)] pb-14 md:pt-[calc(var(--header-height)+5.5rem)] md:pb-20">
        <Aurora />
        <div aria-hidden className="grid-lines mask-fade-radial pointer-events-none absolute inset-0 opacity-40" />
        <div className="container-site relative">
          <Eyebrow className="animate-fade-in">Unique Labs Intelligence</Eyebrow>
          <h1 className="text-display-lg mt-6 max-w-[15ch] animate-fade-up text-ink-50 [animation-delay:80ms]">
            Crypto markets, <span className="text-gradient animate-shimmer">in real time</span>.
          </h1>
          <p className="text-lede mt-6 max-w-2xl animate-fade-up text-ink-300 [animation-delay:160ms]">
            Prices, market capitalisation, volume, sentiment, airdrops and token unlocks — one clear view, refreshed
            continuously and free of noise.
          </p>
          <div className="mt-8 flex animate-fade-up flex-col gap-4 [animation-delay:240ms] sm:flex-row sm:flex-wrap sm:items-center">
            <MarketStatus />
            <nav aria-label="On this page" className="-mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0">
              <ul className="flex w-max gap-1.5">
                {JUMP_LINKS.map((link) => (
                  <li key={link.href}>
                    <a href={link.href} className="inline-flex h-8 items-center rounded-full border border-white/10 px-3.5 text-xs text-ink-300 transition-colors hover:border-white/25 hover:text-ink-50">
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
        </div>
      </section>

      <MarketTicker />

      {!snapshot.available ? (
        <section className="container-site py-14">
          <div className="glass rounded-[var(--radius-panel)] px-6 py-12 text-center">
            <Activity aria-hidden className="mx-auto h-6 w-6 text-ink-400" />
            <p className="mt-4 font-medium text-ink-100">Live market data is taking a breather</p>
            <p className="mx-auto mt-2 max-w-md text-sm text-ink-400">
              Our data provider didn&apos;t respond just now. Prices will appear here automatically as soon as it does.
            </p>
          </div>
        </section>
      ) : null}

      {snapshot.global ? (
        <section aria-labelledby="overview" className="container-site scroll-mt-28 pt-14 md:pt-20">
          <SectionTitle id="overview" icon={<LineChart className="h-3.5 w-3.5" />} eyebrow="Overview" title="The market at a glance" description="Aggregate figures across every cryptocurrency CoinMarketCap tracks." />
          <GlobalStats />
        </section>
      ) : null}

      {snapshot.fearGreed || snapshot.altSeason || snapshot.index ? (
        <section aria-labelledby="sentiment" className="container-site scroll-mt-28 pt-14 md:pt-20">
          <SectionTitle id="sentiment" icon={<GaugeIcon className="h-3.5 w-3.5" />} eyebrow="Sentiment" title="Mood, seasons and indices" description="Market psychology and leadership — useful context, never a signal on its own." />
          <SentimentPanel />
        </section>
      ) : null}

      {snapshot.available ? (
        <>
          <section aria-label="Top movers" className="container-site pt-14 md:pt-20">
            <SectionTitle id="movers" icon={<TrendingUp className="h-3.5 w-3.5" />} eyebrow="Movers" title="Biggest moves in 24 hours" description="Among tracked assets with at least $1M in daily volume. Stablecoins excluded." />
            <TopMovers />
          </section>
          <section aria-labelledby="markets" className="container-site scroll-mt-28 pt-14 md:pt-20">
            <SectionTitle id="markets" icon={<Activity className="h-3.5 w-3.5" />} eyebrow="Markets" title="Prices by market cap" description={`The ${snapshot.assets.length} largest cryptocurrencies, updated live.`} />
            <MarketTable watchlist={settings.watchlist} />
          </section>
        </>
      ) : null}

      <section aria-labelledby="airdrops" className="container-site scroll-mt-28 pt-16 md:pt-24">
        <SectionTitle id="airdrops" icon={<Gift className="h-3.5 w-3.5" />} eyebrow="Airdrops" title="Airdrops to watch" description="Always verify an airdrop on the project's official channels. Never share a seed phrase or private key." />
        <AirdropBoard items={airdrops} />
      </section>

      <section aria-labelledby="unlocks" className="container-site scroll-mt-28 pt-16 md:pt-24">
        <SectionTitle id="unlocks" icon={<LockOpen className="h-3.5 w-3.5" />} eyebrow="Token unlocks" title="Upcoming token unlocks" description="Scheduled releases of locked supply, each linked to its public source. Values use today's price." />
        <UnlockBoard items={unlocks} renderedAt={renderTimestamp()} />
      </section>

      <section className="container-site py-16 md:py-24">
        <div className="rounded-[var(--radius-panel)] border border-white/[0.07] bg-white/[0.02] p-6 text-sm text-ink-400 md:p-8">
          <p>
            <strong className="font-medium text-ink-200">For information only — not financial advice.</strong> Crypto assets are volatile and can lose
            their entire value. Figures can be delayed or incomplete; check primary sources before acting on them.
          </p>
          <p className="mt-3">
            Market data provided by{" "}
            <a href="https://coinmarketcap.com/" target="_blank" rel="noopener noreferrer" className="text-ink-200 underline decoration-white/20 underline-offset-4 hover:text-ink-50">
              CoinMarketCap
            </a>
            . Airdrops and token unlocks marked “Curated by Unique Labs” are added by our team from the linked public sources.
          </p>
        </div>
      </section>
    </LiveMarketProvider>
  );
}
