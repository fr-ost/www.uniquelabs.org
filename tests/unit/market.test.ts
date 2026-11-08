import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it, vi } from "vitest";
import { BackoffHint, createMarketCache } from "@/lib/market/cache";
import { formatCompact, formatCountdown, formatPercent, formatPrice, formatUsdCompact, trendOf } from "@/lib/market/format";
import {
  airdropStatus,
  fearGreedLabel,
  MARKET_CATEGORIES,
  normalizeAirdrops,
  normalizeAltSeason,
  normalizeFearGreed,
  normalizeGlobal,
  normalizeIndex,
  normalizeInfo,
  normalizeListings,
  safeUrl,
  usdQuote,
} from "@/lib/market/normalize";

/** Fixtures are trimmed copies of live CoinMarketCap responses (Nov 2026). */
function fixture(name: string): { data?: unknown; status?: unknown } {
  return JSON.parse(readFileSync(join(process.cwd(), "tests/fixtures/cmc", `${name}.json`), "utf8"));
}

describe("market formatting", () => {
  it("adapts price precision to magnitude", () => {
    expect(formatPrice(75936.023)).toBe("$75,936");
    expect(formatPrice(2233.6726)).toBe("$2,233.67");
    expect(formatPrice(0.9987)).toBe("$0.9987");
    expect(formatPrice(0.00000501123)).toBe("$0.000005011");
    expect(formatPrice(null)).toBe("—");
  });

  it("formats compact values identically on every runtime", () => {
    expect(formatUsdCompact(116_700_000)).toBe("$116.7M");
    expect(formatUsdCompact(2_542_853_439_943)).toBe("$2.54T");
    expect(formatUsdCompact(272_826_199_159)).toBe("$272.8B");
    expect(formatCompact(20_109_596)).toBe("20.11M");
    expect(formatCompact(108_980)).toBe("109K");
    expect(formatCompact(12_345)).toBe("12.35K");
    expect(formatCompact(999_996)).toBe("1M");
    expect(formatCompact(1000)).toBe("1K");
    expect(formatCompact(42)).toBe("42");
    expect(formatUsdCompact(-5_000_000)).toBe("−$5M");
  });

  it("signs percentages with a true minus and flags direction", () => {
    expect(formatPercent(0.357)).toBe("+0.36%");
    expect(formatPercent(-2.5399)).toBe("−2.54%");
    expect(formatPercent(0.001)).toBe("0.00%");
    expect(formatPercent(60.05, { signed: false })).toBe("60.05%");
    expect(trendOf(1)).toBe("up");
    expect(trendOf(-1)).toBe("down");
    expect(trendOf(0.001)).toBe("flat");
  });

  it("formats countdowns both ways", () => {
    const now = Date.parse("2026-11-08T12:00:00Z");
    expect(formatCountdown("2026-11-11T16:00:00Z", now)).toBe("in 3d 4h");
    expect(formatCountdown("2026-11-08T10:30:00Z", now)).toBe("1h 30m ago");
  });
});

