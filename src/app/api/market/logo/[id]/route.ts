export const dynamic = "force-dynamic";

/**
 * Same-origin proxy for CoinMarketCap coin logos, so visitors' browsers never
 * contact a third party (privacy) and our CSP can stay `img-src 'self'`.
 * Fixed upstream host, numeric ids only, PNG-signature check, size cap,
 * in-memory cache with negative caching and an upstream request budget.
 */

const UPSTREAM = "https://s2.coinmarketcap.com/static/img/coins/64x64";
const MAX_BYTES = 100 * 1024;
const MAX_ENTRIES = 600;
const PNG_SIGNATURE = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];

interface CachedLogo {
  body: Uint8Array | null;
  expires: number;
}

const store = globalThis as unknown as { __ulLogoCache?: Map<number, CachedLogo>; __ulLogoBudget?: number[] };
const cache = (store.__ulLogoCache ??= new Map());
const recentFetches = (store.__ulLogoBudget ??= []);

function withinBudget(now: number): boolean {
  // At most 150 upstream fetches per 10 seconds per process (a full page of
  // logos on a cold cache), then cached for a week.
  while (recentFetches.length && now - recentFetches[0]! > 10_000) recentFetches.shift();
  if (recentFetches.length >= 150) return false;
  recentFetches.push(now);
  return true;
}

function remember(id: number, entry: CachedLogo) {
  if (cache.size >= MAX_ENTRIES) {
    const oldest = cache.keys().next().value;
    if (oldest !== undefined) cache.delete(oldest);
  }
  cache.set(id, entry);
}

function isPng(bytes: Uint8Array): boolean {
  return PNG_SIGNATURE.every((b, i) => bytes[i] === b);
}

function png(body: Uint8Array): Response {
  return new Response(body as BodyInit, {
    headers: {
      "Content-Type": "image/png",
      "Cache-Control": "public, max-age=604800, stale-while-revalidate=2592000",
      "Content-Security-Policy": "default-src 'none'; sandbox",
      "X-Content-Type-Options": "nosniff",
    },
  });
}

function missing(status = 404, maxAge = 3600): Response {
  return new Response(null, { status, headers: { "Cache-Control": `public, max-age=${maxAge}` } });
}

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id: raw } = await params;
  const idText = raw.replace(/\.png$/, "");
  if (!/^\d{1,9}$/.test(idText)) return missing();
  const id = Number(idText);
  const now = Date.now();

  const hit = cache.get(id);
  if (hit && hit.expires > now) return hit.body ? png(hit.body) : missing();

  if (!withinBudget(now)) {
    return hit?.body ? png(hit.body) : missing(503, 30);
  }

  try {
    const response = await fetch(`${UPSTREAM}/${id}.png`, { redirect: "error", signal: AbortSignal.timeout(5000), cache: "no-store" });
    if (response.status === 404 || response.status === 403) {
      remember(id, { body: null, expires: now + 24 * 3600_000 });
      return missing();
    }
    const type = response.headers.get("content-type") ?? "";
    const length = Number(response.headers.get("content-length") ?? "0");
    if (!response.ok || !type.startsWith("image/png") || length > MAX_BYTES) return missing(502, 300);
    const body = new Uint8Array(await response.arrayBuffer());
    if (body.byteLength > MAX_BYTES || !isPng(body)) return missing(502, 300);
    remember(id, { body, expires: now + 7 * 24 * 3600_000 });
    return png(body);
  } catch {
    return hit?.body ? png(hit.body) : missing(502, 60);
  }
}
