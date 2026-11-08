import "server-only";
import { cached } from "@/lib/content/public";
import { CACHE_TAGS } from "@/lib/content/tags";
import { prisma } from "@/lib/db";
import { createMarketCache, type CacheEntryStatus, type MarketCache } from "@/lib/market/cache";
import { cmcGet, cmcMode, isPlanRestricted } from "@/lib/market/cmc";
import * as n from "@/lib/market/normalize";
import type { AirdropItem, AssetInfo, MarketAsset, MarketSnapshot, TokenUnlockItem } from "@/lib/market/types";

/** Assets fetched per refresh. Up to 250 cost a single CMC credit. */
export const TRACKED_ASSETS = 200;

const MINUTE = 60_000;
const HOUR = 60 * MINUTE;

export interface IntelligenceSettingsDTO {
  enabled: boolean;
  showOnHomepage: boolean;
  assetLimit: number;
  refreshSeconds: number;
  watchlist: string[];
}

export const DEFAULT_INTELLIGENCE_SETTINGS: IntelligenceSettingsDTO = {
  enabled: true,
  showOnHomepage: true,
  assetLimit: 100,
  refreshSeconds: 300,
  watchlist: [],
};

const globalForCache = globalThis as unknown as { __ulMarketCache?: MarketCache };
export const marketCache: MarketCache = (globalForCache.__ulMarketCache ??= createMarketCache());

async function loadIntelligenceSettings(): Promise<IntelligenceSettingsDTO> {
  const row = await prisma.intelligenceSettings.findUnique({ where: { id: 1 } });
  if (!row) return DEFAULT_INTELLIGENCE_SETTINGS;
  return {
    enabled: row.enabled,
    showOnHomepage: row.showOnHomepage,
    assetLimit: row.assetLimit,
    refreshSeconds: row.refreshSeconds,
    watchlist: row.watchlist,
  };
}

export const getIntelligenceSettings = cached(loadIntelligenceSettings, "intelligence:settings", [CACHE_TAGS.intelligence]);

/** Cache lifetimes per dataset, derived from the admin's refresh interval. */
export function datasetTtls(refreshSeconds: number) {
  const r = Math.max(60, refreshSeconds) * 1000;
  return {
    listings: r,
    global: Math.max(r, 5 * MINUTE),
    fearGreed: Math.max(r, 15 * MINUTE),
    fearGreedHistory: 6 * HOUR,
    altSeason: Math.max(r, 15 * MINUTE),
    index: Math.max(r, 10 * MINUTE),
    airdrops: Math.max(r, HOUR),
  };
}

/**
 * Worst case (a visitor in every cache window, all month) — the real number is
 * lower because nothing is fetched while nobody is looking.
 */
export function estimateMonthlyCredits(refreshSeconds: number, withAirdrops: boolean): number {
  const ttl = datasetTtls(refreshSeconds);
  const perMonth = (ms: number, credits = 1) => Math.ceil((30 * 24 * HOUR) / ms) * credits;
  return (
    perMonth(ttl.listings) +
    perMonth(ttl.global) +
    perMonth(ttl.fearGreed) +
    perMonth(ttl.fearGreedHistory) +
    perMonth(ttl.altSeason) +
    perMonth(ttl.index) +
    (withAirdrops ? perMonth(ttl.airdrops, 2) : 0)
  );
}

function required<T>(value: T | null | undefined, what: string): T {
  if (value === null || value === undefined || (Array.isArray(value) && value.length === 0)) {
    throw new Error(`CoinMarketCap returned no usable ${what}.`);
  }
  return value;
}

async function trackedAssets(refreshSeconds: number) {
  const ttl = datasetTtls(refreshSeconds);
  return marketCache.get(
    "listings",
    { ttlMs: ttl.listings, maxStaleMs: Math.max(2 * HOUR, 3 * ttl.listings), backoffMs: MINUTE },
    async () => required(n.normalizeListings(await cmcGet("/v3/cryptocurrency/listings/latest", { limit: TRACKED_ASSETS, convert: "USD" })), "listings"),
  );
}

