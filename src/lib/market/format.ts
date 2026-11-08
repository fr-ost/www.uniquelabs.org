/** Number formatting for market data. Client- and server-safe. */

const MINUS = "−";

const usd0 = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
const usd2 = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 2, maximumFractionDigits: 2 });
const usd4 = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 4, maximumFractionDigits: 4 });
const integer = new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 });

export function formatPrice(value: number | null | undefined): string {
  if (value === null || value === undefined || !Number.isFinite(value)) return "—";
  const abs = Math.abs(value);
  if (abs >= 10_000) return usd0.format(value);
  if (abs >= 1) return usd2.format(value);
  if (abs >= 0.01) return usd4.format(value);
  if (abs === 0) return "$0.00";
  // Tiny prices: keep four significant digits (e.g. $0.00001234).
  const digits = Math.min(12, Math.max(4, -Math.floor(Math.log10(abs)) + 3));
  return `${value < 0 ? MINUS : ""}$${abs.toFixed(digits).replace(/0+$/, "")}`;
}

const UNITS: Array<[number, string]> = [
  [1e12, "T"],
  [1e9, "B"],
  [1e6, "M"],
  [1e3, "K"],
];

function trimmed(value: number, digits: number): string {
  const fixed = value.toFixed(digits);
  return fixed.includes(".") ? fixed.replace(/0+$/, "").replace(/\.$/, "") : fixed;
}

/**
 * Compact notation (1.53T, 116.7M, 20.11K). Hand-rolled on purpose: Intl's
 * compact output differs between ICU builds (Node vs browsers), which breaks
 * hydration of server-rendered figures.
 */
export function compactAbs(abs: number): string {
  for (let i = 0; i < UNITS.length; i++) {
    const [size, suffix] = UNITS[i]!;
    if (abs >= size) {
      const scaled = abs / size;
      const digits = scaled >= 100 ? 1 : 2;
      // 999.996K would round to "1000K": promote to the next unit instead.
      if (Number(scaled.toFixed(digits)) >= 1000 && i > 0) {
        const [bigger, biggerSuffix] = UNITS[i - 1]!;
        return `${trimmed(abs / bigger, 2)}${biggerSuffix}`;
      }
      return `${trimmed(scaled, digits)}${suffix}`;
    }
  }
  return trimmed(abs, abs >= 100 ? 0 : 2);
}

export function formatUsdCompact(value: number | null | undefined): string {
  if (value === null || value === undefined || !Number.isFinite(value)) return "—";
  return `${value < 0 ? MINUS : ""}$${compactAbs(Math.abs(value))}`;
}

export function formatCompact(value: number | null | undefined): string {
  if (value === null || value === undefined || !Number.isFinite(value)) return "—";
  return `${value < 0 ? MINUS : ""}${compactAbs(Math.abs(value))}`;
}

export function formatInteger(value: number | null | undefined): string {
  if (value === null || value === undefined || !Number.isFinite(value)) return "—";
  return integer.format(value);
}

export function formatPercent(value: number | null | undefined, { signed = true, digits = 2 } = {}): string {
  if (value === null || value === undefined || !Number.isFinite(value)) return "—";
  const fixed = Math.abs(value).toFixed(digits);
  if (!signed) return `${fixed}%`;
  if (Number(fixed) === 0) return `${fixed}%`;
  return `${value > 0 ? "+" : MINUS}${fixed}%`;
}

export type Trend = "up" | "down" | "flat";

export function trendOf(value: number | null | undefined): Trend {
  if (value === null || value === undefined || !Number.isFinite(value) || Math.abs(value) < 0.005) return "flat";
  return value > 0 ? "up" : "down";
}

export function formatRelativeTime(iso: string | null | undefined, now = Date.now()): string {
  if (!iso) return "—";
  const t = Date.parse(iso);
  if (Number.isNaN(t)) return "—";
  const seconds = Math.round((now - t) / 1000);
  if (seconds < 10) return "just now";
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.round(seconds / 60);
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 48) return `${hours} h ago`;
  return `${Math.round(hours / 24)} days ago`;
}

/** "in 3d 4h" / "2h 10m ago" style countdowns for events. */
export function formatCountdown(iso: string, now = Date.now()): string {
  const t = Date.parse(iso);
  if (Number.isNaN(t)) return "—";
  const diff = t - now;
  const abs = Math.abs(diff);
  const days = Math.floor(abs / 86_400_000);
  const hours = Math.floor((abs % 86_400_000) / 3_600_000);
  const minutes = Math.floor((abs % 3_600_000) / 60_000);
  const span = days > 0 ? `${days}d ${hours}h` : hours > 0 ? `${hours}h ${minutes}m` : `${Math.max(1, minutes)}m`;
  return diff >= 0 ? `in ${span}` : `${span} ago`;
}

export function formatEventDate(iso: string | null | undefined): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" }).format(d);
}

export function formatEventDateTime(iso: string | null | undefined): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return `${new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit", hour12: false, timeZone: "UTC" }).format(d)} UTC`;
}

/** Wall-clock time for server renders (kept out of component bodies). */
export function renderTimestamp(): number {
  return Date.now();
}
