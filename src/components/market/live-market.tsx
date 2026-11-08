"use client";

import { createContext, use, useEffect, useRef, useState, useSyncExternalStore, type ReactNode } from "react";
import type { MarketSnapshot } from "@/lib/market/types";

interface LiveMarketValue {
  snapshot: MarketSnapshot;
  /** Price direction of assets whose price changed in the last refresh. */
  flashes: Record<number, "up" | "down">;
  /** Bumps on every successful refresh so flash animations can restart. */
  revision: number;
}

const LiveMarketContext = createContext<LiveMarketValue | null>(null);

/**
 * Holds the market snapshot for a page and keeps it fresh by polling our own
 * cached endpoint (never CoinMarketCap directly). Pauses while the tab is
 * hidden and refreshes as soon as it becomes visible again.
 */
export function LiveMarketProvider({
  initial,
  pollSeconds = 60,
  children,
}: {
  initial: MarketSnapshot;
  pollSeconds?: number;
  children: ReactNode;
}) {
  const [value, setValue] = useState<LiveMarketValue>({ snapshot: initial, flashes: {}, revision: 0 });
  const current = useRef(initial);

  useEffect(() => {
    let cancelled = false;
    let lastRun = Date.now();

    async function refresh() {
      if (document.visibilityState !== "visible") return;
      lastRun = Date.now();
      try {
        const response = await fetch("/api/market/snapshot", { cache: "no-store", headers: { Accept: "application/json" } });
        if (!response.ok) return;
        const next = (await response.json()) as MarketSnapshot;
        if (cancelled || !next || !Array.isArray(next.assets)) return;
        const previous = new Map(current.current.assets.map((a) => [a.id, a.price]));
        const flashes: Record<number, "up" | "down"> = {};
        for (const asset of next.assets) {
          const before = previous.get(asset.id);
          if (before != null && asset.price != null && asset.price !== before) {
            flashes[asset.id] = asset.price > before ? "up" : "down";
          }
        }
        current.current = next;
        setValue((v) => ({ snapshot: next, flashes, revision: v.revision + 1 }));
      } catch {
        // Network hiccup: keep showing the data we have.
      }
    }

    const timer = window.setInterval(refresh, Math.max(20, pollSeconds) * 1000);
    // Rendered without data (cold cache or provider hiccup): try again soon.
    const firstTry = current.current.available ? undefined : window.setTimeout(refresh, 4000);
    const onVisible = () => {
      if (document.visibilityState === "visible" && Date.now() - lastRun > 15_000) void refresh();
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      cancelled = true;
      window.clearInterval(timer);
      if (firstTry !== undefined) window.clearTimeout(firstTry);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [pollSeconds]);

  return <LiveMarketContext value={value}>{children}</LiveMarketContext>;
}

export function useLiveMarket(): LiveMarketValue {
  const value = use(LiveMarketContext);
  if (!value) throw new Error("useLiveMarket must be used inside <LiveMarketProvider>");
  return value;
}

// A shared 15-second clock. The server snapshot is `0`, so time-relative text
// renders a neutral placeholder during hydration instead of mismatching.
let clockNow = 0;
let clockTimer: number | undefined;
const clockListeners = new Set<() => void>();

function subscribeClock(listener: () => void) {
  clockListeners.add(listener);
  if (clockTimer === undefined) {
    clockTimer = window.setInterval(() => {
      clockNow = Date.now();
      clockListeners.forEach((l) => l());
    }, 15_000);
  }
  return () => {
    clockListeners.delete(listener);
    if (clockListeners.size === 0 && clockTimer !== undefined) {
      window.clearInterval(clockTimer);
      clockTimer = undefined;
    }
  };
}

function clockSnapshot() {
  if (clockNow === 0) clockNow = Date.now();
  return clockNow;
}

/** Current time, refreshed every 15 s; `null` while hydrating. */
export function useNow(): number | null {
  const now = useSyncExternalStore(subscribeClock, clockSnapshot, () => 0);
  return now === 0 ? null : now;
}
