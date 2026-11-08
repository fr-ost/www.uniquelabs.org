import type {
  AirdropItem,
  AirdropStatus,
  AltcoinSeason,
  AssetInfo,
  FearGreed,
  FearGreedPoint,
  GlobalMetrics,
  MarketAsset,
  MarketIndex,
} from "@/lib/market/types";

/**
 * Pure normalisers for CoinMarketCap responses (the `data` member of the
 * response envelope). They never trust the shape: malformed entries are
 * skipped, numbers must be finite, strings are length-limited and URLs must be
 * http(s). Field names follow the live v3/v1 API (Nov 2026), which returns
 * `quote` as an array in v3 listings and as a currency map elsewhere.
 */

type Obj = Record<string, unknown>;

export const MARKET_CATEGORIES = [
  { key: "layer-1", label: "Layer 1" },
  { key: "defi", label: "DeFi" },
  { key: "ai-big-data", label: "AI" },
  { key: "memes", label: "Memes" },
  { key: "stablecoin", label: "Stablecoins" },
  { key: "real-world-assets-protocols", label: "RWA" },
  { key: "depin", label: "DePIN" },
  { key: "decentralized-exchange-dex-token", label: "DEX" },
  { key: "gaming", label: "Gaming" },
  { key: "privacy", label: "Privacy" },
  { key: "payments", label: "Payments" },
] as const;

const CATEGORY_KEYS = new Set<string>(MARKET_CATEGORIES.map((c) => c.key));

export function isObj(value: unknown): value is Obj {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function toNum(value: unknown): number | null {
  if (typeof value === "number") return Number.isFinite(value) ? value : null;
  if (typeof value === "string" && value.trim() !== "") {
    const n = Number(value);
    return Number.isFinite(n) ? n : null;
  }
  return null;
}

function toInt(value: unknown): number | null {
  const n = toNum(value);
  return n === null ? null : Math.trunc(n);
}

function toStr(value: unknown, max: number): string | null {
  if (typeof value !== "string") return null;
  // Strip control characters; React escapes the rest at render time.
  const cleaned = value.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "").trim();
  if (!cleaned) return null;
  return cleaned.length > max ? `${cleaned.slice(0, max - 1).trimEnd()}…` : cleaned;
}

function toIso(value: unknown): string | null {
  if (typeof value !== "string" && typeof value !== "number") return null;
  const d = new Date(typeof value === "number" ? value : value);
  return Number.isNaN(d.getTime()) ? null : d.toISOString();
}

export function safeUrl(value: unknown): string | null {
  if (typeof value !== "string") return null;
  try {
    const url = new URL(value.trim());
    if (url.protocol !== "https:" && url.protocol !== "http:") return null;
    if (url.username || url.password) return null;
    return url.toString();
  } catch {
    return null;
  }
}

const SLUG_RE = /^[a-z0-9][a-z0-9-]{0,79}$/;

export function isValidSlug(value: unknown): value is string {
  return typeof value === "string" && SLUG_RE.test(value);
}

/** Picks the USD quote from either the v3 array form or the classic map form. */
export function usdQuote(entry: Obj, currency = "USD"): Obj | null {
  const quote = entry.quote;
  if (Array.isArray(quote)) {
    const match = quote.find((q) => isObj(q) && (q.symbol === currency || (currency === "USD" && q.id === 2781)));
    return isObj(match) ? match : null;
  }
  if (isObj(quote)) {
    const value = quote[currency];
    return isObj(value) ? value : null;
  }
  return null;
}

export function normalizeAsset(entry: unknown): MarketAsset | null {
  if (!isObj(entry)) return null;
  const id = toInt(entry.id);
  const name = toStr(entry.name, 80);
  const symbol = toStr(entry.symbol, 20);
  const slug = isValidSlug(entry.slug) ? entry.slug : null;
  if (id === null || id <= 0 || !name || !symbol || !slug) return null;
  const q = usdQuote(entry) ?? {};
  const tags = Array.isArray(entry.tags) ? entry.tags.filter((t): t is string => typeof t === "string") : [];
  return {
    id,
    rank: toInt(entry.cmc_rank),
    name,
    symbol,
    slug,
    price: toNum(q.price),
    change1h: toNum(q.percent_change_1h),
    change24h: toNum(q.percent_change_24h),
    change7d: toNum(q.percent_change_7d),
    change30d: toNum(q.percent_change_30d),
    change90d: toNum(q.percent_change_90d),
    marketCap: toNum(q.market_cap),
    fdv: toNum(q.fully_diluted_market_cap),
    volume24h: toNum(q.volume_24h),
    volumeChange24h: toNum(q.volume_change_24h),
    dominance: toNum(q.market_cap_dominance),
    circulatingSupply: toNum(entry.circulating_supply),
    totalSupply: toNum(entry.total_supply),
    maxSupply: toNum(entry.max_supply),
    infiniteSupply: entry.infinite_supply === true,
    marketPairs: toInt(entry.num_market_pairs),
    dateAdded: toIso(entry.date_added),
    categories: [...new Set(tags.filter((t) => CATEGORY_KEYS.has(t)))],
    lastUpdated: toIso(q.last_updated ?? entry.last_updated),
  };
}

