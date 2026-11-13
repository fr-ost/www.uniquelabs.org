"use client";

import { Suspense, type MouseEvent, type ReactNode } from "react";
import { useSearchParams } from "next/navigation";
import { cn, pluralize } from "@/lib/utils";

/**
 * The filterable product list.
 *
 * The page itself is pre-built (static) with every product in it; filtering
 * happens here in the browser, so choosing a filter is instant and opening the
 * page never waits on a server. The chosen filters live in the address
 * (`/products?status=BETA`), so a filtered view can still be shared.
 */

export interface DirectoryItem {
  slug: string;
  category: string | null;
  platforms: string[];
  stage: string;
  /** The rendered product card (a list item). */
  node: ReactNode;
}

export interface FilterOption {
  value: string;
  label: string;
}

type Filters = { category?: string; platform?: string; status?: string };
type FilterKey = keyof Filters;

function hrefFor(filters: Filters, key: FilterKey, value: string | undefined) {
  const params = new URLSearchParams();
  for (const [k, v] of Object.entries({ ...filters, [key]: value })) {
    if (v) params.set(k, v);
  }
  const query = params.toString();
  return query ? `/products?${query}` : "/products";
}

function FilterChip({ href, active, children }: { href: string; active: boolean; children: ReactNode }) {
  const onClick = (event: MouseEvent<HTMLAnchorElement>) => {
    // Let the browser handle new-tab clicks; otherwise just update the address.
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) return;
    event.preventDefault();
    window.history.pushState(null, "", href);
  };
  return (
    <a
      href={href}
      onClick={onClick}
      aria-current={active ? "true" : undefined}
      className={cn(
        "inline-flex h-9 items-center rounded-full border px-4 text-sm transition-colors duration-200",
        active ? "border-ink-50 bg-ink-50 text-ink-950" : "border-white/10 text-ink-300 hover:border-white/25 hover:text-ink-50",
      )}
    >
      {children}
    </a>
  );
}

interface DirectoryProps {
  items: DirectoryItem[];
  categories: FilterOption[];
  platforms: FilterOption[];
  stages: FilterOption[];
  /** Shown when the filters match nothing. */
  empty: ReactNode;
}

function DirectoryView({ items, categories, platforms, stages, empty, filters }: DirectoryProps & { filters: Filters }) {
  const groups: Array<{ key: FilterKey; label: string; name: string; options: FilterOption[] }> = [
    { key: "category", label: "Category", name: "Filter by category", options: categories },
    { key: "platform", label: "Platform", name: "Filter by platform", options: platforms },
    { key: "status", label: "Status", name: "Filter by status", options: stages },
  ];
  const visible = items.filter(
    (item) =>
      (!filters.category || item.category === filters.category) &&
      (!filters.platform || item.platforms.includes(filters.platform)) &&
      (!filters.status || item.stage === filters.status),
  );
  const filtered = Boolean(filters.category || filters.platform || filters.status);

  return (
    <>
      <div className="flex flex-col gap-6 border-b border-white/[0.07] pb-8 lg:flex-row lg:items-end lg:justify-between">
        <div className="space-y-4">
          {groups.map((group) =>
            group.options.length > 1 ? (
              <div key={group.key} className="flex flex-wrap items-center gap-2" role="group" aria-label={group.name}>
                <span className="text-eyebrow mr-2 w-20 text-ink-500">{group.label}</span>
                <FilterChip href={hrefFor(filters, group.key, undefined)} active={!filters[group.key]}>
                  All
                </FilterChip>
                {group.options.map((option) => (
                  <FilterChip key={option.value} href={hrefFor(filters, group.key, option.value)} active={filters[group.key] === option.value}>
                    {option.label}
                  </FilterChip>
                ))}
              </div>
            ) : null,
          )}
        </div>
        <p className="text-eyebrow shrink-0 text-ink-400" aria-live="polite">
          {pluralize(visible.length, "product")}
          {filtered ? " · filtered" : ""}
        </p>
      </div>

      {visible.length === 0 ? (
        empty
      ) : (
        <ul className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-5 lg:grid-cols-3">{visible.map((item) => item.node)}</ul>
      )}
    </>
  );
}

function FilteredDirectory(props: DirectoryProps) {
  const params = useSearchParams();
  // Unknown values are ignored rather than shown as an empty result.
  const pick = (key: FilterKey, options: FilterOption[]) => {
    const value = params.get(key);
    return value && options.some((option) => option.value === value) ? value : undefined;
  };
  const filters: Filters = {
    category: pick("category", props.categories),
    platform: pick("platform", props.platforms),
    status: pick("status", props.stages),
  };
  return <DirectoryView {...props} filters={filters} />;
}

export function ProductDirectory(props: DirectoryProps) {
  // The pre-built page shows every product; filters from the address apply once the page is live.
  return (
    <Suspense fallback={<DirectoryView {...props} filters={{}} />}>
      <FilteredDirectory {...props} />
    </Suspense>
  );
}
