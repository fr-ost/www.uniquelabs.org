import type { ClaudeDocument } from "@/lib/importers/claude/parse";
import { codeBlockCount, devTermScore, findSignals, type Signal } from "@/lib/importers/claude/signals";
import {
  classifyUrl,
  cleanName,
  extractUrls,
  isPlausibleProductName,
  normaliseName,
  parseChromeStoreUrl,
  slugToTitle,
  storeSlug,
} from "@/lib/importers/core/text";

/**
 * Per-document product analysis: which product (if any) a conversation is
 * about, which URLs and platforms it mentions, and which stage signals the
 * owner's own words contain.
 */

export type NameSource = "manifest" | "chrome-store" | "store" | "project" | "title" | "phrase" | "html-title" | "package";

const NAME_WEIGHTS: Record<NameSource, number> = {
  manifest: 40,
  "chrome-store": 36,
  store: 30,
  project: 26,
  title: 22,
  phrase: 20,
  "html-title": 9,
  package: 6,
};

export interface NameMention {
  display: string;
  normalised: string;
  source: NameSource;
  weight: number;
}

export interface TimedSignal extends Signal {
  at: Date | null;
  owner: boolean;
}

export interface DocumentAnalysis {
  doc: ClaudeDocument;
  names: NameMention[];
  bestName: NameMention | null;
  chromeIds: string[];
  urls: { chromeStore: string[]; store: string[]; deployment: string[]; site: string[] };
  ownerUrls: Set<string>;
  platforms: Set<string>;
  signals: TimedSignal[];
  devScore: number;
  codeBlocks: number;
  manifestDescription: string | null;
  isProductRelated: boolean;
}

const MANIFEST_BLOCK = /"manifest_version"\s*:\s*[23]/;
const MANIFEST_NAME = /"name"\s*:\s*"([^"\\]{2,60})"/;
const MANIFEST_DESCRIPTION = /"description"\s*:\s*"([^"\\]{10,300})"/;
const HTML_TITLE = /<title>([^<]{2,60})<\/title>/i;
const PACKAGE_NAME = /"name"\s*:\s*"(@?[a-z0-9][a-z0-9._/-]{1,50})"\s*,\s*"version"/;

