import { expect, test, type Page } from "@playwright/test";
import { E2E_ADMIN } from "./global-setup";

async function signIn(page: Page) {
  await page.goto("/admin/login");
  await page.getByLabel("Email").fill(E2E_ADMIN.email);
  await page.getByLabel("Password").fill(E2E_ADMIN.password);
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(page).toHaveURL(/\/admin$/);
}

test.describe("admin", () => {
  test("protects admin pages and APIs", async ({ page, request }) => {
    await page.goto("/admin/products");
    await expect(page).toHaveURL(/\/admin\/login$/);
    const api = await request.get("/api/admin/media");
    expect(api.status()).toBe(401);
    const forged = await request.put("/api/admin/media?name=x.png", {
      headers: { Origin: "https://evil.example", "X-Requested-With": "uniquelabs-admin" },
      data: "x",
    });
    expect(forged.status()).toBe(403);
    const headers = (await request.get("/admin/login")).headers();
    expect(headers["x-robots-tag"]).toContain("noindex");
  });

  test("rejects a wrong password and keeps the email", async ({ page }) => {
    await page.goto("/admin/login");
    await page.getByLabel("Email").fill(E2E_ADMIN.email);
    await page.getByLabel("Password").fill("definitely-not-the-password");
    await page.getByRole("button", { name: "Sign in" }).click();
    // (Next.js also renders an empty route announcer with role="alert".)
    await expect(page.getByRole("alert").filter({ hasText: /Incorrect email or password/ })).toBeVisible();
    await expect(page.getByLabel("Email")).toHaveValue(E2E_ADMIN.email);
  });

  test("signs in, manages a draft product and signs out", async ({ page }) => {
    await signIn(page);
    await expect(page.getByRole("heading", { level: 1 })).toContainText(/Welcome/);

    const name = `E2E Product ${Date.now()}`;
    await page.goto("/admin/products/new");
    await page.getByLabel("Product name").fill(name);
    await page.getByLabel("Short description").fill("Created by the end-to-end test suite.");
    await page.getByRole("button", { name: "Create product" }).click();
    await expect(page).toHaveURL(/\/admin\/products\/c[a-z0-9]+\?created=1/);
    await expect(page.getByText("Product created as a draft.")).toBeVisible();

    // Publishing without owner verification is refused.
    await page.getByLabel("Publication status").selectOption("PUBLISHED");
    await page.getByRole("button", { name: "Save product" }).click();
    await expect(page.getByText("Only verified products can be published.")).toBeVisible();

    // The draft is not public.
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    expect((await page.request.get(`/products/${slug}`)).status()).toBe(404);

    // Clean up through the confirmation dialog.
    await page.getByRole("button", { name: "Delete" }).first().click();
    await page.getByRole("dialog").getByRole("button", { name: "Delete product" }).click();
    await expect(page).toHaveURL(/\/admin\/products\?deleted=1/);

    await page.getByRole("button", { name: "Sign out" }).first().click();
    await expect(page).toHaveURL(/\/admin\/login$/);
  });

  test("shows every admin module", async ({ page }) => {
    await signIn(page);
    for (const path of ["/admin/company", "/admin/collaborations", "/admin/team", "/admin/timeline", "/admin/capabilities", "/admin/imports/claude", "/admin/imports/x", "/admin/candidates/products", "/admin/candidates/collaborations", "/admin/imports", "/admin/contact", "/admin/messages", "/admin/media", "/admin/seo", "/admin/audit", "/admin/account"]) {
      const response = await page.goto(path);
      expect(response?.status(), path).toBe(200);
      await expect(page.locator("h1").first()).toBeVisible();
    }
  });
});
