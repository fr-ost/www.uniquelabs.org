import path from "node:path";
import { readFile, stat, writeFile } from "node:fs/promises";
import { describe, expect, it } from "vitest";
import { isSafeEntryName, isZipFile, scanArchive } from "@/lib/importers/core/archive";
import { tempDir, writeText, writeZip } from "../fixtures/builders";

async function uploaded(file: string) {
  return { path: file, name: path.basename(file), size: (await stat(file)).size };
}

describe("archive safety", () => {
  it("validates entry names", () => {
    expect(isSafeEntryName("data/tweets.js")).toBe(true);
    expect(isSafeEntryName("../etc/passwd")).toBe(false);
    expect(isSafeEntryName("data/../../evil.json")).toBe(false);
    expect(isSafeEntryName("/absolute/path.json")).toBe(false);
    expect(isSafeEntryName("C:\\Windows\\evil.json")).toBe(false);
    expect(isSafeEntryName("data\\..\\evil.json")).toBe(false);
    expect(isSafeEntryName("bad\u0000name")).toBe(false);
  });

  it("detects ZIP files by their magic bytes, not their name", async () => {
    const dir = await tempDir();
    const zip = await writeZip(path.join(dir, "export.json"), { "conversations.json": "[]" });
    const notZip = await writeText(path.join(dir, "fake.zip"), "this is not a zip");
    expect(await isZipFile(zip)).toBe(true);
    expect(await isZipFile(notZip)).toBe(false);
  });

  it("rejects archives containing path traversal entries", async () => {
    const dir = await tempDir();
    const file = await writeZip(path.join(dir, "evil.zip"), { "aa/evil.json": "[]" });
    // yazl refuses unsafe names, so patch the stored name bytes directly.
    const bytes = await readFile(file);
    const patched = Buffer.from(bytes.toString("latin1").split("aa/evil.json").join("../evil.json"), "latin1");
    await writeFile(file, patched);
    await expect(scanArchive(await uploaded(file), () => true, () => undefined)).rejects.toThrow();
  });

  it("rejects decompression bombs by compression ratio", async () => {
    const dir = await tempDir();
    const bomb = await writeZip(path.join(dir, "bomb.zip"), { "conversations.json": Buffer.alloc(80 * 1024 * 1024, 0x20) });
    await expect(scanArchive(await uploaded(bomb), () => true, () => undefined)).rejects.toThrow(/compression ratio/);
  });

  it("only exposes wanted entries and never extracts to disk", async () => {
    const dir = await tempDir();
    const file = await writeZip(path.join(dir, "ok.zip"), { "data/tweets.js": "window.YTD.tweets.part0 = []", "data/other.js": "x" });
    const scan = await scanArchive(await uploaded(file), (p) => p.endsWith("tweets.js"), () => undefined);
    expect(scan.entries.map((e) => e.path)).toEqual(["data/tweets.js"]);
    const stream = await scan.entries[0]!.open();
    let text = "";
    for await (const chunk of stream) text += chunk.toString();
    expect(text).toContain("window.YTD");
    scan.close();
  });
});