export function normalizeListings(data: unknown): MarketAsset[] {
  if (!Array.isArray(data)) return [];
  const seen = new Set<number>();
  const assets: MarketAsset[] = [];
  for (const entry of data) {
    const asset = normalizeAsset(entry);
    if (!asset || seen.has(asset.id)) continue;
    seen.add(asset.id);
    assets.push(asset);
  }
  return assets.sort((a, b) => (a.rank ?? Number.MAX_SAFE_INTEGER) - (b.rank ?? Number.MAX_SAFE_INTEGER));
}

export function normalizeGlobal(data: unknown): GlobalMetrics | null {
  if (!isObj(data)) return null;
  const q = usdQuote(data) ?? {};
  const metrics: GlobalMetrics = {
    totalMarketCap: toNum(q.total_market_cap),
    totalMarketCapChange24h: toNum(q.total_market_cap_yesterday_percentage_change),
    totalVolume24h: toNum(q.total_volume_24h),
    totalVolumeChange24h: toNum(q.total_volume_24h_yesterday_percentage_change),
    altcoinMarketCap: toNum(q.altcoin_market_cap),
    btcDominance: toNum(data.btc_dominance),
    btcDominanceChange24h: toNum(data.btc_dominance_24h_percentage_change),
    ethDominance: toNum(data.eth_dominance),
    ethDominanceChange24h: toNum(data.eth_dominance_24h_percentage_change),
    defiMarketCap: toNum(q.defi_market_cap ?? data.defi_market_cap),
    defiVolume24h: toNum(q.defi_volume_24h ?? data.defi_volume_24h),
    stablecoinMarketCap: toNum(q.stablecoin_market_cap ?? data.stablecoin_market_cap),
    stablecoinVolume24h: toNum(q.stablecoin_volume_24h ?? data.stablecoin_volume_24h),
    derivativesVolume24h: toNum(q.derivatives_volume_24h ?? data.derivatives_volume_24h),
    activeCryptocurrencies: toInt(data.active_cryptocurrencies),
    activeExchanges: toInt(data.active_exchanges),
    activeMarketPairs: toInt(data.active_market_pairs),
    newAssets24h: toInt(data.past_24h_incremental_crypto_number),
    lastUpdated: toIso(data.last_updated ?? q.last_updated),
  };
  return metrics.totalMarketCap === null && metrics.btcDominance === null ? null : metrics;
}

const FNG_LABELS: Array<[number, string]> = [
  [20, "Extreme fear"],
  [40, "Fear"],
  [60, "Neutral"],
  [80, "Greed"],
  [101, "Extreme greed"],
];

export function fearGreedLabel(value: number): string {
  return FNG_LABELS.find(([limit]) => value < limit)?.[1] ?? "Extreme greed";
}

function clampIndex(value: number | null): number | null {
  if (value === null) return null;
  return Math.max(0, Math.min(100, Math.round(value)));
}

export function normalizeFearGreed(latest: unknown, history: unknown): FearGreed | null {
  if (!isObj(latest)) return null;
  const value = clampIndex(toNum(latest.value));
  if (value === null) return null;
  const points: FearGreedPoint[] = [];
  if (Array.isArray(history)) {
    for (const row of history) {
      if (!isObj(row)) continue;
      const v = clampIndex(toNum(row.value));
      const ts = toNum(row.timestamp);
      if (v === null || ts === null) continue;
      // The API sends unix seconds (as a string); accept milliseconds too.
      points.push({ t: ts < 1e12 ? ts * 1000 : ts, value: v });
    }
  }
  points.sort((a, b) => a.t - b.t);
  return {
    value,
    classification: fearGreedLabel(value),
    updatedAt: toIso(latest.update_time),
    history: points.slice(-90),
  };
}

