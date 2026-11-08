"use client";

import Link from "next/link";
import { useDeferredValue, useMemo, useState, type ReactNode } from "react";
import { ArrowDown, ArrowUp, Search } from "lucide-react";
import { useLiveMarket } from "@/components/market/live-market";
import { AssetLogo, Change } from "@/components/market/primitives";
import { formatCompact, formatPrice, formatUsdCompact } from "@/lib/market/format";
import { MARKET_CATEGORIES } from "@/lib/market/normalize";
import type { MarketAsset } from "@/lib/market/types";
import { cn } from "@/lib/utils";

type SortKey = "rank" | "name" | "price" | "change1h" | "change24h" | "change7d" | "marketCap" | "volume24h";

const COLUMNS: Array<{ key: SortKey; label: string; className?: string }> = [
  { key: "price", label: "Price" },
  { key: "change1h", label: "1h" },
  { key: "change24h", label: "24h" },
  { key: "change7d", label: "7d" },
  { key: "marketCap", label: "Market cap" },
  { key: "volume24h", label: "Volume (24h)" },
];

const PAGE = 25;

function sortValue(asset: MarketAsset, key: SortKey): number | string | null {
  if (key === "name") return asset.name.toLowerCase();
  return asset[key];
}

export function MarketTable({ watchlist = [] }: { watchlist?: string[] }) {
  const { snapshot, flashes, revision } = useLiveMarket();
  const [query, setQuery] = useState("");
  const deferredQuery = useDeferredValue(query);
  const [filter, setFilter] = useState<string>("all");
  const [sort, setSort] = useState<{ key: SortKey; dir: "asc" | "desc" }>({ key: "rank", dir: "asc" });
  const [visible, setVisible] = useState(PAGE);

  const watch = useMemo(() => new Set(watchlist.map((s) => s.toUpperCase())), [watchlist]);
  const categories = useMemo(
    () => MARKET_CATEGORIES.filter((c) => snapshot.assets.filter((a) => a.categories.includes(c.key)).length >= 3),
    [snapshot.assets],
  );

  const rows = useMemo(() => {
    const q = deferredQuery.trim().toLowerCase();
    let list = snapshot.assets;
    if (filter === "watchlist") list = list.filter((a) => watch.has(a.symbol.toUpperCase()));
    else if (filter === "gainers") list = list.filter((a) => (a.change24h ?? 0) > 0);
    else if (filter === "losers") list = list.filter((a) => (a.change24h ?? 0) < 0);
    else if (filter !== "all") list = list.filter((a) => a.categories.includes(filter));
    if (q) list = list.filter((a) => a.name.toLowerCase().includes(q) || a.symbol.toLowerCase().includes(q));
    const effective =
      filter === "gainers" && sort.key === "rank" ? { key: "change24h" as const, dir: "desc" as const } : filter === "losers" && sort.key === "rank" ? { key: "change24h" as const, dir: "asc" as const } : sort;
    return [...list].sort((a, b) => {
      const av = sortValue(a, effective.key);
      const bv = sortValue(b, effective.key);
      if (av === null && bv === null) return 0;
      if (av === null) return 1;
      if (bv === null) return -1;
      const cmp = typeof av === "string" ? av.localeCompare(bv as string) : av - (bv as number);
      return effective.dir === "asc" ? cmp : -cmp;
    });
  }, [snapshot.assets, deferredQuery, filter, sort, watch]);

  if (snapshot.assets.length === 0) return null;

  const toggleSort = (key: SortKey) =>
    setSort((s) => (s.key === key ? { key, dir: s.dir === "asc" ? "desc" : "asc" } : { key, dir: key === "rank" || key === "name" ? "asc" : "desc" }));

  const chips = [
    { key: "all", label: "All" },
    ...(watch.size ? [{ key: "watchlist", label: "Watchlist" }] : []),
    { key: "gainers", label: "Gainers" },
    { key: "losers", label: "Losers" },
    ...categories,
  ];

  return (
    <div>
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="-mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0">
          <div role="group" aria-label="Filter assets" className="flex w-max gap-1.5">
            {chips.map((chip) => (
              <button
                key={chip.key}
                type="button"
                aria-pressed={filter === chip.key}
                onClick={() => {
                  setFilter(chip.key);
                  setVisible(PAGE);
                }}
                className={cn(
                  "h-9 whitespace-nowrap rounded-full border px-3.5 text-sm transition-colors",
                  filter === chip.key ? "border-transparent bg-ink-50 font-medium text-ink-950" : "border-white/10 bg-white/[0.03] text-ink-300 hover:border-white/25 hover:text-ink-50",
                )}
              >
                {chip.label}
              </button>
            ))}
          </div>
        </div>
        <label className="relative block w-full lg:w-72">
          <span className="sr-only">Search assets</span>
          <Search aria-hidden className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-ink-400" />
          <input
            type="search"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setVisible(PAGE);
            }}
            placeholder="Search name or symbol"
            maxLength={40}
            className="h-10 w-full rounded-full border border-white/10 bg-white/[0.04] pr-4 pl-10 text-sm text-ink-50 placeholder:text-ink-500 focus:border-signal-500/50 focus:ring-4 focus:ring-signal-500/10 focus:outline-none"
          />
        </label>
      </div>

      <div className="mt-5 overflow-hidden rounded-[var(--radius-panel)] border border-white/[0.08] bg-ink-900/60">
        <div className="overflow-x-auto overscroll-x-contain">
          <table className="w-full min-w-[860px] border-collapse text-sm">
            <caption className="sr-only">Cryptocurrency prices, sortable by column</caption>
            <thead>
              <tr className="border-b border-white/[0.08] text-left text-xs text-ink-400">
                <th scope="col" className="sticky left-0 z-10 w-12 bg-ink-900 py-3 pr-1 pl-4 font-medium" aria-sort={sort.key === "rank" ? (sort.dir === "asc" ? "ascending" : "descending") : "none"}>
                  <SortButton active={sort.key === "rank"} dir={sort.dir} onClick={() => toggleSort("rank")}>
                    #
                  </SortButton>
                </th>
                <th scope="col" className="sticky left-12 z-10 bg-ink-900 py-3 pr-4 font-medium" aria-sort={sort.key === "name" ? (sort.dir === "asc" ? "ascending" : "descending") : "none"}>
                  <SortButton active={sort.key === "name"} dir={sort.dir} onClick={() => toggleSort("name")}>
                    Name
                  </SortButton>
                </th>
                {COLUMNS.map((col) => (
                  <th key={col.key} scope="col" className="px-4 py-3 text-right font-medium" aria-sort={sort.key === col.key ? (sort.dir === "asc" ? "ascending" : "descending") : "none"}>
                    <SortButton active={sort.key === col.key} dir={sort.dir} onClick={() => toggleSort(col.key)} align="right">
                      {col.label}
                    </SortButton>
                  </th>
                ))}
                <th scope="col" className="px-4 py-3 pr-5 text-right font-medium">
                  Circulating supply
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.slice(0, visible).map((asset) => {
                const flash = flashes[asset.id];
                const supplyPct = asset.maxSupply && asset.circulatingSupply ? Math.min(100, (asset.circulatingSupply / asset.maxSupply) * 100) : null;
                return (
                  <tr key={asset.id} className="group border-b border-white/[0.05] transition-colors last:border-0 hover:bg-white/[0.025]">
                    <td className="tabular sticky left-0 z-[1] bg-ink-900 py-3.5 pr-1 pl-4 text-xs text-ink-400 group-hover:bg-ink-850">{asset.rank ?? "—"}</td>
                    <td className="sticky left-12 z-[1] bg-ink-900 py-3.5 pr-4 group-hover:bg-ink-850">
                      <Link href={`/intelligence/${asset.slug}`} className="flex min-w-[9.5rem] items-center gap-3">
                        <AssetLogo id={asset.id} symbol={asset.symbol} size={28} />
                        <span className="min-w-0">
                          <span className="block max-w-[11rem] truncate font-medium text-ink-50 group-hover:text-white">{asset.name}</span>
                          <span className="block text-xs text-ink-400">{asset.symbol}</span>
                        </span>
                      </Link>
                    </td>
                    <td
                      key={`p-${asset.id}-${flash ? revision : 0}`}
                      className={cn("tabular px-4 py-3.5 text-right font-medium text-ink-50", flash === "up" && "animate-flash-up", flash === "down" && "animate-flash-down")}
                    >
                      {formatPrice(asset.price)}
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <Change value={asset.change1h} />
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <Change value={asset.change24h} />
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <Change value={asset.change7d} />
                    </td>
                    <td className="tabular px-4 py-3.5 text-right text-ink-100">{formatUsdCompact(asset.marketCap)}</td>
                    <td className="tabular px-4 py-3.5 text-right text-ink-200">{formatUsdCompact(asset.volume24h)}</td>
                    <td className="px-4 py-3.5 pr-5 text-right">
                      <span className="tabular block text-ink-200">
                        {formatCompact(asset.circulatingSupply)} <span className="text-ink-500">{asset.symbol}</span>
                      </span>
                      {supplyPct !== null ? (
                        <span className="mt-1.5 ml-auto block h-1 w-24 overflow-hidden rounded-full bg-white/[0.07]" title={`${supplyPct.toFixed(1)}% of max supply`}>
                          <span className="block h-full rounded-full bg-ink-300" style={{ width: `${supplyPct}%` }} />
                        </span>
                      ) : null}
                    </td>
                  </tr>
                );
              })}
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-4 py-14 text-center text-ink-400">
                    No assets match “{deferredQuery}”.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </div>
      <div className="mt-5 flex flex-col items-center gap-2 text-center">
        <p className="text-xs text-ink-500">
          Showing {Math.min(visible, rows.length)} of {rows.length} assets · ranked by market capitalisation
        </p>
        {visible < rows.length ? (
          <button
            type="button"
            onClick={() => setVisible((v) => v + PAGE)}
            className="mt-1 inline-flex h-10 items-center rounded-full border border-white/12 bg-white/[0.04] px-5 text-sm font-medium text-ink-100 transition-colors hover:border-white/25 hover:bg-white/[0.08]"
          >
            Show more
          </button>
        ) : null}
      </div>
    </div>
  );
}

function SortButton({ active, dir, onClick, children, align = "left" }: { active: boolean; dir: "asc" | "desc"; onClick: () => void; children: ReactNode; align?: "left" | "right" }) {
  return (
    <button type="button" onClick={onClick} className={cn("inline-flex items-center gap-1 transition-colors hover:text-ink-100", active && "text-ink-100", align === "right" && "flex-row-reverse")}>
      {children}
      {active ? dir === "asc" ? <ArrowUp aria-hidden className="h-3 w-3" /> : <ArrowDown aria-hidden className="h-3 w-3" /> : <span aria-hidden className="h-3 w-3" />}
    </button>
  );
}
