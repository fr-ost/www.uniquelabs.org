import { describe, expect, it } from "vitest";
import { streamJsonArray } from "@/lib/importers/core/json-array-stream";
import { ImportFormatError } from "@/lib/importers/core/types";

async function* chunked(text: string, size: number) {
  const buffer = Buffer.from(text, "utf8");
  for (let i = 0; i < buffer.length; i += size) yield buffer.subarray(i, i + size);
}

async function collect(text: string, size: number, options: Partial<Parameters<typeof streamJsonArray>[1]> = {}) {
  const items: unknown[] = [];
  const result = await streamJsonArray(chunked(text, size), { onElement: (value) => void items.push(value), ...options });
  return { items, result };
}

const tricky = [
  { id: 1, text: 'brackets ] } [ { inside "quotes"', nested: { deep: [1, 2, { x: "}" }] } },
  { id: 2, text: "escaped \\\" quote and backslash \\\\", emoji: "🚀 ünïcödé — ✓" },
  { id: 3, list: [], empty: {} },
];

describe("streamJsonArray", () => {
  it.each([1, 3, 7, 64, 4096])("parses every element regardless of chunk size (%i bytes)", async (size) => {
    const { items, result } = await collect(JSON.stringify(tricky, null, 2), size);
    expect(items).toEqual(tricky);
    expect(result.elements).toBe(3);
  });

  it("skips the X archive JavaScript wrapper without evaluating it", async () => {
    const text = `window.YTD.tweets.part0 = ${JSON.stringify(tricky)};`;
    const { items } = await collect(text, 5, { allowPrefix: true });
    expect(items).toEqual(tricky);
  });

  it("rejects a non-array document unless a prefix is allowed", async () => {
    await expect(collect('{"not":"an array"}', 8)).rejects.toBeInstanceOf(ImportFormatError);
  });

  it("handles a UTF-8 byte-order mark", async () => {
    const { items } = await collect(`﻿${JSON.stringify([{ a: 1 }])}`, 2);
    expect(items).toEqual([{ a: 1 }]);
  });

  it("skips oversized elements instead of exhausting memory", async () => {
    const big = { blob: "x".repeat(5000) };
    const oversized: number[] = [];
    const { items, result } = await collect(JSON.stringify([{ a: 1 }, big, { b: 2 }]), 100, {
      maxElementBytes: 1000,
      onOversized: (index) => oversized.push(index),
    });
    expect(items).toEqual([{ a: 1 }, { b: 2 }]);
    expect(oversized).toEqual([1]);
    expect(result.oversized).toBe(1);
  });

  it("counts malformed elements and keeps going", async () => {
    const { items, result } = await collect('[{"a":1},{"b":tru},{"c":3}]', 4);
    expect(items).toEqual([{ a: 1 }, { c: 3 }]);
    expect(result.malformed).toBe(1);
  });

  it("supports scalar elements", async () => {
    const { items } = await collect('[1, "two", true, null, 3.5]', 2);
    expect(items).toEqual([1, "two", true, null, 3.5]);
  });

  it("reports an empty source", async () => {
    await expect(collect("   ", 2)).rejects.toThrow(/empty/i);
  });
});
