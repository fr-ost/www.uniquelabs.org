import { expect, test } from "@playwright/test";

/**
 * Runs against market data from the offline CMC mock (see playwright.config.ts)
 * or, when reusing a running dev server, whatever data that server has.
 */
test.describe("market intelligence", () => {
  test("shows live market data with working search", async ({ page }) => {
    await page.goto("/intelligence");
    await expect(page.locator("h1")).toContainText("Crypto markets");
    await expect(page.getByText(/Live market data|Delayed data/)).toBeVisible();
    await expect(page.getByRole("heading", { name: "The market at a glance" })).toBeVisible();
    await expect(page.getByText("Fear & Greed").first()).toBeVisible();

    const table = page.getByRole("table", { name: /Cryptocurrency prices/ });
    await expect(table.getByRole("link", { name: "Bitcoin BTC", exact: true })).toBeVisible();
    await page.getByRole("searchbox", { name: "Search assets" }).fill("doge");
    await expect(table.getByRole("link", { name: "Dogecoin DOGE", exact: true })).toBeVisible();
    await expect(table.getByRole("link", { name: "Bitcoin BTC", exact: true })).toHaveCount(0);

    await expect(page.getByText(/not financial advice/i).first()).toBeVisible();
    await expect(page.getByRole("link", { name: "CoinMarketCap" }).first()).toHaveAttribute("href", /coinmarketcap\.com/);
  });

  test("opens a coin page and 404s unknown coins", async ({ page }) => {
    await page.goto("/intelligence");
    await page.getByRole("table", { name: /Cryptocurrency prices/ }).getByRole("link", { name: "Ethereum ETH", exact: true }).click();
    await expect(page).toHaveURL(/\/intelligence\/ethereum$/);
    await expect(page.locator("h1")).toHaveText("Ethereum");
    await expect(page.getByText("Market cap").first()).toBeVisible();

    const missing = await page.goto("/intelligence/definitely-not-a-coin");
    expect(missing?.status()).toBe(404);
  });

  test("snapshot API and logo proxy are safe", async ({ request }) => {
    const snapshot = await request.get("/api/market/snapshot");
    expect(snapshot.ok()).toBe(true);
    const body = await snapshot.json();
    expect(Array.isArray(body.assets)).toBe(true);
    expect(JSON.stringify(body)).not.toMatch(/X-CMC_PRO_API_KEY|api_key/i);

    expect((await request.get("/api/market/logo/..%2F..%2Fetc%2Fpasswd")).status()).toBe(404);
    expect((await request.get("/api/market/logo/abc")).status()).toBe(404);
    const logo = await request.get("/api/market/logo/1");
    expect(logo.status()).toBe(200);
    expect(logo.headers()["content-type"]).toBe("image/png");
  });

  test("is in the main navigation", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("navigation", { name: "Primary" }).getByRole("link", { name: "Intelligence" }).click();
    await expect(page).toHaveURL(/\/intelligence$/);
  });
});
