import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AssetDetail } from "@/components/market/asset-detail";
import { AirdropBoard, UnlockBoard } from "@/components/market/events";
import { LiveMarketProvider } from "@/components/market/live-market";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Aurora } from "@/components/visuals/aurora";
import { formatPrice, renderTimestamp } from "@/lib/market/format";
import { findTrackedAsset, getAirdrops, getAssetInfo, getIntelligenceSettings, getMarketSnapshot, getTokenUnlocks } from "@/lib/market/service";
import { pageMetadata } from "@/lib/seo/metadata";

type Params = Promise<{ slug: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const lookup = await findTrackedAsset(slug);
  if (lookup.status !== "found") return { title: lookup.status === "missing" ? "Not found" : "Market data", robots: { index: false } };
  const { asset } = lookup;
  return pageMetadata({
    title: `${asset.name} (${asset.symbol}) price, market cap & supply`,
    description: `Live ${asset.name} price${asset.price != null ? ` (${formatPrice(asset.price)})` : ""}, market cap, 24h volume, supply and links — updated continuously from CoinMarketCap data.`,
    path: `/intelligence/${asset.slug}`,
    image: "/og/intelligence",
  });
}

export default async function AssetPage({ params }: { params: Params }) {
  const settings = await getIntelligenceSettings();
  if (!settings.enabled) notFound();
  const { slug } = await params;
  const lookup = await findTrackedAsset(slug);
  if (lookup.status === "missing") notFound();
  // Temporary provider failure: render the error page (5xx), not a 404.
  if (lookup.status === "unavailable") throw new Error("Market data is temporarily unavailable.");
  const { asset } = lookup;
  const [snapshot, info, airdropFeed] = await Promise.all([getMarketSnapshot(), getAssetInfo(asset.id), getAirdrops()]);
  const unlocks = (await getTokenUnlocks(snapshot.assets)).filter((u) => u.slug === asset.slug || (!u.slug && u.symbol.toUpperCase() === asset.symbol.toUpperCase()));
  const airdrops = airdropFeed.items.filter((a) => a.slug === asset.slug);

  return (
    <LiveMarketProvider initial={snapshot}>
      <section className="relative overflow-hidden pt-[calc(var(--header-height)+2.5rem)] pb-14 md:pt-[calc(var(--header-height)+4rem)] md:pb-20">
        <Aurora tone="cool" />
        <div className="container-site relative">
          <Breadcrumbs
            items={[
              { name: "Intelligence", path: "/intelligence" },
              { name: asset.name, path: `/intelligence/${asset.slug}` },
            ]}
          />
          <div className="mt-8">
            <AssetDetail fallback={asset} info={info} />
          </div>
        </div>
      </section>

      {unlocks.length > 0 ? (
        <section className="container-site pb-14" aria-labelledby="asset-unlocks">
          <h2 id="asset-unlocks" className="mb-6 font-display text-2xl font-medium tracking-[-0.03em] text-ink-50">
            {asset.symbol} token unlocks
          </h2>
          <UnlockBoard items={unlocks} renderedAt={renderTimestamp()} />
        </section>
      ) : null}

      {airdrops.length > 0 ? (
        <section className="container-site pb-14" aria-labelledby="asset-airdrops">
          <h2 id="asset-airdrops" className="mb-6 font-display text-2xl font-medium tracking-[-0.03em] text-ink-50">
            {asset.symbol} airdrops
          </h2>
          <AirdropBoard items={airdrops} />
        </section>
      ) : null}

      <section className="container-site pb-20">
        <p className="text-xs text-ink-500">
          For information only — not financial advice. Market data provided by{" "}
          <a href={`https://coinmarketcap.com/currencies/${asset.slug}/`} target="_blank" rel="noopener noreferrer" className="underline decoration-white/20 underline-offset-4 hover:text-ink-200">
            CoinMarketCap
          </a>
          .
        </p>
      </section>
    </LiveMarketProvider>
  );
}
