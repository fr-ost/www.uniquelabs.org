/**
 * Market Intelligence DTOs. These are the only shapes that leave the server:
 * normalised, validated and stripped of anything we don't display.
 * Safe to import from client components.
 */

export type MarketMode = "keyed" | "keyless";

export interface MarketAsset {
  id: number;
  rank: number | null;
  name: string;
  symbol: string;
  slug: string;
  price: number | null;
  change1h: number | null;
  change24h: number | null;
  change7d: number | null;
  change30d: number | null;
  change90d: number | null;
  marketCap: number | null;
  fdv: number | null;
  volume24h: number | null;
  volumeChange24h: number | null;
  dominance: number | null;
  circulatingSupply: number | null;
  totalSupply: number | null;
  maxSupply: number | null;
  infiniteSupply: boolean;
  marketPairs: number | null;
  dateAdded: string | null;
  /** Category keys from MARKET_CATEGORIES that this asset belongs to. */
  categories: string[];
  lastUpdated: string | null;
}

export interface GlobalMetrics {
  totalMarketCap: number | null;
  totalMarketCapChange24h: number | null;
  totalVolume24h: number | null;
  totalVolumeChange24h: number | null;
  altcoinMarketCap: number | null;
  btcDominance: number | null;
  btcDominanceChange24h: number | null;
  ethDominance: number | null;
  ethDominanceChange24h: number | null;
  defiMarketCap: number | null;
  defiVolume24h: number | null;
  stablecoinMarketCap: number | null;
  stablecoinVolume24h: number | null;
  derivativesVolume24h: number | null;
  activeCryptocurrencies: number | null;
  activeExchanges: number | null;
  activeMarketPairs: number | null;
  newAssets24h: number | null;
  lastUpdated: string | null;
}

export interface FearGreedPoint {
  /** Unix time in milliseconds. */
  t: number;
  value: number;
}

export interface FearGreed {
  value: number;
  classification: string;
  updatedAt: string | null;
  history: FearGreedPoint[];
}

export interface AltcoinSeason {
  index: number;
  yearlyHigh: number | null;
  yearlyLow: number | null;
  updatedAt: string | null;
}

export interface MarketIndex {
  name: string;
  value: number;
  change24h: number | null;
  updatedAt: string | null;
  constituents: Array<{ id: number; name: string; symbol: string; weight: number }>;
}

export interface MarketSnapshot {
  available: boolean;
  mode: MarketMode;
  /** True when at least one dataset is being served from an older copy because a refresh failed. */
  stale: boolean;
  /** ISO time of the newest price data in this snapshot. */
  updatedAt: string | null;
  assets: MarketAsset[];
  global: GlobalMetrics | null;
  fearGreed: FearGreed | null;
  altSeason: AltcoinSeason | null;
  index: MarketIndex | null;
}

export interface AssetLinks {
  website: string[];
  explorer: string[];
  docs: string[];
  sourceCode: string[];
  community: Array<{ label: string; url: string }>;
}

export interface AssetInfo {
  description: string | null;
  category: string | null;
  dateLaunched: string | null;
  links: AssetLinks;
}

export type AirdropStatus = "UPCOMING" | "ONGOING" | "ENDED";

export interface AirdropItem {
  id: string;
  source: "cmc" | "curated";
  projectName: string;
  symbol: string | null;
  slug: string | null;
  description: string | null;
  reward: string | null;
  requirements: string | null;
  startsAt: string | null;
  endsAt: string | null;
  status: AirdropStatus;
  url: string | null;
  sourceUrl: string | null;
  winnerCount: number | null;
}

export interface TokenUnlockItem {
  id: string;
  tokenName: string;
  symbol: string;
  slug: string | null;
  unlockAt: string;
  amount: number | null;
  percentOfSupply: number | null;
  allocation: string | null;
  unlockType: "CLIFF" | "LINEAR" | "OTHER";
  description: string | null;
  sourceUrl: string;
  /** amount × current price, when the token is in the tracked listings. */
  valueUsd: number | null;
}
