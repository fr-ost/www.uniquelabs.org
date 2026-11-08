#!/usr/bin/env node
/**
 * Offline stand-in for the CoinMarketCap API, serving recorded responses.
 *
 *   node tests/support/cmc-mock-server.mjs [fixturesDir] [port]
 *   CMC_API_BASE_URL=http://127.0.0.1:4010 npm run dev
 *
 * Used by the end-to-end tests (deterministic data, no network) and handy for
 * local work without an API key. Never point production at it.
 */
import { createServer } from "node:http";
import { existsSync, readFileSync } from "node:fs";
import { join, resolve } from "node:path";

const dir = resolve(process.argv[2] ?? "tests/fixtures/cmc");
const port = Number(process.argv[3] ?? process.env.CMC_MOCK_PORT ?? 4010);

const ROUTES = {
  "/v3/cryptocurrency/listings/latest": "listings.json",
  "/v1/global-metrics/quotes/latest": "global.json",
  "/v3/fear-and-greed/latest": "fng.json",
  "/v3/fear-and-greed/historical": "fnghist.json",
  "/v1/altcoin-season-index/latest": "altseason.json",
  "/v3/index/cmc100-latest": "cmc100.json",
  "/v2/cryptocurrency/info": "info.json",
  "/v1/cryptocurrency/airdrops": "airdrops.json",
  "/v1/key/info": "keyinfo.json",
};

function send(res, status, body) {
  res.writeHead(status, { "Content-Type": "application/json", "Cache-Control": "no-store" });
  res.end(JSON.stringify(body));
}

function error(code, message) {
  return { status: { timestamp: new Date().toISOString(), error_code: code, error_message: message, elapsed: 0, credit_count: 0 } };
}

const server = createServer((req, res) => {
  const url = new URL(req.url ?? "/", "http://localhost");
  // Accept both the keyed and the keyless ("/public-api") path layouts.
  const path = url.pathname.replace(/^\/public-api/, "");
  const file = ROUTES[path];
  if (!file) return send(res, 404, error(404, `No mock for ${path}`));
  const full = join(dir, file);
  if (!existsSync(full)) {
    // Mirrors CMC: endpoints outside the plan answer 403 with error 1006.
    return send(res, 403, error(1006, "Your API Key subscription plan doesn't support this endpoint."));
  }
  const body = JSON.parse(readFileSync(full, "utf8"));
  if (path.endsWith("/listings/latest") && Array.isArray(body.data)) {
    const limit = Number(url.searchParams.get("limit") ?? body.data.length);
    body.data = body.data.slice(0, Number.isFinite(limit) ? limit : body.data.length);
  }
  if (path === "/v2/cryptocurrency/info") {
    const id = url.searchParams.get("id");
    if (id && body.data && !(id in body.data)) body.data = {};
  }
  send(res, 200, body);
});

server.listen(port, "127.0.0.1", () => {
  console.log(`CMC mock serving ${dir} on http://127.0.0.1:${port}`);
});
