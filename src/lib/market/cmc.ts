import "server-only";
import { BackoffHint } from "@/lib/market/cache";
import { isObj } from "@/lib/market/normalize";
import type { MarketMode } from "@/lib/market/types";

/**
 * Minimal CoinMarketCap client. Runs on the server only: the API key never
 * reaches a browser, and visitors' browsers never contact CoinMarketCap.
 *
 * Without CMC_API_KEY the keyless public API is used (same JSON, shared
 * IP-based rate limits). With a key, requests go to the Pro API.
 * Docs: https://coinmarketcap.com/api/documentation/pro-api-reference
 */

const PRO_BASE = "https://pro-api.coinmarketcap.com";
const KEYLESS_BASE = "https://pro-api.coinmarketcap.com/public-api";

export class CmcError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly code: string | null,
  ) {
    super(message);
    this.name = "CmcError";
  }
}

/** The endpoint isn't available for this key/plan (or needs a key at all). */
export class CmcPlanError extends CmcError {
  constructor(message: string, status: number, code: string | null) {
    super(message, status, code);
    this.name = "CmcPlanError";
  }
}

function apiKey(): string | null {
  const key = process.env.CMC_API_KEY?.trim();
  return key ? key : null;
}

export function cmcMode(): MarketMode {
  return apiKey() ? "keyed" : "keyless";
}

function baseUrl(): string {
  const override = process.env.CMC_API_BASE_URL?.trim();
  if (override) return override.replace(/\/+$/, "");
  return apiKey() ? PRO_BASE : KEYLESS_BASE;
}

function envelopeStatus(body: unknown): { code: string | null; message: string | null } {
  if (!isObj(body) || !isObj(body.status)) return { code: null, message: null };
  const raw = body.status.error_code;
  const code = raw === undefined || raw === null ? null : String(raw);
  const message = typeof body.status.error_message === "string" && body.status.error_message ? body.status.error_message : null;
  return { code, message };
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export interface CmcRequestOptions {
  /** Fail fast (as a plan error) when no API key is configured. */
  requireKey?: boolean;
  timeoutMs?: number;
}

export async function cmcGet(
  path: string,
  params: Record<string, string | number | undefined> = {},
  options: CmcRequestOptions = {},
): Promise<unknown> {
  const key = apiKey();
  if (options.requireKey && !key) {
    throw new CmcPlanError("A CoinMarketCap API key is required for this data.", 401, null);
  }
  const url = new URL(`${baseUrl()}${path}`);
  for (const [name, value] of Object.entries(params)) {
    if (value !== undefined) url.searchParams.set(name, String(value));
  }
  const headers: Record<string, string> = { Accept: "application/json" };
  if (key) headers["X-CMC_PRO_API_KEY"] = key;

  for (let attempt = 0; ; attempt++) {
    let response: Response;
    try {
      response = await fetch(url, {
        headers,
        cache: "no-store",
        redirect: "error",
        signal: AbortSignal.timeout(options.timeoutMs ?? 10_000),
      });
    } catch (error) {
      const reason = error instanceof Error && error.name === "TimeoutError" ? "timed out" : "could not be reached";
      throw new CmcError(`CoinMarketCap ${reason}.`, 0, null);
    }

    let body: unknown = null;
    try {
      body = await response.json();
    } catch {
      body = null;
    }
    const status = envelopeStatus(body);
    const failed = !response.ok || (status.code !== null && status.code !== "0");
    if (!failed) {
      if (!isObj(body) || !("data" in body)) throw new CmcError("CoinMarketCap sent an unexpected response.", response.status, null);
      return body.data;
    }

    const message = status.message ?? `CoinMarketCap request failed (HTTP ${response.status}).`;
    if (response.status === 429) {
      if (attempt < 1) {
        await sleep(800 + Math.floor(Math.random() * 400));
        continue;
      }
      // Rate limited (keyless pool or plan minute limit): back off for a while.
      throw new BackoffHint(message, 2 * 60_000);
    }
    if (response.status === 401 || response.status === 402 || response.status === 403) {
      const error = new CmcPlanError(message, response.status, status.code);
      // A plan restriction won't fix itself; check again in an hour.
      throw Object.assign(new BackoffHint(error.message, 60 * 60_000), { cause: error, planRestricted: true });
    }
    throw new CmcError(message, response.status, status.code);
  }
}

export function isPlanRestricted(error: string | null | undefined): boolean {
  if (!error) return false;
  return /plan|subscription|api key|unauthori[sz]ed|permission/i.test(error);
}
