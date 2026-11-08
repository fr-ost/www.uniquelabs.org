import { baseName, isZipFile, plainFileEntry, scanArchive, type SourceEntry } from "@/lib/importers/core/archive";
import { streamJsonArray } from "@/lib/importers/core/json-array-stream";
import { truncateText } from "@/lib/importers/core/text";
import { ImportFormatError, type CandidateDraft, type Importer, type ImporterContext } from "@/lib/importers/core/types";
import { CANDIDATE_THRESHOLD, scoreTweet, type TweetScore } from "@/lib/importers/x/classify";
import { extractUsername, normaliseNoteTweet, normaliseTweet, type NormalisedTweet } from "@/lib/importers/x/parse";
import { COLLABORATION_CATEGORY_LABELS } from "@/lib/labels";

/**
 * X/Twitter archive importer ("Import X Archive").
 *
 * Accepts the archive ZIP (or several part ZIPs), or individual data files:
 * tweets.js / tweet.js / tweets-partN.js, note-tweet.js, account.js, and
 * plain JSON arrays of tweets. Deleted tweets are never read.
 */

type FileRole = "tweets" | "notes" | "account";

function roleFor(path: string): FileRole | null {
  const name = baseName(path).toLowerCase();
  if (/^(?:tweets?|tweets?-part\d+)\.(?:js|json)$/.test(name)) return "tweets";
  if (/^note-tweet(?:-part\d+)?\.js$/.test(name)) return "notes";
  if (/^account\.js$/.test(name)) return "account";
  return null;
}

const GROUP_WINDOW_DAYS = 90;

interface Scored {
  tweet: NormalisedTweet;
  score: TweetScore;
}

function tweetUrl(id: string, username: string | null) {
  return username ? `https://x.com/${username}/status/${id}` : `https://x.com/i/web/status/${id}`;
}

function partnerKey(item: Scored): string {
  const handle = item.score.partners[0]?.handle;
  if (handle) return `@${handle.toLowerCase()}`;
  const name = item.score.partnerName;
  return name ? `name:${name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}` : "unknown";
}

