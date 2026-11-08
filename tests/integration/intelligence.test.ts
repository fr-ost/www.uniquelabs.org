import { describe, expect, it } from "vitest";
import { prisma } from "@/lib/db";
import { hashPassword } from "@/lib/auth/password";
import { createSession } from "@/lib/auth/session";
import { getAirdrops, getIntelligenceSettings, getTokenUnlocks } from "@/lib/market/service";
import type { MarketAsset } from "@/lib/market/types";
import { saveAirdrop, saveIntelligenceSettings, saveTokenUnlock, setAirdropStatus } from "@/server/actions/intelligence";
import { RedirectSignal } from "./setup";

async function signIn() {
  const user = await prisma.adminUser.create({
    data: { email: "owner@example.com", name: "Owner", role: "OWNER", passwordHash: await hashPassword("Grey-Otter-Canyon-91") },
  });
  await createSession(user.id);
}

function form(values: Record<string, string>) {
  const data = new FormData();
  for (const [key, value] of Object.entries(values)) data.set(key, value);
  return data;
}

const initial = { ok: false };

function asset(overrides: Partial<MarketAsset>): MarketAsset {
  return {
    id: 11841, rank: 50, name: "Arbitrum", symbol: "ARB", slug: "arbitrum", price: 0.5, change1h: 0, change24h: 0, change7d: 0, change30d: 0, change90d: 0,
    marketCap: 1, fdv: 1, volume24h: 1, volumeChange24h: 0, dominance: 0, circulatingSupply: 1, totalSupply: 1, maxSupply: 1, infiniteSupply: false,
    marketPairs: 1, dateAdded: null, categories: [], lastUpdated: null, ...overrides,
  };
}

describe("intelligence admin", () => {
  it("requires an admin session", async () => {
    await expect(saveIntelligenceSettings(initial, form({ assetLimit: "50", refreshMinutes: "5" }))).rejects.toBeInstanceOf(RedirectSignal);
    await expect(saveAirdrop(null, initial, form({ projectName: "X", officialUrl: "https://x.example" }))).rejects.toBeInstanceOf(RedirectSignal);
  });

  it("validates and stores settings", async () => {
    await signIn();
    const bad = await saveIntelligenceSettings(initial, form({ assetLimit: "500", refreshMinutes: "0", watchlist: "BTC, <script>" }));
    expect(bad.ok).toBe(false);
    expect(Object.keys(bad.fieldErrors ?? {})).toEqual(expect.arrayContaining(["assetLimit", "refreshMinutes", "watchlist"]));

    const ok = await saveIntelligenceSettings(initial, form({ enabled: "on", assetLimit: "50", refreshMinutes: "2.5", watchlist: "btc, eth eth" }));
    expect(ok.ok).toBe(true);
    const row = await prisma.intelligenceSettings.findUniqueOrThrow({ where: { id: 1 } });
    expect(row).toMatchObject({ enabled: true, showOnHomepage: false, assetLimit: 50, refreshSeconds: 150, watchlist: ["BTC", "ETH"] });
    expect(await getIntelligenceSettings()).toMatchObject({ assetLimit: 50, refreshSeconds: 150 });
  });

  it("the database refuses to publish unverified curated events", async () => {
    await expect(prisma.airdrop.create({ data: { projectName: "A", officialUrl: "https://a.example", status: "PUBLISHED" } })).rejects.toThrow();
    await expect(
      prisma.tokenUnlock.create({ data: { tokenName: "T", tokenSymbol: "T", unlockAt: new Date(), sourceUrl: "https://t.example", status: "PUBLISHED" } }),
    ).rejects.toThrow();
    await expect(
      prisma.tokenUnlock.create({ data: { tokenName: "T", tokenSymbol: "T", unlockAt: new Date(), sourceUrl: "https://t.example", percentOfSupply: 150 } }),
    ).rejects.toThrow();
  });

  it("publishes only verified airdrops and lists them publicly", async () => {
    await signIn();
    const refused = await saveAirdrop(null, initial, form({ projectName: "Alpha", officialUrl: "https://alpha.example/airdrop", status: "PUBLISHED" }));
    expect(refused.ok).toBe(false);
    expect(refused.fieldErrors?.verified).toBeTruthy();

    const badLink = await saveAirdrop(null, initial, form({ projectName: "Alpha", officialUrl: "javascript:alert(1)", status: "DRAFT" }));
    expect(badLink.fieldErrors?.officialUrl).toBeTruthy();

    let createdId = "";
    try {
      await saveAirdrop(null, initial, form({ projectName: "Alpha", tokenSymbol: "alp", officialUrl: "https://alpha.example/airdrop", startsAt: "2026-01-01", endsAt: "2099-01-01", status: "DRAFT" }));
    } catch (error) {
      expect(error).toBeInstanceOf(RedirectSignal);
      createdId = (error as RedirectSignal).url.split("/").pop()!.split("?")[0]!;
    }
    const draft = await prisma.airdrop.findUniqueOrThrow({ where: { id: createdId } });
    expect(draft).toMatchObject({ tokenSymbol: "ALP", status: "DRAFT", verifiedAt: null });
    expect((await getAirdrops()).items).toHaveLength(0);

    // Publishing an unverified airdrop from the list sends the admin to verify it first.
    await expect(setAirdropStatus(createdId, "PUBLISHED")).rejects.toBeInstanceOf(RedirectSignal);

    const saved = await saveAirdrop(createdId, initial, form({ projectName: "Alpha", officialUrl: "https://alpha.example/airdrop", startsAt: "2026-01-01", endsAt: "2099-01-01", verified: "on", status: "PUBLISHED" }));
    expect(saved.ok).toBe(true);
    const { items, feed } = await getAirdrops();
    expect(feed).toBe("needs-key");
    expect(items).toHaveLength(1);
    expect(items[0]).toMatchObject({ source: "curated", projectName: "Alpha", status: "ONGOING", url: "https://alpha.example/airdrop" });
  });

  it("stores unlocks in UTC and values them at the live price", async () => {
    await signIn();
    const bad = await saveTokenUnlock(null, initial, form({ tokenName: "Arbitrum", tokenSymbol: "ARB", unlockAt: "soon", percentOfSupply: "150", sourceUrl: "https://docs.example/vesting", unlockType: "CLIFF", status: "DRAFT" }));
    expect(Object.keys(bad.fieldErrors ?? {})).toEqual(expect.arrayContaining(["unlockAt", "percentOfSupply"]));

    await expect(
      saveTokenUnlock(null, initial, form({ tokenName: "Arbitrum", tokenSymbol: "arb", cmcSlug: "Arbitrum", unlockAt: "2099-03-16T13:00", amount: "92,650,000", percentOfSupply: "2.1", sourceUrl: "https://docs.example/vesting", unlockType: "CLIFF", verified: "on", status: "PUBLISHED" })),
    ).rejects.toBeInstanceOf(RedirectSignal);

    const row = await prisma.tokenUnlock.findFirstOrThrow();
    expect(row.unlockAt.toISOString()).toBe("2099-03-16T13:00:00.000Z");
    expect(row.tokenSymbol).toBe("ARB");
    expect(row.cmcSlug).toBe("arbitrum");
    expect(Number(row.amount)).toBe(92_650_000);

    const [unlock] = await getTokenUnlocks([asset({ slug: "arbitrum", price: 0.5 })]);
    expect(unlock).toMatchObject({ symbol: "ARB", amount: 92_650_000, percentOfSupply: 2.1, valueUsd: 46_325_000 });
  });
});
