import { defineConfig, devices } from "@playwright/test";

/**
 * End-to-end tests. By default they run against http://localhost:3000 and
 * start `npm run dev` if nothing is listening. Point E2E_BASE_URL at another
 * environment (e.g. a production build started with `npm start`) to test it.
 * The global setup creates a dedicated e2e admin account in the database the
 * server uses (DATABASE_URL) — use a development or CI database, never production.
 */
const baseURL = process.env.E2E_BASE_URL ?? "http://localhost:3000";

export default defineConfig({
  testDir: "tests/e2e",
  fullyParallel: false,
  workers: 1,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? "github" : "list",
  timeout: 60_000,
  globalSetup: "./tests/e2e/global-setup.ts",
  use: {
    baseURL,
    trace: "off",
    screenshot: "only-on-failure",
  },
  webServer: process.env.E2E_BASE_URL
    ? undefined
    : {
        command: "npm run dev",
        url: baseURL,
        reuseExistingServer: true,
        timeout: 180_000,
      },
  projects: [
    { name: "desktop", use: { ...devices["Desktop Chrome"] } },
    { name: "mobile", use: { ...devices["Pixel 7"] }, testMatch: /public\.spec\.ts/ },
  ],
});