export async function getMarketSnapshot(): Promise<MarketSnapshot> {
  const settings = await getIntelligenceSettings();
  const ttl = datasetTtls(settings.refreshSeconds);
  const day = 24 * HOUR;

  const [listings, global, fearGreed, history, altSeason, index] = await Promise.all([
    trackedAssets(settings.refreshSeconds),
    marketCache.get("global", { ttlMs: ttl.global, maxStaleMs: Math.max(2 * HOUR, 3 * ttl.global), backoffMs: MINUTE }, async () =>
      required(n.normalizeGlobal(await cmcGet("/v1/global-metrics/quotes/latest", { convert: "USD" })), "global metrics"),
    ),
    marketCache.get("fear-greed", { ttlMs: ttl.fearGreed, maxStaleMs: day, backoffMs: 2 * MINUTE }, async () =>
      required(await cmcGet("/v3/fear-and-greed/latest"), "fear and greed index"),
    ),
    marketCache.get("fear-greed-history", { ttlMs: ttl.fearGreedHistory, maxStaleMs: 3 * day, backoffMs: 10 * MINUTE }, async () =>
      required(await cmcGet("/v3/fear-and-greed/historical", { limit: 90 }), "fear and greed history"),
    ),
    marketCache.get("altcoin-season", { ttlMs: ttl.altSeason, maxStaleMs: day, backoffMs: 5 * MINUTE }, async () =>
      required(n.normalizeAltSeason(await cmcGet("/v1/altcoin-season-index/latest")), "altcoin season index"),
    ),
    marketCache.get("cmc100", { ttlMs: ttl.index, maxStaleMs: day, backoffMs: 5 * MINUTE }, async () =>
      required(n.normalizeIndex(await cmcGet("/v3/index/cmc100-latest"), "CMC100"), "CMC100 index"),
    ),
  ]);

  const assets = (listings.value ?? []).slice(0, settings.assetLimit);
  const newest = assets.reduce<string | null>((latest, a) => (a.lastUpdated && (!latest || a.lastUpdated > latest) ? a.lastUpdated : latest), null);
  return {
    available: assets.length > 0,
    mode: cmcMode(),
    stale: [listings, global, fearGreed, altSeason, index].some((r) => r.stale),
    updatedAt: newest ?? (listings.fetchedAt ? new Date(listings.fetchedAt).toISOString() : null),
    assets,
    global: global.value,
    fearGreed: n.normalizeFearGreed(fearGreed.value, history.value),
    altSeason: altSeason.value,
    index: index.value,
  };
}

export function emptySnapshot(): MarketSnapshot {
  return { available: false, mode: cmcMode(), stale: false, updatedAt: null, assets: [], global: null, fearGreed: null, altSeason: null, index: null };
}

/**
 * For pages where market data is a bonus (the home page): never wait longer
 * than `waitMs` on a cold cache. The refresh keeps running in the background
 * and the next visitor gets the data instantly.
 */
export async function getMarketSnapshotWithin(waitMs: number): Promise<MarketSnapshot> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  const timeout = new Promise<MarketSnapshot>((resolve) => {
    timer = setTimeout(() => resolve(emptySnapshot()), waitMs);
  });
  try {
    return await Promise.race([getMarketSnapshot(), timeout]);
  } finally {
    clearTimeout(timer);
  }
}

export type TrackedAssetLookup = { status: "found"; asset: MarketAsset } | { status: "missing" } | { status: "unavailable" };

/**
 * Detail pages exist only for assets we already track — never arbitrary
 * lookups. "unavailable" (provider down / rate limited) must not be treated as
 * "missing", or search engines would be told a live page is gone.
 */
