/** Join class names, skipping falsy values. */
export function cn(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(" ");
}

export function slugify(input: string, maxLength = 80): string {
  const slug = input
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, maxLength)
    .replace(/-+$/g, "");
  return slug || "item";
}

/** Finds a free slug by appending -2, -3, … */
export async function uniqueSlug(
  base: string,
  exists: (slug: string) => Promise<boolean>,
): Promise<string> {
  const root = slugify(base);
  let candidate = root;
  let counter = 2;
  while (await exists(candidate)) {
    candidate = `${root}-${counter}`;
    counter += 1;
    if (counter > 500) throw new Error("Could not allocate a unique slug");
  }
  return candidate;
}

export type Precision = "DAY" | "MONTH" | "YEAR";

/** Formats a date respecting how precisely it is known (dates are stored in UTC). */
export function formatDate(
  value: string | Date | null | undefined,
  precision: Precision = "DAY",
  style: "long" | "short" = "long",
): string {
  if (!value) return "";
  const date = typeof value === "string" ? new Date(value) : value;
  if (Number.isNaN(date.getTime())) return "";
  if (precision === "YEAR") {
    return new Intl.DateTimeFormat("en-US", { year: "numeric", timeZone: "UTC" }).format(date);
  }
  if (precision === "MONTH") {
    return new Intl.DateTimeFormat("en-US", {
      month: style === "long" ? "long" : "short",
      year: "numeric",
      timeZone: "UTC",
    }).format(date);
  }
  return new Intl.DateTimeFormat("en-US", {
    day: "numeric",
    month: style === "long" ? "long" : "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);
}

export function formatDateTime(value: string | Date | null | undefined): string {
  if (!value) return "";
  const date = typeof value === "string" ? new Date(value) : value;
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "UTC",
    timeZoneName: "short",
  }).format(date);
}

export function yearOf(value: string | Date): number {
  const date = typeof value === "string" ? new Date(value) : value;
  return date.getUTCFullYear();
}

/** ISO date (YYYY-MM-DD) for <input type="date"> values. */
export function toDateInput(value: string | Date | null | undefined): string {
  if (!value) return "";
  const date = typeof value === "string" ? new Date(value) : value;
  if (Number.isNaN(date.getTime())) return "";
  return date.toISOString().slice(0, 10);
}

export function isHttpUrl(value: string | null | undefined): value is string {
  if (!value) return false;
  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:";
  } catch {
    return false;
  }
}

export function displayHost(value: string): string {
  try {
    return new URL(value).host.replace(/^www\./, "");
  } catch {
    return value;
  }
}

export function truncate(value: string, max: number): string {
  if (value.length <= max) return value;
  return `${value.slice(0, Math.max(0, max - 1)).trimEnd()}…`;
}

export function pluralize(count: number, singular: string, plural = `${singular}s`): string {
  return `${count.toLocaleString("en-US")} ${count === 1 ? singular : plural}`;
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  const units = ["KB", "MB", "GB", "TB"];
  let value = bytes / 1024;
  let unit = 0;
  while (value >= 1024 && unit < units.length - 1) {
    value /= 1024;
    unit += 1;
  }
  return `${value.toFixed(value >= 10 ? 0 : 1)} ${units[unit]}`;
}

/** Two-digit index label, e.g. 1 → "01". */
export function indexLabel(index: number): string {
  return String(index).padStart(2, "0");
}