export function normalizeAltSeason(data: unknown): AltcoinSeason | null {
  if (!isObj(data)) return null;
  const index = clampIndex(toNum(data.altcoin_index));
  if (index === null) return null;
  return {
    index,
    yearlyHigh: clampIndex(toNum(data.yearly_high)),
    yearlyLow: clampIndex(toNum(data.yearly_low)),
    updatedAt: toIso(data.snapshot_time),
  };
}

export function normalizeIndex(data: unknown, name = "CMC100"): MarketIndex | null {
  if (!isObj(data)) return null;
  const value = toNum(data.value);
  if (value === null) return null;
  const constituents = Array.isArray(data.constituents)
    ? data.constituents.flatMap((c) => {
        if (!isObj(c)) return [];
        const id = toInt(c.id);
        const cName = toStr(c.name, 80);
        const symbol = toStr(c.symbol, 20);
        const weight = toNum(c.weight);
        return id && cName && symbol && weight !== null ? [{ id, name: cName, symbol, weight }] : [];
      })
    : [];
  return {
    name,
    value,
    change24h: toNum(data.value_24h_percentage_change),
    updatedAt: toIso(data.last_update),
    constituents: constituents.slice(0, 10),
  };
}

export function airdropStatus(startsAt: string | null, endsAt: string | null, now = Date.now()): AirdropStatus {
  if (endsAt && Date.parse(endsAt) < now) return "ENDED";
  if (startsAt && Date.parse(startsAt) > now) return "UPCOMING";
  return "ONGOING";
}

export function normalizeAirdrops(data: unknown, now = Date.now()): AirdropItem[] {
  if (!Array.isArray(data)) return [];
  return data.flatMap((row): AirdropItem[] => {
    if (!isObj(row)) return [];
    const id = toStr(row.id, 64);
    const projectName = toStr(row.project_name, 120) ?? (isObj(row.coin) ? toStr(row.coin.name, 120) : null);
    if (!id || !projectName) return [];
    const startsAt = toIso(row.start_date);
    const endsAt = toIso(row.end_date);
    const coin = isObj(row.coin) ? row.coin : {};
    const declared = typeof row.status === "string" ? row.status.toUpperCase() : "";
    const status: AirdropStatus =
      declared === "UPCOMING" || declared === "ONGOING" || declared === "ENDED"
        ? (declared as AirdropStatus)
        : airdropStatus(startsAt, endsAt, now);
    return [
      {
        id: `cmc-${id}`,
        source: "cmc",
        projectName,
        symbol: toStr(coin.symbol, 20),
        slug: isValidSlug(coin.slug) ? coin.slug : null,
        description: toStr(row.description, 600),
        reward: toStr(row.total_prize, 80),
        requirements: null,
        startsAt,
        endsAt,
        status,
        url: safeUrl(row.link),
        sourceUrl: null,
        winnerCount: toInt(row.winner_count),
      },
    ];
  });
}

function urlList(value: unknown, max = 3): string[] {
  if (!Array.isArray(value)) return [];
  return [...new Set(value.map(safeUrl).filter((u): u is string => u !== null))].slice(0, max);
}

export function normalizeInfo(data: unknown, id: number): AssetInfo | null {
  if (!isObj(data)) return null;
  // v2 info is keyed by id with an array (or object) value.
  let raw: unknown = data[String(id)];
  if (Array.isArray(raw)) raw = raw[0];
  if (!isObj(raw)) return null;
  const urls = isObj(raw.urls) ? raw.urls : {};
  const community: Array<{ label: string; url: string }> = [];
  const twitter = typeof raw.twitter_username === "string" && /^[A-Za-z0-9_]{1,15}$/.test(raw.twitter_username) ? raw.twitter_username : null;
  if (twitter) community.push({ label: "X (Twitter)", url: `https://x.com/${twitter}` });
  for (const url of urlList(urls.reddit, 1)) community.push({ label: "Reddit", url });
  for (const url of urlList(urls.chat, 1)) community.push({ label: "Chat", url });
  for (const url of urlList(urls.message_board, 1)) community.push({ label: "Forum", url });
  return {
    description: toStr(raw.description, 1600),
    category: toStr(raw.category, 40),
    dateLaunched: toIso(raw.date_launched),
    links: {
      website: urlList(urls.website, 2),
      explorer: urlList(urls.explorer, 3),
      docs: urlList(urls.technical_doc, 2),
      sourceCode: urlList(urls.source_code, 2),
      community,
    },
  };
}
