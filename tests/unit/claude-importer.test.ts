import path from "node:path";
import { stat } from "node:fs/promises";
import { describe, expect, it } from "vitest";
import { claudeImporter } from "@/lib/importers/claude";
import { findSignals } from "@/lib/importers/claude/signals";
import { normaliseConversation } from "@/lib/importers/claude/parse";
import type { ImporterContext, UploadedFile } from "@/lib/importers/core/types";
import {
  conversation,
  message,
  sampleClaudeConversations,
  sampleMemories,
  sampleProjects,
  tempDir,
  writeText,
  writeZip,
} from "../fixtures/builders";

async function uploaded(file: string): Promise<UploadedFile> {
  return { path: file, name: path.basename(file), size: (await stat(file)).size };
}

function context(files: UploadedFile[]): ImporterContext & { warnings: string[] } {
  const warnings: string[] = [];
  return {
    files,
    warnings,
    warn: (m) => void warnings.push(m),
    onProgress: () => undefined,
    checkCancelled: async () => undefined,
  };
}

async function runFixture() {
  const dir = await tempDir();
  const zip = await writeZip(path.join(dir, "claude-export.zip"), {
    "data-2025-11-01-batch-0000/conversations.json": JSON.stringify(sampleClaudeConversations()),
    "data-2025-11-01-batch-0000/projects.json": JSON.stringify(sampleProjects()),
    "data-2025-11-01-batch-0000/memories.json": JSON.stringify(sampleMemories()),
    "data-2025-11-01-batch-0000/users.json": JSON.stringify([{ uuid: "u", full_name: "Owner", email_address: "owner@example.com" }]),
  });
  const ctx = context([await uploaded(zip)]);
  const result = await claudeImporter.run(ctx);
  return { result, ctx };
}

describe("Claude export importer", () => {
  it("finds the published product with strong evidence and merges all of its sources", async () => {
    const { result } = await runFixture();
    const tabnest = result.candidates.find((c) => c.title === "TabNest");
    expect(tabnest).toBeDefined();
    expect(tabnest!.productStage).toBe("PUBLISHED");
    expect(tabnest!.verification).toBe("EVIDENCE_FOUND");
    expect(tabnest!.fingerprint).toBe("cws:abcdefghijklmnopabcdefghijklmnop");
    // Two conversations + the project + the memory entry
    expect(tabnest!.evidence.length).toBeGreaterThanOrEqual(3);
    expect(tabnest!.summary).toBe("Save and restore groups of tabs in one click.");
    expect((tabnest!.data.platforms as string[])).toContain("CHROME_EXTENSION");
    const conversationEvidence = tabnest!.evidence.find((e) => e.sourceType === "CLAUDE_CONVERSATION");
    expect(conversationEvidence?.sourceUrl).toMatch(/^https:\/\/claude\.ai\/chat\//);
    expect(conversationEvidence?.excerpt).toBeTruthy();
  });

  it("never treats questions or future plans as publication", async () => {
    const { result } = await runFixture();
    const readQuiet = result.candidates.find((c) => c.title === "ReadQuiet");
    expect(readQuiet).toBeDefined();
    expect(readQuiet!.productStage).not.toBe("PUBLISHED");
    expect(readQuiet!.verification).toBe("NEEDS_VERIFICATION");
  });

  it("classifies a beta and keeps rejected products unpublished", async () => {
    const { result } = await runFixture();
    expect(result.candidates.find((c) => c.title === "FormFill Pro")?.productStage).toBe("BETA");
    const clip = result.candidates.find((c) => c.title === "ClipShelf");
    expect(clip?.productStage).not.toBe("PUBLISHED");
  });

  it("ignores conversations that are not about a product", async () => {
    const { result } = await runFixture();
    expect(result.candidates.some((c) => /recipe|dinner|chicken/i.test(c.title))).toBe(false);
    expect(result.stats.conversationsScanned).toBe(6);
  });

  it("accepts a bare conversations.json file", async () => {
    const dir = await tempDir();
    const file = await writeText(path.join(dir, "conversations.json"), JSON.stringify(sampleClaudeConversations()));
    const result = await claudeImporter.run(context([await uploaded(file)]));
    expect(result.candidates.find((c) => c.title === "TabNest")?.productStage).toBe("PUBLISHED");
  });

  it("explains when an archive contains no Claude data", async () => {
    const dir = await tempDir();
    const zip = await writeZip(path.join(dir, "random.zip"), { "notes.txt": "hello" });
    await expect(claudeImporter.run(context([await uploaded(zip)]))).rejects.toThrow(/No Claude export data/);
  });

  it("removes the 'unsupported block' placeholder and reads content blocks", () => {
    const doc = normaliseConversation(
      conversation("Test", [message("human", "Hello This block is not supported on your current device yet. world")]),
    );
    expect(doc?.messages[0]?.text).not.toContain("not supported");
  });
});

describe("stage signals", () => {
  const kinds = (text: string, owner = true) => findSignals(text, owner).map((s) => s.kind);

  it("detects explicit release statements", () => {
    expect(kinds("We launched TabNest last week and it's going well.")).toContain("published");
    expect(kinds("It's now live on the Chrome Web Store.")).toContain("published");
    expect(kinds("My extension got approved yesterday.")).toContain("approved");
    expect(kinds("We have 1,200 weekly users now.")).toContain("usage");
  });

  it("ignores hypothetical, negated and questioning sentences", () => {
    expect(kinds("How do I publish my extension?")).not.toContain("published");
    expect(kinds("Once it's live on the Chrome Web Store I'll share it.")).not.toContain("published");
    expect(kinds("It's not live yet.")).not.toContain("published");
    expect(kinds("I want to launch it next month.")).not.toContain("published");
    expect(kinds("We should launch soon.")).not.toContain("published");
  });

  it("does not count bare build/launch/create/develop words as publication", () => {
    const found = kinds("Let's build and develop the launch plan and create the extension.");
    expect(found).not.toContain("published");
  });

  it("only uses the owner's own words for publication evidence", () => {
    expect(kinds("We launched TabNest last week.", false)).not.toContain("published");
  });
});
