import { defineConfig, devices } from "@playwright/test";

/**
 * End-to-end tests. By default they run against http://localhost:3000 and
 * start `npm run dev` if nothing is listening. Point E2E_BASE_URL at another
 * environment (e.g. a production build started with `npm start`) to test it.
 * The global setup creates a dedicated e2e admin account in the database the
 * server uses (DATABASE_URL) — use a development or CI database, never production.
 */
const baseURL = process.env.E2E_BASE_URL ?? "http://localhost:3000";

/**
 * Market data comes from an offline CoinMarketCap mock serving recorded
 * responses (tests/fixtures/cmc), so the suite is deterministic and needs no
 * network or API key. Only applies when Playwright starts the dev server.
 */
const CMC_MOCK_URL = "http://127.0.0.1:4010";

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
    : [
        {
          command: "node tests/support/cmc-mock-server.mjs tests/fixtures/cmc 4010",
          url: `${CMC_MOCK_URL}/v1/global-metrics/quotes/latest`,
          reuseExistingServer: true,
          timeout: 20_000,
        },
        {
          command: "npm run dev",
          url: baseURL,
          reuseExistingServer: true,
          timeout: 180_000,
          env: { CMC_API_BASE_URL: CMC_MOCK_URL },
        },
      ],
  projects: [
    { name: "desktop", use: { ...devices["Desktop Chrome"] } },
    { name: "mobile", use: { ...devices["Pixel 7"] }, testMatch: /public\.spec\.ts/ },
  ],
});
