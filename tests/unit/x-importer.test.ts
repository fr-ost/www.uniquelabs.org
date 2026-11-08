import path from "node:path";
import { stat } from "node:fs/promises";
import { describe, expect, it } from "vitest";
import { xImporter } from "@/lib/importers/x";
import { scoreTweet } from "@/lib/importers/x/classify";
import { normaliseTweet, parseTweetDate } from "@/lib/importers/x/parse";
import type { ImporterContext, UploadedFile } from "@/lib/importers/core/types";
import { sampleTweets, tempDir, tweet, writeText, writeZip, xWrapper } from "../fixtures/builders";

async function uploaded(file: string): Promise<UploadedFile> {
  return { path: file, name: path.basename(file), size: (await stat(file)).size };
}

function context(files: UploadedFile[]): ImporterContext {
  return { files, warn: () => undefined, onProgress: () => undefined, checkCancelled: async () => undefined };
}

async function runArchive() {
  const dir = await tempDir();
  const zip = await writeZip(path.join(dir, "twitter-archive.zip"), {
    "data/tweets.js": xWrapper("tweets", sampleTweets()),
    "data/account.js": xWrapper("account", [{ account: { email: "private@example.com", username: "uniquelabs", accountId: "42", accountDisplayName: "Unique Labs" } }]),
    "data/deleted-tweets.js": xWrapper("deleted_tweets", [tweet("9999", "We partnered with @secretco on something big")]),
    "assets/images/twemoji/1f600.svg": "<svg/>",
  });
  return xImporter.run(context([await uploaded(zip)]));
}

describe("X archive importer", () => {
  it("creates candidates only for explicit collaboration posts", async () => {
    const result = await runArchive();
    const titles = result.candidates.map((c) => c.title);
    expect(titles.some((t) => /Acme Tools/.test(t))).toBe(true);
    expect(titles.some((t) => /Dev Fund/.test(t))).toBe(true);
    // Retweet, appreciation reply, collab request, casual mention and deleted tweets are excluded.
    expect(titles.some((t) => /Big Brand|Cool Startup|Figma|secretco/i.test(t))).toBe(false);
    expect(result.stats.retweetsExcluded).toBe(1);
  });

  it("groups related posts about the same partner and links the original posts", async () => {
    const result = await runArchive();
    const acme = result.candidates.find((c) => /Acme Tools/.test(c.title))!;
    expect(acme.evidence.map((e) => e.sourceId).sort()).toEqual(["1001", "1002"]);
    expect(acme.evidence[0]!.sourceUrl).toBe("https://x.com/uniquelabs/status/1001");
    expect(acme.data.urls).toContain("https://acme.example/tabnest");
  });

  it("categorises sponsorships", async () => {
    const result = await runArchive();
    expect(result.candidates.find((c) => /Dev Fund/.test(c.title))?.collaborationCategory).toBe("SPONSORSHIP");
  });

  it("supports multiple archive parts uploaded as separate files", async () => {
    const dir = await tempDir();
    const tweets = sampleTweets();
    const part0 = await writeText(path.join(dir, "tweets.js"), xWrapper("tweets", tweets.slice(0, 3)));
    const part1 = await writeText(path.join(dir, "tweets-part1.js"), `window.YTD.tweets.part1 = ${JSON.stringify(tweets.slice(3))}`);
    const result = await xImporter.run(context([await uploaded(part0), await uploaded(part1)]));
    expect(result.stats.tweetsScanned).toBe(tweets.length);
    expect(result.candidates.length).toBeGreaterThanOrEqual(2);
  });

  it("reads the older tweet.js format without the tweet wrapper", async () => {
    const dir = await tempDir();
    const legacy = sampleTweets().map((t) => t.tweet);
    const file = await writeText(path.join(dir, "tweet.js"), xWrapper("tweet", legacy));
    const result = await xImporter.run(context([await uploaded(file)]));
    expect(result.stats.tweetsScanned).toBe(legacy.length);
  });
});

describe("tweet parsing and scoring", () => {
  it("parses X archive timestamps", () => {
    expect(parseTweetDate("Wed Oct 10 20:19:24 +0000 2018")?.toISOString()).toBe("2018-10-10T20:19:24.000Z");
    expect(parseTweetDate("Wed Oct 10 20:19:24 +0200 2018")?.toISOString()).toBe("2018-10-10T18:19:24.000Z");
  });

  it("expands t.co links and decodes HTML entities", () => {
    const t = normaliseTweet(tweet("1", "Tools &amp; more https://t.co/x", { urls: [{ url: "https://t.co/x", expanded_url: "https://example.org/tools" }] }));
    expect(t?.text).toBe("Tools & more https://example.org/tools");
  });

  it("does not treat a mention or appreciation as a collaboration", () => {
    const thanks = normaliseTweet(tweet("2", "Thank you @bigco for the amazing support!", { mentions: [{ screen_name: "bigco", name: "BigCo" }] }))!;
    expect(scoreTweet(thanks, "me").score).toBeLessThan(40);
    const mention = normaliseTweet(tweet("3", "Reading about @bigco today", { mentions: [{ screen_name: "bigco", name: "BigCo" }] }))!;
    expect(scoreTweet(mention, "me").score).toBeLessThan(40);
  });

  it("penalises replies to other accounts", () => {
    const reply = normaliseTweet(tweet("4", "@bigco we partnered with you last year!", { mentions: [{ screen_name: "bigco", name: "BigCo" }], replyTo: "1", replyToScreenName: "bigco" }))!;
    const original = normaliseTweet(tweet("5", "We partnered with @bigco last year!", { mentions: [{ screen_name: "bigco", name: "BigCo" }] }))!;
    expect(scoreTweet(reply, "me").score).toBeLessThan(scoreTweet(original, "me").score);
  });
});
