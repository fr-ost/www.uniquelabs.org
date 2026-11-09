import { expect, test } from "@playwright/test";

const ROUTES = [
  "/",
  "/about",
  "/products",
  "/projects",
  "/partnerships",
  "/team",
  "/journey",
  "/services",
  "/contact",
  "/privacy",
  "/terms",
];

test.describe("public website", () => {
  for (const route of ROUTES) {
    test(`renders ${route} without errors or horizontal overflow`, async ({ page }) => {
      const errors: string[] = [];
      page.on("pageerror", (error) => errors.push(error.message));
      page.on("console", (message) => {
        if (message.type() === "error" && !/Download the React DevTools/.test(message.text())) errors.push(message.text());
      });
      const response = await page.goto(route, { waitUntil: "networkidle" });
      expect(response?.status()).toBe(200);
      await expect(page.locator("h1").first()).toBeVisible();
      await expect(page.locator("header")).toBeVisible();
      await expect(page.locator("footer")).toBeVisible();
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
      expect(overflow).toBeLessThanOrEqual(0);
      expect(errors).toEqual([]);
    });
  }

  test("sends security headers", async ({ request }) => {
    const response = await request.get("/");
    const headers = response.headers();
    expect(headers["content-security-policy"]).toContain("default-src 'self'");
    expect(headers["content-security-policy"]).toContain("frame-ancestors 'none'");
    expect(headers["content-security-policy"]).toContain("object-src 'none'");
    expect(headers["x-content-type-options"]).toBe("nosniff");
    expect(headers["x-frame-options"]).toBe("DENY");
    expect(headers["referrer-policy"]).toBe("strict-origin-when-cross-origin");
  });

  test("returns a real 404 for unknown pages and items", async ({ page }) => {
    expect((await page.goto("/this-page-does-not-exist"))?.status()).toBe(404);
    await expect(page.getByRole("heading", { name: /doesn.t exist/i })).toBeVisible();
    expect((await page.goto("/products/not-a-real-product"))?.status()).toBe(404);
    expect((await page.goto("/projects/not-a-real-project"))?.status()).toBe(404);
  });

  test("redirects retired URLs", async ({ request }) => {
    const old = await request.get("/collaborations", { maxRedirects: 0 });
    expect(old.status()).toBe(308);
    expect(old.headers()["location"]).toMatch(/\/partnerships$/);
    const wwd = await request.get("/what-we-do", { maxRedirects: 0 });
    expect(wwd.status()).toBe(308);
    expect(wwd.headers()["location"]).toMatch(/\/services$/);
    const admin = await request.get("/admin", { maxRedirects: 0 });
    expect([307, 308]).toContain(admin.status());
  });

  test("exposes SEO essentials", async ({ page, request }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/Unique Labs/);
    expect(await page.locator('meta[name="description"]').getAttribute("content")).toBeTruthy();
    const canonical = await page.locator('link[rel="canonical"]').getAttribute("href");
    expect(canonical).toMatch(/^https?:\/\/[^/]+\/?$/);
    expect(await page.locator('meta[property="og:image"]').first().getAttribute("content")).toContain("/og/");
    const jsonLd = await page.locator('script[type="application/ld+json"]').allTextContents();
    expect(jsonLd.some((text) => text.includes('"Organization"'))).toBe(true);
    const sitemap = await request.get("/sitemap.xml");
    expect(sitemap.status()).toBe(200);
    expect(await sitemap.text()).toContain("/projects</loc>");
    const robots = await request.get("/robots.txt");
    expect(await robots.text()).toMatch(/Sitemap: /);
    const og = await request.get("/og/projects");
    expect(og.headers()["content-type"]).toBe("image/png");
  });

  test("navigation works on every viewport", async ({ page, isMobile }) => {
    await page.goto("/");
    if (isMobile) {
      await page.getByRole("button", { name: "Open menu" }).click();
      const menu = page.getByRole("dialog", { name: "Site navigation" });
      await expect(menu).toBeVisible();
      await menu.getByRole("link", { name: /^Team/ }).click();
    } else {
      await page.getByRole("navigation", { name: "Primary" }).getByRole("link", { name: "Team" }).click();
    }
    await expect(page).toHaveURL(/\/team$/);
    await expect(page.locator("h1")).toContainText(/people behind/);
  });

  test("company menu reaches the About page", async ({ page, isMobile }) => {
    test.skip(isMobile, "The dropdown is a desktop control");
    await page.goto("/");
    await page.getByRole("navigation", { name: "Primary" }).getByRole("button", { name: /Company/ }).click();
    await page.getByRole("link", { name: /^About/ }).first().click();
    await expect(page).toHaveURL(/\/about$/);
  });

  test("keyboard users can skip to the content", async ({ page, isMobile }) => {
    test.skip(isMobile, "Keyboard navigation is a desktop concern");
    await page.goto("/about");
    await page.keyboard.press("Tab");
    const skip = page.getByRole("link", { name: "Skip to content" });
    await expect(skip).toBeFocused();
  });
});