const NAME_PHRASES: RegExp[] = [
  /\b(?:my|our|the|a|an)\s+(?:new\s+)?(?:chrome\s+|browser\s+|firefox\s+)?(?:extension|app|tool|product|website|site|saas|plugin|add-?on|web app)\s+(?:is\s+)?(?:called|named)\s+["“'`]?([A-Z0-9][\w.+&' -]{1,40}?)["”'`]?(?=[\s,.!?;:)]|$)/,
  /\b(?:called|named)\s+["“'`]([^"”'`\n]{2,40})["”'`]/,
  /["“]([A-Z][\w.+&' -]{1,32})["”]\s+(?:chrome\s+)?(?:extension|app|tool|website)\b/,
  /\b(?:building|built|launch(?:ed|ing)?|publish(?:ed|ing)?|working on|developing)\s+([A-Z][a-zA-Z0-9]+(?:[A-Z][a-z0-9]+)+)\b/,
];

/** Title shapes such as "TabFlow Chrome Extension", "Building TabFlow", "TabFlow: pricing ideas". */
const LEADING_TITLE_WORDS =
  /^(?:(?:help(?:ing)?\s+(?:me\s+)?(?:with|build|create)|ideas?\s+for|plan(?:ning)?(?:\s+for)?|marketing(?:\s+for)?|pricing(?:\s+for)?|testing|reviewing|brainstorm(?:ing)?|naming|refactoring|optimi[sz]ing|my|our|the|a|new)\s+)+/i;

function namesFromTitle(title: string): string[] {
  const results: string[] = [];
  const t = title.replace(/\s+/g, " ").trim().replace(LEADING_TITLE_WORDS, "");
  const patterns = [
    /^(?:building|build|creating|create|launching|launch|publishing|publish|developing|designing|improving|fixing|debugging|updating)\s+(?:the\s+|my\s+|a\s+)?([A-Z][\w.+&-]*(?:\s+[A-Z][\w.+&-]*){0,3})/i,
    /^([A-Z][\w.+&-]*(?:\s+[A-Z][\w.+&-]*){0,3})\s+(?:chrome\s+|browser\s+)?(?:extension|app|website|web app|landing page|launch|marketing|pricing|store listing|privacy policy)\b/i,
    /^([A-Z][\w.+&-]*(?:\s+[A-Z][\w.+&-]*){0,3})\s*[:–—-]\s+/,
    /\b([A-Z][a-z0-9]+(?:[A-Z][a-z0-9]+)+)\b/,
  ];
  for (const pattern of patterns) {
    const match = pattern.exec(t);
    if (match?.[1]) results.push(match[1]);
  }
  return results;
}

function addName(names: NameMention[], raw: string, source: NameSource) {
  const display = cleanName(raw);
  if (!isPlausibleProductName(display)) return;
  const normalised = normaliseName(display);
  if (!normalised || normalised.length < 2) return;
  names.push({ display, normalised, source, weight: NAME_WEIGHTS[source] });
}

function pickBestName(names: NameMention[]): NameMention | null {
  const totals = new Map<string, { mention: NameMention; total: number }>();
  for (const mention of names) {
    const entry = totals.get(mention.normalised);
    if (entry) {
      entry.total += mention.weight;
      if (mention.weight > entry.mention.weight) entry.mention = mention;
    } else {
      totals.set(mention.normalised, { mention, total: mention.weight });
    }
  }
  let best: { mention: NameMention; total: number } | null = null;
  for (const entry of totals.values()) {
    if (!best || entry.total > best.total) best = entry;
  }
  return best ? { ...best.mention, weight: best.total } : null;
}

export function analyseDocument(doc: ClaudeDocument): DocumentAnalysis {
  const names: NameMention[] = [];
  const chromeIds = new Set<string>();
  const urls = { chromeStore: new Set<string>(), store: new Set<string>(), deployment: new Set<string>(), site: new Set<string>() };
  const ownerUrls = new Set<string>();
  const platforms = new Set<string>();
  const signals: TimedSignal[] = [];
  let devScore = 0;
  let codeBlocks = 0;
  let manifestDescription: string | null = null;

  if (doc.kind === "project") addName(names, doc.title, "project");
  else if (doc.kind === "conversation") for (const name of namesFromTitle(doc.title)) addName(names, name, "title");

  for (const message of doc.messages) {
    const owner = message.role === "human";
    const text = message.text;
    devScore += devTermScore(text);
    codeBlocks += codeBlockCount(text);

    if (MANIFEST_BLOCK.test(text)) {
      platforms.add("CHROME_EXTENSION");
      const name = MANIFEST_NAME.exec(text)?.[1];
      if (name) addName(names, name, "manifest");
      const description = MANIFEST_DESCRIPTION.exec(text)?.[1];
      if (description && !description.startsWith("__MSG_") && !manifestDescription) manifestDescription = description;
    }
    const htmlTitle = HTML_TITLE.exec(text)?.[1];
    if (htmlTitle) addName(names, htmlTitle, "html-title");
    const packageName = PACKAGE_NAME.exec(text)?.[1];
    if (packageName && !packageName.startsWith("@")) addName(names, slugToTitle(packageName), "package");

    if (owner) {
      for (const pattern of NAME_PHRASES) {
        const match = pattern.exec(text);
        if (match?.[1]) addName(names, match[1], "phrase");
      }
    }

    if (/\bchrome extension|browser extension|manifest v3\b/i.test(text)) platforms.add("CHROME_EXTENSION");
    if (/\bfirefox add-?on\b/i.test(text)) platforms.add("FIREFOX_ADDON");
    if (/\bedge add-?on\b/i.test(text)) platforms.add("EDGE_ADDON");

    for (const url of extractUrls(text)) {
      const kind = classifyUrl(url);
      if (kind === "reference" || kind === "local") continue;
      if (owner) ownerUrls.add(url);
      if (kind === "chrome-store") {
        urls.chromeStore.add(url);
        platforms.add("CHROME_EXTENSION");
        const { slug, id } = parseChromeStoreUrl(url);
        if (id && owner) chromeIds.add(id);
        if (slug) addName(names, slugToTitle(slug), "chrome-store");
      } else if (kind === "store") {
        urls.store.add(url);
        if (url.includes("addons.mozilla.org")) platforms.add("FIREFOX_ADDON");
        if (url.includes("microsoftedge")) platforms.add("EDGE_ADDON");
        if (url.includes("apps.apple.com")) platforms.add("IOS");
        if (url.includes("play.google.com")) platforms.add("ANDROID");
        const slug = storeSlug(url);
        if (slug) addName(names, slugToTitle(slug), "store");
      } else if (kind === "deployment") {
        urls.deployment.add(url);
        platforms.add("WEB_APP");
      } else if (owner) {
        urls.site.add(url);
      }
    }

    for (const signal of findSignals(text, owner)) {
      signals.push({ ...signal, at: message.createdAt, owner });
    }
  }

  const bestName = pickBestName(names);
  const hasStore = urls.chromeStore.size > 0 || urls.store.size > 0;
  const strongName = bestName !== null && ["manifest", "chrome-store", "store", "project"].includes(bestName.source);
  const isProductRelated =
    bestName !== null && (hasStore || strongName || devScore >= 6 || codeBlocks >= 2 || signals.some((s) => s.owner && s.kind !== "development"));

  return {
    doc,
    names,
    bestName,
    chromeIds: [...chromeIds],
    urls: {
      chromeStore: [...urls.chromeStore],
      store: [...urls.store],
      deployment: [...urls.deployment],
      site: [...urls.site].slice(0, 20),
    },
    ownerUrls,
    platforms,
    signals,
    devScore,
    codeBlocks,
    manifestDescription,
    isProductRelated,
  };
}
