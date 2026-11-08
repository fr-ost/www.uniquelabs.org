import { expect, test } from "@playwright/test";

test("visitors can send a message through the contact form", async ({ page }) => {
  await page.goto("/contact");
  await page.getByLabel("Name").fill("E2E Visitor");
  await page.getByLabel("Email").fill("visitor@example.com");
  await page.getByLabel("Inquiry type").selectOption("PARTNERSHIP");
  await page.getByLabel("Subject").fill("Partnership idea");
  await page.getByLabel("Message").fill("Hello — this message was sent by the automated end-to-end test suite.");
  // The form rejects submissions faster than a human could type.
  await page.waitForTimeout(3500);
  await page.getByRole("button", { name: "Send message" }).click();
  await expect(page.getByRole("status")).toContainText(/message received/i);
});

test("the contact form validates input on the server", async ({ page }) => {
  await page.goto("/contact");
  await page.getByLabel("Name").fill("E2E Visitor");
  await page.getByLabel("Email").fill("not-an-email");
  await page.getByLabel("Subject").fill("Hi");
  await page.getByLabel("Message").fill("Too short");
  await page.waitForTimeout(3500);
  await page.getByRole("button", { name: "Send message" }).click();
  await expect(page.getByText("Please enter a valid email address.")).toBeVisible();
  await expect(page.getByLabel("Name")).toHaveValue("E2E Visitor");
});
