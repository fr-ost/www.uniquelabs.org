/**
 * Text utilities shared by the importers: URL extraction and classification,
 * sentence splitting, excerpts and name normalisation.
 */

const URL_PATTERN = /\bhttps?:\/\/[^\s<>"'`)\]}]+/gi;

export function extractUrls(text: string): string[] {
  const found = new Set<string>();
  for (const match of text.matchAll(URL_PATTERN)) {
    let url = match[0].replace(/[.,;:!?*_~]+$/g, "");
    // Balance a trailing ")" that belongs to surrounding prose.
    if (url.endsWith(")") && !url.includes("(")) url = url.slice(0, -1);
    try {
      const parsed = new URL(url);
      if (parsed.protocol === "http:" || parsed.protocol === "https:") found.add(parsed.toString());
    } catch {
      // ignore malformed URLs
    }
  }
  return [...found];
}

export type UrlKind = "chrome-store" | "store" | "deployment" | "site" | "reference" | "local";

const REFERENCE_HOSTS = [
  /(^|\.)developer\.chrome\.com$/,
  /(^|\.)developer\.mozilla\.org$/,
  /(^|\.)stackoverflow\.com$/,
  /(^|\.)stackexchange\.com$/,
  /(^|\.)npmjs\.(com|org)$/,
  /(^|\.)w3schools\.com$/,
  /(^|\.)w3\.org$/,
  /(^|\.)schema\.org$/,
  /(^|\.)wikipedia\.org$/,
  /(^|\.)medium\.com$/,
  /(^|\.)dev\.to$/,
  /(^|\.)youtube\.com$/,
  /(^|\.)youtu\.be$/,
  /(^|\.)google\.com$/,
  /(^|\.)googleapis\.com$/,
  /(^|\.)gstatic\.com$/,
  /(^|\.)anthropic\.com$/,
  /(^|\.)claude\.ai$/,
  /(^|\.)openai\.com$/,
  /(^|\.)chatgpt\.com$/,
  /(^|\.)cdnjs\.cloudflare\.com$/,
  /(^|\.)jsdelivr\.net$/,
  /(^|\.)unpkg\.com$/,
  /(^|\.)readthedocs\.io$/,
  /(^|\.)reactjs\.org$/,
  /(^|\.)react\.dev$/,
  /(^|\.)nextjs\.org$/,
  /(^|\.)vercel\.com$/,
  /(^|\.)netlify\.com$/,
  /(^|\.)railway\.app$/,
  /(^|\.)tailwindcss\.com$/,
  /(^|\.)typescriptlang\.org$/,
  /(^|\.)nodejs\.org$/,
  /(^|\.)python\.org$/,
  /(^|\.)github\.com$/,
  /(^|\.)githubusercontent\.com$/,
  /(^|\.)twitter\.com$/,
  /(^|\.)x\.com$/,
  /(^|\.)t\.co$/,
  /(^|\.)linkedin\.com$/,
  /(^|\.)facebook\.com$/,
  /(^|\.)instagram\.com$/,
  /(^|\.)reddit\.com$/,
  /(^|\.)amazon\.com$/,
  /(^|\.)apple\.com$/,
  /(^|\.)microsoft\.com$/,
];

const LOCAL_HOSTS = [/^localhost$/, /^127\./, /^0\.0\.0\.0$/, /^192\.168\./, /^10\./, /\.local$/, /\.test$/, /\.example$/, /(^|\.)example\.(com|org|net)$/, /\.invalid$/];

const DEPLOYMENT_HOSTS = [
  /\.vercel\.app$/,
  /\.netlify\.app$/,
  /\.pages\.dev$/,
  /\.github\.io$/,
  /\.web\.app$/,
  /\.firebaseapp\.com$/,
  /\.up\.railway\.app$/,
  /\.onrender\.com$/,
  /\.herokuapp\.com$/,
  /\.fly\.dev$/,
  /\.workers\.dev$/,
  /\.replit\.app$/,
  /\.glitch\.me$/,
  /\.surge\.sh$/,
];

export function classifyUrl(url: string): UrlKind {
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return "reference";
  }
  const host = parsed.hostname.toLowerCase();
  if (LOCAL_HOSTS.some((p) => p.test(host))) return "local";
  if (host === "chromewebstore.google.com" || (host === "chrome.google.com" && parsed.pathname.startsWith("/webstore"))) {
    return /\/detail\//.test(parsed.pathname) ? "chrome-store" : "reference";
  }
  if (
    (host === "addons.mozilla.org" && /\/addon\//.test(parsed.pathname)) ||
    (host === "microsoftedge.microsoft.com" && /\/addons\/detail\//.test(parsed.pathname)) ||
    (host === "apps.apple.com" && /\/app\//.test(parsed.pathname)) ||
    (host === "play.google.com" && parsed.pathname.startsWith("/store/apps/details"))
  ) {
    return "store";
  }
  if (DEPLOYMENT_HOSTS.some((p) => p.test(host))) return "deployment";
  if (REFERENCE_HOSTS.some((p) => p.test(host))) return "reference";
  return "site";
}

/** Chrome Web Store listing: slug + 32-char extension id. */
export function parseChromeStoreUrl(url: string): { slug: string | null; id: string | null } {
  try {
    const parsed = new URL(url);
    const parts = parsed.pathname.split("/").filter(Boolean);
    const detail = parts.indexOf("detail");
    if (detail === -1) return { slug: null, id: null };
    const rest = parts.slice(detail + 1);
    const id = rest.find((part) => /^[a-p]{32}$/.test(part)) ?? null;
    const slug = rest.find((part) => !/^[a-p]{32}$/.test(part)) ?? null;
    return { slug: slug ? decodeURIComponent(slug) : null, id };
  } catch {
    return { slug: null, id: null };
  }
}

export function storeSlug(url: string): string | null {
  try {
    const parsed = new URL(url);
    const parts = parsed.pathname.split("/").filter(Boolean);
    if (parsed.hostname === "addons.mozilla.org") return parts[parts.indexOf("addon") + 1] ?? null;
    if (parsed.hostname === "microsoftedge.microsoft.com") return parts[parts.indexOf("detail") + 1] ?? null;
    if (parsed.hostname === "apps.apple.com") return parts[parts.indexOf("app") + 1] ?? null;
    return null;
  } catch {
    return null;
  }
}

export function slugToTitle(slug: string): string {
  return slug
    .replace(/[-_]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .split(" ")
    .map((word) => (word.length <= 2 && word !== word.toLowerCase() ? word : word.charAt(0).toUpperCase() + word.slice(1)))
    .join(" ");
}

export function hostOf(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

/** Splits prose into sentence-ish segments (also on line breaks). */
export function sentences(text: string): string[] {
  return text
    .split(/(?<=[.!?])\s+|\n+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
}

/** A short excerpt around the first match of `needle` (case-insensitive). */
export function excerptAround(text: string, needle: RegExp | string, max = 600): string {
  const clean = text.replace(/\s+/g, " ").trim();
  if (clean.length <= max) return clean;
  const re = typeof needle === "string" ? new RegExp(needle.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i") : needle;
  const match = re.exec(clean);
  if (!match) return `${clean.slice(0, max - 1)}…`;
  const start = Math.max(0, match.index - Math.floor(max / 3));
  const end = Math.min(clean.length, start + max);
  return `${start > 0 ? "…" : ""}${clean.slice(start, end).trim()}${end < clean.length ? "…" : ""}`;
}

const GENERIC_NAME_WORDS = new Set([
  "extension",
  "chrome",
  "chrome extension",
  "browser extension",
  "my extension",
  "the extension",
  "this extension",
  "extension name",
  "your extension",
  "your extension name",
  "my chrome extension",
  "app",
  "my app",
  "the app",
  "web app",
  "webapp",
  "website",
  "my website",
  "site",
  "tool",
  "my tool",
  "project",
  "my project",
  "product",
  "my product",
  "plugin",
  "addon",
  "add-on",
  "popup",
  "background",
  "content",
  "content script",
  "service worker",
  "options",
  "settings",
  "dashboard",
  "admin",
  "api",
  "bot",
  "test",
  "testing",
  "demo",
  "example",
  "sample",
  "untitled",
  "hello world",
  "new tab",
  "landing page",
  "saas",
  "mvp",
  "manifest",
  "name",
  "title",
  "home",
  "index",
  "main",
  "app name",
  "my-extension",
  "chrome-extension",
  "extension-name",
]);

const NAME_SUFFIXES = /\b(chrome|browser)?\s*(extension|ext|add-?on|plugin|app|web ?app|website|tool)\b\s*$/i;

/** Normalises a product name for deduplication ("TabFlow – Chrome Extension" → "tabflow"). */
export function normaliseName(name: string): string {
  return name
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[™®©]/g, "")
    .replace(/\s+[–—|:-]\s+.*$/, "")
    .replace(NAME_SUFFIXES, "")
    .replace(/\bfor\s+(chrome|firefox|edge)\b/g, "")
    .replace(/^the\s+/, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .replace(/\s+/g, "-");
}

export function isPlausibleProductName(name: string): boolean {
  const trimmed = name.trim();
  if (trimmed.length < 2 || trimmed.length > 48) return false;
  if (trimmed.split(/\s+/).length > 6) return false;
  if (/^__MSG_/.test(trimmed)) return false;
  if (/^[\d\W_]+$/.test(trimmed)) return false;
  if (/[{}<>[\]=;`]/.test(trimmed)) return false;
  const lower = trimmed.toLowerCase();
  if (GENERIC_NAME_WORDS.has(lower)) return false;
  const normalised = normaliseName(trimmed);
  if (!normalised || GENERIC_NAME_WORDS.has(normalised.replace(/-/g, " "))) return false;
  return true;
}

export function cleanName(name: string): string {
  return name
    .replace(/^["'“”‘’`*_]+|["'“”‘’`*_.,:;!?]+$/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

export function truncateText(text: string, max: number): string {
  const clean = text.replace(/\s+/g, " ").trim();
  return clean.length <= max ? clean : `${clean.slice(0, max - 1).trimEnd()}…`;
}

export function toDate(value: unknown): Date | null {
  if (typeof value !== "string" && typeof value !== "number") return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}