export async function findTrackedAsset(slug: string): Promise<TrackedAssetLookup> {
  if (!n.isValidSlug(slug)) return { status: "missing" };
  const settings = await getIntelligenceSettings();
  const listings = await trackedAssets(settings.refreshSeconds);
  if (!listings.value) return { status: "unavailable" };
  const asset = listings.value.find((a) => a.slug === slug);
  return asset ? { status: "found", asset } : { status: "missing" };
}

export async function getAssetInfo(id: number): Promise<AssetInfo | null> {
  const result = await marketCache.get(`info:${id}`, { ttlMs: 24 * HOUR, maxStaleMs: 7 * 24 * HOUR, backoffMs: 15 * MINUTE }, async () =>
    required(n.normalizeInfo(await cmcGet("/v2/cryptocurrency/info", { id }), id), "asset metadata"),
  );
  return result.value;
}

// ---------------------------------------------------------------------------
// Curated events (database) + CoinMarketCap airdrops
// ---------------------------------------------------------------------------

async function loadCuratedAirdrops() {
  const rows = await prisma.airdrop.findMany({
    where: { status: "PUBLISHED", verifiedAt: { not: null } },
    orderBy: [{ endsAt: "asc" }, { createdAt: "desc" }],
    take: 200,
  });
  return rows.map((row) => ({
    id: row.id,
    projectName: row.projectName,
    symbol: row.tokenSymbol,
    slug: row.cmcSlug,
    description: row.description,
    reward: row.reward,
    requirements: row.requirements,
    startsAt: row.startsAt?.toISOString() ?? null,
    endsAt: row.endsAt?.toISOString() ?? null,
    url: row.officialUrl,
    sourceUrl: row.sourceUrl,
  }));
}

async function loadCuratedUnlocks() {
  const rows = await prisma.tokenUnlock.findMany({
    where: { status: "PUBLISHED", verifiedAt: { not: null } },
    orderBy: { unlockAt: "asc" },
    take: 300,
  });
  return rows.map((row) => ({
    id: row.id,
    tokenName: row.tokenName,
    symbol: row.tokenSymbol,
    slug: row.cmcSlug,
    unlockAt: row.unlockAt.toISOString(),
    amount: row.amount === null ? null : Number(row.amount),
    percentOfSupply: row.percentOfSupply === null ? null : Number(row.percentOfSupply),
    allocation: row.allocation,
    unlockType: row.unlockType,
    description: row.description,
    sourceUrl: row.sourceUrl,
  }));
}

const getCuratedAirdrops = cached(loadCuratedAirdrops, "intelligence:airdrops", [CACHE_TAGS.intelligence]);
const getCuratedUnlocks = cached(loadCuratedUnlocks, "intelligence:unlocks", [CACHE_TAGS.intelligence]);

export type AirdropFeedState = "ok" | "needs-key" | "plan" | "unavailable";

const STATUS_ORDER = { ONGOING: 0, UPCOMING: 1, ENDED: 2 } as const;

export async function getAirdrops(): Promise<{ items: AirdropItem[]; feed: AirdropFeedState }> {
  const settings = await getIntelligenceSettings();
  const now = Date.now();
  const curated: AirdropItem[] = (await getCuratedAirdrops()).map((a) => ({
    ...a,
    source: "curated" as const,
    status: n.airdropStatus(a.startsAt, a.endsAt, now),
    winnerCount: null,
  }));

  let feed: AirdropFeedState = "needs-key";
  let fromCmc: AirdropItem[] = [];
  if (cmcMode() === "keyed") {
    const ttl = datasetTtls(settings.refreshSeconds);
    const result = await marketCache.get("airdrops", { ttlMs: ttl.airdrops, maxStaleMs: 24 * HOUR, backoffMs: 10 * MINUTE }, async () => {
      const [ongoing, upcoming] = await Promise.all([
        cmcGet("/v1/cryptocurrency/airdrops", { status: "ONGOING", limit: 50 }, { requireKey: true }),
        cmcGet("/v1/cryptocurrency/airdrops", { status: "UPCOMING", limit: 50 }, { requireKey: true }),
      ]);
      return [...n.normalizeAirdrops(ongoing, now), ...n.normalizeAirdrops(upcoming, now)];
    });
    if (result.value) {
      feed = "ok";
      // Re-derive status locally so items that ended since the fetch move along.
      fromCmc = result.value.map((a) => ({ ...a, status: a.endsAt && Date.parse(a.endsAt) < now ? "ENDED" : a.status }));
    } else {
      feed = isPlanRestricted(result.error) ? "plan" : "unavailable";
    }
  }

  const items = [...curated, ...fromCmc].sort((a, b) => {
    const byStatus = STATUS_ORDER[a.status] - STATUS_ORDER[b.status];
    if (byStatus !== 0) return byStatus;
    if (a.status === "UPCOMING") return (a.startsAt ?? "").localeCompare(b.startsAt ?? "");
    if (a.status === "ENDED") return (b.endsAt ?? "").localeCompare(a.endsAt ?? "");
    return (a.endsAt ?? "9999").localeCompare(b.endsAt ?? "9999");
  });
  return { items, feed };
}

