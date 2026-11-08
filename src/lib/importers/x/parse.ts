import { toDate } from "@/lib/importers/core/text";

/**
 * Normalisation of tweets from the X/Twitter data archive.
 *
 * Archive files are JavaScript assignments such as
 *   window.YTD.tweets.part0 = [ { "tweet": { … } }, … ]
 * (older archives: window.YTD.tweet.part0, sometimes without the "tweet"
 * wrapper). The prefix is skipped and the array is parsed as JSON — the
 * JavaScript is never evaluated. Plain JSON arrays of tweets also work.
 */

export interface NormalisedTweet {
  id: string;
  text: string;
  createdAt: Date | null;
  isRetweet: boolean;
  isReply: boolean;
  replyToScreenName: string | null;
  mentions: Array<{ handle: string; name: string | null; start: number }>;
  hashtags: string[];
  urls: string[];
  favoriteCount: number;
  retweetCount: number;
  lang: string | null;
}

function record(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" && !Array.isArray(value) ? (value as Record<string, unknown>) : null;
}

function str(value: unknown): string | null {
  return typeof value === "string" && value.length > 0 ? value : typeof value === "number" ? String(value) : null;
}

function num(value: unknown): number {
  const n = typeof value === "number" ? value : Number(value);
  return Number.isFinite(n) ? n : 0;
}

/** X archive dates look like "Wed Oct 10 20:19:24 +0000 2018"; ISO strings also appear. */
export function parseTweetDate(value: unknown): Date | null {
  const s = str(value);
  if (!s) return null;
  const match = /^\w{3} (\w{3}) (\d{1,2}) (\d{2}):(\d{2}):(\d{2}) ([+-]\d{4}) (\d{4})$/.exec(s);
  if (match) {
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const month = months.indexOf(match[1]!);
    if (month >= 0) {
      const offset = match[6]!;
      const sign = offset.startsWith("-") ? -1 : 1;
      const minutes = sign * (Number(offset.slice(1, 3)) * 60 + Number(offset.slice(3, 5)));
      const utc = Date.UTC(Number(match[7]), month, Number(match[2]), Number(match[3]), Number(match[4]), Number(match[5]));
      return new Date(utc - minutes * 60 * 1000);
    }
  }
  return toDate(s);
}

const HTML_ENTITIES: Record<string, string> = { "&amp;": "&", "&lt;": "<", "&gt;": ">", "&quot;": '"', "&#39;": "'", "&apos;": "'" };

function decodeEntities(text: string): string {
  return text.replace(/&(?:amp|lt|gt|quot|#39|apos);/g, (m) => HTML_ENTITIES[m] ?? m);
}

export function normaliseTweet(raw: unknown): NormalisedTweet | null {
  const wrapper = record(raw);
  if (!wrapper) return null;
  const t = record(wrapper.tweet) ?? wrapper;
  const id = str(t.id_str) ?? str(t.id);
  if (!id || !/^\d{1,25}$/.test(id)) return null;
  let text = decodeEntities(str(t.full_text) ?? str(t.text) ?? "");
  const entities = record(t.entities) ?? {};

  const urls: string[] = [];
  for (const u of Array.isArray(entities.urls) ? entities.urls : []) {
    const entry = record(u);
    const short = entry ? str(entry.url) : null;
    const expanded = entry ? (str(entry.expanded_url) ?? short) : null;
    if (expanded) urls.push(expanded);
    if (short && expanded) text = text.split(short).join(expanded);
  }
  // Media links (pic.twitter.com) add no meaning to the text.
  for (const m of Array.isArray(entities.media) ? entities.media : []) {
    const short = str(record(m)?.url);
    if (short) text = text.split(short).join("").trim();
  }

  const mentions = (Array.isArray(entities.user_mentions) ? entities.user_mentions : []).flatMap((m) => {
    const entry = record(m);
    const handle = entry ? str(entry.screen_name) : null;
    if (!handle) return [];
    const indices = Array.isArray(entry?.indices) ? entry.indices : [];
    return [{ handle, name: str(entry?.name), start: num(indices[0]) }];
  });
  const hashtags = (Array.isArray(entities.hashtags) ? entities.hashtags : []).flatMap((h) => {
    const tag = str(record(h)?.text);
    return tag ? [tag] : [];
  });

  const replyTo = str(t.in_reply_to_status_id_str) ?? str(t.in_reply_to_status_id);
  return {
    id,
    text,
    createdAt: parseTweetDate(t.created_at),
    isRetweet: /^RT @\w+:/.test(text) || t.retweeted === true || Boolean(record(t.retweeted_status)),
    isReply: Boolean(replyTo),
    replyToScreenName: str(t.in_reply_to_screen_name),
    mentions,
    hashtags,
    urls,
    favoriteCount: num(t.favorite_count),
    retweetCount: num(t.retweet_count),
    lang: str(t.lang),
  };
}

/** data/note-tweet.js holds the full text of long posts (X Premium). */
export function normaliseNoteTweet(raw: unknown): { createdAt: Date | null; text: string } | null {
  const wrapper = record(raw);
  const note = wrapper ? (record(wrapper.noteTweet) ?? wrapper) : null;
  const core = note ? record(note.core) : null;
  const text = core ? str(core.text) : null;
  if (!note || !text) return null;
  return { createdAt: toDate(note.createdAt), text: decodeEntities(text) };
}

/** data/account.js: only the username is kept (used to build tweet URLs). */
export function extractUsername(raw: unknown): string | null {
  const wrapper = record(raw);
  const account = wrapper ? (record(wrapper.account) ?? wrapper) : null;
  const username = account ? str(account.username) : null;
  return username && /^[A-Za-z0-9_]{1,15}$/.test(username) ? username : null;
}