export const xImporter: Importer = {
  kind: "X_ARCHIVE",
  label: "X archive",
  acceptedExtensions: [".zip", ".js", ".json"],

  async run(context: ImporterContext) {
    const stats = {
      files: context.files.length,
      sourceFiles: 0,
      tweetsScanned: 0,
      retweetsExcluded: 0,
      repliesSeen: 0,
      collaborationSignals: 0,
      duplicateTweets: 0,
      skippedMalformed: 0,
    };
    const sources: Array<{ entry: SourceEntry; role: FileRole }> = [];
    const closers: Array<() => void> = [];

    for (const file of context.files) {
      if (await isZipFile(file.path)) {
        const scan = await scanArchive(file, (path) => /(^|\/)data\//.test(path.replace(/\\/g, "/")) && roleFor(path) !== null, context.warn);
        closers.push(scan.close);
        for (const entry of scan.entries) sources.push({ entry, role: roleFor(entry.path)! });
        if (!scan.entries.some((e) => roleFor(e.path) === "tweets")) context.warn(`${file.name}: no data/tweets.js found inside the archive.`);
      } else {
        const role = roleFor(file.name) ?? (/\.(js|json)$/i.test(file.name) ? "tweets" : null);
        if (!role) {
          context.warn(`${file.name}: not an X archive data file — skipped.`);
          continue;
        }
        sources.push({ entry: plainFileEntry(file), role });
      }
    }
    if (!sources.some((s) => s.role === "tweets")) {
      throw new ImportFormatError("No tweets found. Upload your X archive ZIP or its data/tweets.js file(s).");
    }
    stats.sourceFiles = sources.length;

    // Account first (username for URLs), then notes (full text of long posts), then tweets.
    const order: Record<FileRole, number> = { account: 0, notes: 1, tweets: 2 };
    sources.sort((a, b) => order[a.role] - order[b.role]);

    let username: string | null = null;
    const notesByTime = new Map<number, string>();
    const seen = new Set<string>();
    const scored: Scored[] = [];
    const totalBytes = sources.reduce((sum, s) => sum + s.entry.size, 0) || 1;
    let bytesDone = 0;
    let lastReport = 0;

    try {
      for (const { entry, role } of sources) {
        const stream = await entry.open();
        await streamJsonArray(stream, {
          allowPrefix: true,
          maxElementBytes: 4 * 1024 * 1024,
          onBytes: (bytes) => {
            bytesDone += bytes;
          },
          onMalformed: () => {
            stats.skippedMalformed += 1;
          },
          onElement: async (value) => {
            if (role === "account") {
              username ??= extractUsername(value);
              return;
            }
            if (role === "notes") {
              const note = normaliseNoteTweet(value);
              if (note?.createdAt) notesByTime.set(Math.floor(note.createdAt.getTime() / 1000), note.text);
              return;
            }
            const tweet = normaliseTweet(value);
            if (!tweet) {
              stats.skippedMalformed += 1;
              return;
            }
            if (seen.has(tweet.id)) {
              stats.duplicateTweets += 1;
              return;
            }
            seen.add(tweet.id);
            stats.tweetsScanned += 1;
            if (tweet.createdAt) {
              const note = notesByTime.get(Math.floor(tweet.createdAt.getTime() / 1000));
              if (note && note.length > tweet.text.length) tweet.text = note;
            }
            if (tweet.isRetweet) {
              stats.retweetsExcluded += 1;
              return;
            }
            if (tweet.isReply) stats.repliesSeen += 1;
            const score = scoreTweet(tweet, username);
            if (score.score >= CANDIDATE_THRESHOLD && !score.excludedReason) {
              stats.collaborationSignals += 1;
              scored.push({ tweet, score });
            }
            const now = Date.now();
            if (now - lastReport > 750) {
              lastReport = now;
              await context.onProgress({ phase: "Scanning tweets", percent: Math.min(95, Math.round((bytesDone / totalBytes) * 95)), processedItems: stats.tweetsScanned });
              await context.checkCancelled();
            }
          },
        });
      }
    } finally {
      closers.forEach((close) => close());
    }

    if (stats.skippedMalformed > 0) context.warn(`${stats.skippedMalformed} item(s) had an unrecognised structure and were skipped.`);
    if (!username) context.warn("account.js was not included, so tweet links use the generic x.com/i/web/status/… form.");

    // Group tweets about the same partner that are close in time.
    await context.onProgress({ phase: "Grouping candidates", percent: 96, processedItems: stats.tweetsScanned });
    scored.sort((a, b) => (a.tweet.createdAt?.getTime() ?? 0) - (b.tweet.createdAt?.getTime() ?? 0));
    const groups: Scored[][] = [];
    const openGroups = new Map<string, Scored[]>();
    for (const item of scored) {
      const key = partnerKey(item);
      const current = key === "unknown" ? undefined : openGroups.get(key);
      const lastTime = current?.[current.length - 1]?.tweet.createdAt?.getTime() ?? 0;
      const time = item.tweet.createdAt?.getTime() ?? 0;
      if (current && time - lastTime <= GROUP_WINDOW_DAYS * 24 * 60 * 60 * 1000) {
        current.push(item);
      } else {
        const group = [item];
        groups.push(group);
        if (key !== "unknown") openGroups.set(key, group);
      }
    }

    const candidates: CandidateDraft[] = groups.map((group) => {
      const lead = [...group].sort((a, b) => b.score.score - a.score.score)[0]!;
      const partners = new Map<string, { handle: string | null; name: string }>();
      for (const item of group) {
        for (const p of item.score.partners) partners.set(p.handle.toLowerCase(), { handle: p.handle, name: p.name ?? `@${p.handle}` });
        if (item.score.partnerName) partners.set(item.score.partnerName.toLowerCase(), { handle: null, name: item.score.partnerName });
      }
      const partnerList = [...partners.values()];
      const primary = partnerList[0]?.name ?? "Unknown partner";
      const categoryLabel = COLLABORATION_CATEGORY_LABELS[lead.score.category];
      const confidence = Math.min(95, Math.round(lead.score.score * 0.8 + Math.min(15, (group.length - 1) * 5) + (lead.tweet.isReply ? 0 : 5)));
      const times = group.map((g) => g.tweet.createdAt).filter((d): d is Date => d instanceof Date);
      const first = group[0]!;
      return {
        kind: "COLLABORATION",
        fingerprint: `x:${partnerKey(first)}:${first.tweet.id}`,
        title: lead.score.category === "OTHER" ? `Collaboration with ${primary}` : `${categoryLabel} with ${primary}`,
        summary: truncateText(lead.tweet.text, 320),
        collaborationCategory: lead.score.category,
        confidence,
        verification: lead.score.score >= 60 && !lead.tweet.isReply ? "EVIDENCE_FOUND" : "NEEDS_VERIFICATION",
        data: {
          partners: partnerList,
          hashtags: [...new Set(group.flatMap((g) => g.tweet.hashtags))],
          urls: [...new Set(group.flatMap((g) => g.tweet.urls).filter((u) => !/(?:twitter|x)\.com\/\w+\/status\//.test(u)))].slice(0, 12),
          tweetUrls: group.map((g) => tweetUrl(g.tweet.id, username)),
          leadTweetUrl: tweetUrl(lead.tweet.id, username),
          leadTweetId: lead.tweet.id,
          ownerUsername: username,
        },
        signals: [
          `Strongest signals: ${lead.score.matched.slice(0, 6).join(", ")}`,
          `${group.length} related post${group.length === 1 ? "" : "s"}`,
          ...(lead.tweet.isReply ? ["Lead post is a reply — verify carefully"] : []),
          ...(partnerList.length === 0 ? ["No partner account identified"] : []),
        ],
        firstSeenAt: times[0] ?? null,
        lastSeenAt: times[times.length - 1] ?? null,
        evidence: group.map((item) => ({
          sourceType: "TWEET" as const,
          sourceId: item.tweet.id,
          sourceTitle: `Post from ${item.tweet.createdAt ? item.tweet.createdAt.toISOString().slice(0, 10) : "unknown date"}`,
          sourceUrl: tweetUrl(item.tweet.id, username),
          excerpt: item.tweet.text.slice(0, 2000),
          sourceTimestamp: item.tweet.createdAt,
          author: username,
          details: {
            matched: item.score.matched,
            score: item.score.score,
            mentions: item.score.partners.map((p) => `@${p.handle}`),
            hashtags: item.tweet.hashtags,
            urls: item.tweet.urls,
            isReply: item.tweet.isReply,
            likes: item.tweet.favoriteCount,
          },
        })),
      };
    });

    return { candidates: candidates.sort((a, b) => b.confidence - a.confidence), stats };
  },
};
