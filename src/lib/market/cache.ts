/**
 * Tiny in-process cache for third-party market data.
 *
 * - fresh (age < ttl): served as-is
 * - stale (ttl ≤ age < maxStale): served immediately while one background
 *   refresh runs (stale-while-revalidate)
 * - missing or too old: the caller waits for a single shared request
 *   (concurrent callers never trigger duplicate upstream calls)
 * - on failure: the last good value keeps being served (flagged stale) and
 *   retries are spaced out by `backoffMs`, so an outage or a plan limit never
 *   turns into a request storm against the provider.
 */

export interface CacheOptions {
  ttlMs: number;
  maxStaleMs: number;
  backoffMs: number;
}

export interface CacheResult<T> {
  value: T | null;
  stale: boolean;
  fetchedAt: number | null;
  error: string | null;
}

export interface CacheEntryStatus {
  key: string;
  fetchedAt: number | null;
  error: string | null;
  errorAt: number | null;
}

interface Entry {
  value?: unknown;
  fetchedAt: number | null;
  error: string | null;
  errorAt: number | null;
  retryAt: number;
  inflight: Promise<void> | null;
}

export class BackoffHint extends Error {
  constructor(
    message: string,
    readonly backoffMs: number,
  ) {
    super(message);
  }
}

export function createMarketCache(now: () => number = () => Date.now()) {
  const store = new Map<string, Entry>();

  function entryFor(key: string): Entry {
    let entry = store.get(key);
    if (!entry) {
      entry = { fetchedAt: null, error: null, errorAt: null, retryAt: 0, inflight: null };
      store.set(key, entry);
    }
    return entry;
  }

  function refresh<T>(key: string, entry: Entry, options: CacheOptions, loader: () => Promise<T>): Promise<void> {
    if (entry.inflight) return entry.inflight;
    const run = (async () => {
      try {
        const value = await loader();
        entry.value = value;
        entry.fetchedAt = now();
        entry.error = null;
        entry.errorAt = null;
        entry.retryAt = 0;
      } catch (error) {
        entry.error = error instanceof Error ? error.message : String(error);
        entry.errorAt = now();
        const backoff = error instanceof BackoffHint ? error.backoffMs : options.backoffMs;
        entry.retryAt = now() + backoff;
      } finally {
        entry.inflight = null;
      }
    })();
    entry.inflight = run;
    return run;
  }

  function result<T>(entry: Entry, options: CacheOptions): CacheResult<T> {
    const has = entry.fetchedAt !== null;
    const age = has ? now() - entry.fetchedAt! : Infinity;
    if (!has || age >= options.maxStaleMs) {
      return { value: null, stale: false, fetchedAt: entry.fetchedAt, error: entry.error };
    }
    return {
      value: entry.value as T,
      stale: age >= options.ttlMs || entry.error !== null,
      fetchedAt: entry.fetchedAt,
      error: entry.error,
    };
  }

  async function get<T>(key: string, options: CacheOptions, loader: () => Promise<T>): Promise<CacheResult<T>> {
    const entry = entryFor(key);
    const t = now();
    const has = entry.fetchedAt !== null;
    const age = has ? t - entry.fetchedAt! : Infinity;
    const canRetry = t >= entry.retryAt;

    if (has && age < options.ttlMs) return result<T>(entry, options);

    if (has && age < options.maxStaleMs) {
      // Serve what we have; refresh in the background when allowed.
      if (canRetry) void refresh(key, entry, options, loader);
      return result<T>(entry, options);
    }

    if (canRetry || entry.inflight) {
      await refresh(key, entry, options, loader);
    }
    return result<T>(entry, options);
  }

  function status(): CacheEntryStatus[] {
    return [...store.entries()].map(([key, e]) => ({ key, fetchedAt: e.fetchedAt, error: e.error, errorAt: e.errorAt }));
  }

  function clear() {
    store.clear();
  }

  return { get, status, clear };
}

export type MarketCache = ReturnType<typeof createMarketCache>;