export async function getTokenUnlocks(assets: MarketAsset[]): Promise<TokenUnlockItem[]> {
  const unlocks = await getCuratedUnlocks();
  const bySlug = new Map(assets.map((a) => [a.slug, a]));
  const bySymbol = new Map<string, MarketAsset | null>();
  for (const a of assets) {
    const key = a.symbol.toUpperCase();
    // Symbols aren't unique across chains; only use unambiguous matches.
    bySymbol.set(key, bySymbol.has(key) ? null : a);
  }
  return unlocks.map((u) => {
    const asset = (u.slug ? bySlug.get(u.slug) : undefined) ?? bySymbol.get(u.symbol.toUpperCase()) ?? null;
    const valueUsd = asset?.price != null && u.amount != null ? asset.price * u.amount : null;
    return { ...u, slug: u.slug ?? asset?.slug ?? null, valueUsd };
  });
}

// ---------------------------------------------------------------------------
// Admin status
// ---------------------------------------------------------------------------

export interface KeyUsage {
  creditLimitMonthly: number | null;
  creditsUsedMonth: number | null;
  creditsLeftMonth: number | null;
  creditsUsedDay: number | null;
  rateLimitMinute: number | null;
  resetsAt: string | null;
}

export async function getMarketStatus(): Promise<{ mode: ReturnType<typeof cmcMode>; datasets: CacheEntryStatus[]; usage: KeyUsage | null; usageError: string | null }> {
  const mode = cmcMode();
  let usage: KeyUsage | null = null;
  let usageError: string | null = null;
  if (mode === "keyed") {
    const result = await marketCache.get("key-info", { ttlMs: 10 * MINUTE, maxStaleMs: HOUR, backoffMs: 5 * MINUTE }, async () => {
      const data = await cmcGet("/v1/key/info", {}, { requireKey: true });
      if (!n.isObj(data)) throw new Error("Unexpected key info response.");
      const plan = n.isObj(data.plan) ? data.plan : {};
      const u = n.isObj(data.usage) ? data.usage : {};
      const month = n.isObj(u.current_month) ? u.current_month : {};
      const dayUsage = n.isObj(u.current_day) ? u.current_day : {};
      return {
        creditLimitMonthly: n.toNum(plan.credit_limit_monthly),
        creditsUsedMonth: n.toNum(month.credits_used),
        creditsLeftMonth: n.toNum(month.credits_left),
        creditsUsedDay: n.toNum(dayUsage.credits_used),
        rateLimitMinute: n.toNum(plan.rate_limit_minute),
        resetsAt: typeof plan.credit_limit_monthly_reset_timestamp === "string" ? plan.credit_limit_monthly_reset_timestamp : null,
      } satisfies KeyUsage;
    });
    usage = result.value;
    usageError = result.error;
  }
  const datasets = marketCache.status().filter((d) => d.key !== "key-info" && !d.key.startsWith("info:"));
  return { mode, datasets, usage, usageError };
}