describe("CoinMarketCap normalisation", () => {
  it("reads v3 listings (quote as an array) and keeps only valid assets", () => {
    const assets = normalizeListings(fixture("listings").data);
    expect(assets.map((a) => a.symbol)).toEqual(["BTC", "ETH", "USDT", "SOL", "DOGE"]);
    const btc = assets[0]!;
    expect(btc).toMatchObject({ id: 1, rank: 1, slug: "bitcoin", maxSupply: 21_000_000, infiniteSupply: false });
    expect(btc.price).toBeGreaterThan(1000);
    expect(btc.marketCap).toBeGreaterThan(1e11);
    expect(assets.flatMap((a) => a.categories).every((c) => MARKET_CATEGORIES.some((k) => k.key === c))).toBe(true);
    const [tagged] = normalizeListings([{ id: 9, name: "Frog", symbol: "FRG", slug: "frog", tags: ["memes", "unknown-tag", "memes", 7] }]);
    expect(tagged!.categories).toEqual(["memes"]);
  });

  it("rejects malformed entries instead of failing", () => {
    const assets = normalizeListings([
      { id: "x", name: "Bad", symbol: "BAD", slug: "bad" },
      { id: 5, name: "No slug", symbol: "NS" },
      { id: 6, name: "Weird slug", symbol: "WS", slug: "../../etc" },
      { id: 7, name: "Fine", symbol: "OK", slug: "fine", cmc_rank: 3, quote: { USD: { price: "1.5" } } },
      null,
      "nope",
    ]);
    expect(assets).toHaveLength(1);
    expect(assets[0]).toMatchObject({ id: 7, price: 1.5, change24h: null });
    expect(normalizeListings({ not: "an array" })).toEqual([]);
  });

  it("supports both quote shapes", () => {
    expect(usdQuote({ quote: [{ symbol: "EUR", price: 1 }, { symbol: "USD", price: 2 }] })).toEqual({ symbol: "USD", price: 2 });
    expect(usdQuote({ quote: { USD: { price: 3 } } })).toEqual({ price: 3 });
    expect(usdQuote({ quote: "?" })).toBeNull();
  });

  it("reads global metrics", () => {
    const global = normalizeGlobal(fixture("global").data)!;
    expect(global.totalMarketCap).toBeGreaterThan(1e12);
    expect(global.btcDominance).toBeGreaterThan(30);
    expect(global.activeCryptocurrencies).toBeGreaterThan(1000);
    expect(normalizeGlobal({})).toBeNull();
  });

  it("reads fear & greed with history (unix seconds as strings)", () => {
    const fg = normalizeFearGreed(fixture("fng").data, fixture("fnghist").data)!;
    expect(fg.value).toBe(32);
    expect(fg.classification).toBe("Fear");
    expect(fg.history.length).toBe(5);
    expect(fg.history[0]!.t).toBeLessThan(fg.history[4]!.t);
    expect(fg.history[4]!.t).toBeGreaterThan(1.7e12);
    expect(fearGreedLabel(85)).toBe("Extreme greed");
    expect(normalizeFearGreed({ value: "n/a" }, [])).toBeNull();
  });

  it("reads the altcoin season and CMC100 indices", () => {
    expect(normalizeAltSeason(fixture("altseason").data)).toMatchObject({ index: 38, yearlyHigh: 64, yearlyLow: 14 });
    const index = normalizeIndex(fixture("cmc100").data)!;
    expect(index.value).toBeCloseTo(148.25);
    expect(index.constituents[0]).toMatchObject({ symbol: "BTC" });
  });

  it("reads coin metadata and keeps only http(s) links", () => {
    const info = normalizeInfo(fixture("info").data, 1)!;
    expect(info.description).toMatch(/Bitcoin/);
    expect(info.links.website[0]).toBe("https://bitcoin.org/");
    expect(info.links.explorer.length).toBeGreaterThan(0);
    expect(safeUrl("javascript:alert(1)")).toBeNull();
    expect(safeUrl("https://user:pw@example.com")).toBeNull();
    expect(safeUrl("https://example.com/a")).toBe("https://example.com/a");
  });

  it("normalises airdrops and derives status when it is missing", () => {
    const now = Date.parse("2026-11-08T00:00:00Z");
    const items = normalizeAirdrops(
      [
        { id: "a1", project_name: "Alpha", status: "ONGOING", start_date: "2026-11-01T00:00:00Z", end_date: "2026-11-20T00:00:00Z", total_prize: "100000", winner_count: 500, link: "https://coinmarketcap.com/airdrop/a1", coin: { id: 1, name: "Alpha", symbol: "ALP", slug: "alpha" } },
        { id: "a2", project_name: "Beta", start_date: "2026-12-01T00:00:00Z", end_date: "2026-12-20T00:00:00Z", link: "javascript:void(0)" },
        { project_name: "No id" },
      ],
      now,
    );
    expect(items).toHaveLength(2);
    expect(items[0]).toMatchObject({ id: "cmc-a1", status: "ONGOING", slug: "alpha", winnerCount: 500, url: "https://coinmarketcap.com/airdrop/a1" });
    expect(items[1]).toMatchObject({ status: "UPCOMING", url: null });
    expect(airdropStatus("2026-10-01T00:00:00Z", "2026-10-05T00:00:00Z", now)).toBe("ENDED");
  });
});

describe("market cache", () => {
  const options = { ttlMs: 1000, maxStaleMs: 10_000, backoffMs: 5000 };

  it("serves fresh values without calling the loader again", async () => {
    let t = 0;
    const cache = createMarketCache(() => t);
    const loader = vi.fn(async () => "v1");
    expect((await cache.get("k", options, loader)).value).toBe("v1");
    t = 500;
    expect((await cache.get("k", options, loader)).value).toBe("v1");
    expect(loader).toHaveBeenCalledTimes(1);
  });

  it("shares one upstream request between concurrent callers", async () => {
    const cache = createMarketCache(() => 0);
    let resolve!: (v: string) => void;
    const loader = vi.fn(() => new Promise<string>((r) => (resolve = r)));
    const a = cache.get("k", options, loader);
    const b = cache.get("k", options, loader);
    resolve("shared");
    expect((await a).value).toBe("shared");
    expect((await b).value).toBe("shared");
    expect(loader).toHaveBeenCalledTimes(1);
  });

  it("serves stale data while refreshing, and keeps it when the refresh fails", async () => {
    let t = 0;
    const cache = createMarketCache(() => t);
    await cache.get("k", options, async () => "old");
    t = 2000; // stale
    const failing = vi.fn(async () => {
      throw new Error("provider down");
    });
    const result = await cache.get("k", options, failing);
    expect(result).toMatchObject({ value: "old", stale: true });
    await new Promise((r) => setTimeout(r, 0));
    const after = await cache.get("k", options, failing);
    expect(after).toMatchObject({ value: "old", stale: true, error: "provider down" });
    // Backoff: no new attempt until backoffMs has passed.
    expect(failing).toHaveBeenCalledTimes(1);
  });

  it("drops values older than maxStale and honours backoff hints", async () => {
    let t = 0;
    const cache = createMarketCache(() => t);
    await cache.get("k", options, async () => "old");
    t = 20_000;
    const limited = vi.fn(async () => {
      throw new BackoffHint("rate limited", 60_000);
    });
    expect((await cache.get("k", options, limited)).value).toBeNull();
    t = 30_000;
    expect((await cache.get("k", options, limited)).error).toBe("rate limited");
    expect(limited).toHaveBeenCalledTimes(1);
    t = 90_000;
    await cache.get("k", options, async () => "new");
    expect((await cache.get("k", options, async () => "unused")).value).toBe("new");
  });
});
