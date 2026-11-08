import { createWriteStream } from "node:fs";
import { mkdtemp, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import yazl from "yazl";

/**
 * Builders for realistic import fixtures, modelled on the documented
 * structure of the official Claude export and the X data archive.
 */

export async function tempDir(prefix = "ul-test-"): Promise<string> {
  return mkdtemp(path.join(os.tmpdir(), prefix));
}

export async function writeZip(target: string, files: Record<string, string | Buffer>): Promise<string> {
  const zip = new yazl.ZipFile();
  for (const [name, content] of Object.entries(files)) {
    zip.addBuffer(typeof content === "string" ? Buffer.from(content, "utf8") : content, name, { mtime: new Date("2025-01-01T00:00:00Z") });
  }
  await new Promise<void>((resolve, reject) => {
    const out = createWriteStream(target);
    zip.outputStream.pipe(out).on("close", () => resolve()).on("error", reject);
    zip.end();
  });
  return target;
}

export async function writeText(target: string, content: string): Promise<string> {
  await writeFile(target, content, "utf8");
  return target;
}

let counter = 0;
const uuid = () => {
  counter += 1;
  return `00000000-0000-4000-8000-${String(counter).padStart(12, "0")}`;
};

export function message(sender: "human" | "assistant", text: string, createdAt = "2025-03-01T10:00:00.000000Z") {
  return {
    uuid: uuid(),
    text,
    content: [{ type: "text", text, start_timestamp: createdAt, stop_timestamp: createdAt, citations: [] }],
    sender,
    created_at: createdAt,
    updated_at: createdAt,
    attachments: [],
    files: [],
  };
}

export function conversation(name: string, messages: ReturnType<typeof message>[], createdAt = "2025-03-01T10:00:00.000000Z") {
  return { uuid: uuid(), name, summary: "", created_at: createdAt, updated_at: createdAt, account: { uuid: uuid() }, chat_messages: messages };
}

/** A small but representative Claude history covering every classification path. */
export function sampleClaudeConversations() {
  return [
    conversation(
      "TabNest Chrome Extension",
      [
        message("human", "I'm building a Chrome extension called TabNest that groups tabs into sessions. Here is my manifest:\n```json\n{\n  \"manifest_version\": 3,\n  \"name\": \"TabNest\",\n  \"description\": \"Save and restore groups of tabs in one click.\",\n  \"version\": \"1.0\"\n}\n```", "2025-01-10T09:00:00Z"),
        message("assistant", "Great start! Make sure your background service worker is registered. Once you publish to the Chrome Web Store you can share the link.", "2025-01-10T09:01:00Z"),
        message("human", "I fixed the error in background.js, the popup works now.", "2025-01-12T09:00:00Z"),
      ],
      "2025-01-10T09:00:00Z",
    ),
    conversation(
      "TabNest launch",
      [
        message("human", "Good news — TabNest got approved! It's now live on the Chrome Web Store: https://chromewebstore.google.com/detail/tabnest/abcdefghijklmnopabcdefghijklmnop", "2025-02-20T09:00:00Z"),
        message("assistant", "Congratulations on the launch! Here are some ideas for your store listing.", "2025-02-20T09:01:00Z"),
      ],
      "2025-02-20T09:00:00Z",
    ),
    conversation(
      "Planning ReadQuiet extension",
      [
        message("human", "How do I publish my extension ReadQuiet to the Chrome Web Store? I want to launch it next month.", "2025-04-01T09:00:00Z"),
        message("assistant", "Here's how to publish: create a developer account, zip your extension...", "2025-04-01T09:01:00Z"),
        message("human", "Here's the roadmap and feature list for ReadQuiet: reader mode, fonts, dark theme.", "2025-04-01T09:05:00Z"),
      ],
      "2025-04-01T09:00:00Z",
    ),
    conversation(
      "Building FormFill Pro",
      [
        message("human", "I have an idea for an extension called \"FormFill Pro\" that autofills forms locally.", "2025-05-01T09:00:00Z"),
        message("assistant", "That's a useful idea. A content script could detect forms...", "2025-05-01T09:01:00Z"),
        message("human", "We launched a beta for FormFill Pro with 20 beta testers last week.", "2025-06-01T09:00:00Z"),
      ],
      "2025-05-01T09:00:00Z",
    ),
    conversation(
      "Recipe ideas for dinner",
      [message("human", "What should I cook tonight with chicken and rice?"), message("assistant", "Try a simple chicken fried rice!")],
    ),
    conversation(
      "ClipShelf extension",
      [
        message("human", "My extension ClipShelf was rejected from the Chrome Web Store for a policy violation.", "2025-07-01T09:00:00Z"),
        message("assistant", "Let's review the rejection reason and fix the manifest permissions.", "2025-07-01T09:01:00Z"),
      ],
      "2025-07-01T09:00:00Z",
    ),
  ];
}

export function sampleProjects() {
  return [
    {
      uuid: "11111111-1111-4111-8111-111111111111",
      name: "TabNest",
      description: "Chrome extension for tab sessions",
      is_private: true,
      prompt_template: "",
      created_at: "2025-01-05T00:00:00Z",
      updated_at: "2025-02-01T00:00:00Z",
      docs: [{ uuid: "d1", filename: "notes.md", content: "TabNest roadmap and store listing notes.", created_at: "2025-01-05T00:00:00Z" }],
    },
  ];
}

export function sampleMemories() {
  return [{ conversations_memory: "The user is a developer who launched a Chrome extension called TabNest in February 2025.", project_memories: {} }];
}

// ---------------------------------------------------------------------------
// X archive
// ---------------------------------------------------------------------------

export function tweet(id: string, fullText: string, options: Partial<{
  createdAt: string;
  mentions: Array<{ screen_name: string; name: string }>;
  hashtags: string[];
  urls: Array<{ url: string; expanded_url: string }>;
  replyTo: string | null;
  replyToScreenName: string | null;
}> = {}) {
  return {
    tweet: {
      edit_info: { initial: { editTweetIds: [id], editableUntil: "2025-01-01T00:00:00.000Z", editsRemaining: "5", isEditEligible: true } },
      retweeted: false,
      source: "<a href=\"https://x.com\" rel=\"nofollow\">X Web App</a>",
      entities: {
        hashtags: (options.hashtags ?? []).map((text) => ({ text, indices: ["0", "1"] })),
        symbols: [],
        user_mentions: (options.mentions ?? []).map((m, i) => ({ ...m, indices: [String(fullText.indexOf(`@${m.screen_name}`)), String(i)], id_str: "1", id: "1" })),
        urls: (options.urls ?? []).map((u) => ({ ...u, display_url: u.expanded_url.replace(/^https?:\/\//, ""), indices: ["0", "1"] })),
      },
      display_text_range: ["0", String(fullText.length)],
      favorite_count: "12",
      id_str: id,
      truncated: false,
      retweet_count: "3",
      id,
      ...(options.replyTo ? { in_reply_to_status_id_str: options.replyTo, in_reply_to_status_id: options.replyTo, in_reply_to_screen_name: options.replyToScreenName ?? "someone" } : {}),
      created_at: options.createdAt ?? "Wed Mar 05 10:00:00 +0000 2025",
      favorited: false,
      full_text: fullText,
      lang: "en",
    },
  };
}

export function sampleTweets() {
  const acme = [{ screen_name: "acmetools", name: "Acme Tools" }];
  return [
    tweet("1001", "Excited to announce our partnership with @acmetools! TabNest now integrates with Acme boards. https://t.co/abc", {
      createdAt: "Wed Mar 05 10:00:00 +0000 2025",
      mentions: acme,
      urls: [{ url: "https://t.co/abc", expanded_url: "https://acme.example/tabnest" }],
    }),
    tweet("1002", "Thanks again @acmetools for teaming up with us on the launch week campaign 🎉", {
      createdAt: "Mon Mar 24 10:00:00 +0000 2025",
      mentions: acme,
    }),
    tweet("1003", "RT @bigbrand: We partnered with @someone on a huge campaign", { mentions: [{ screen_name: "bigbrand", name: "Big Brand" }] }),
    tweet("1004", "@coolstartup love your product, great work!", {
      mentions: [{ screen_name: "coolstartup", name: "Cool Startup" }],
      replyTo: "999",
      replyToScreenName: "coolstartup",
    }),
    tweet("1005", "Anyone want to collab on a Chrome extension? DM me!", {}),
    tweet("1006", "This month's update is sponsored by @devfund. Thank you for supporting open tools! #ad", {
      createdAt: "Tue Jul 01 10:00:00 +0000 2025",
      mentions: [{ screen_name: "devfund", name: "Dev Fund" }],
      hashtags: ["ad"],
    }),
    tweet("1007", "Just used @figma to sketch our new icons", { mentions: [{ screen_name: "figma", name: "Figma" }] }),
  ];
}

export function xWrapper(name: string, items: unknown[]): string {
  return `window.YTD.${name}.part0 = ${JSON.stringify(items, null, 2)}`;
}
