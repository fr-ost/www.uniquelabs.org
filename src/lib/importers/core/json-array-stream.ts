import { ImportFormatError } from "@/lib/importers/core/types";

/**
 * Streams the elements of a top-level JSON array, one at a time, without
 * loading the whole document into memory.
 *
 * - Scans raw bytes with a small state machine (JSON structural characters
 *   are ASCII, and UTF-8 continuation bytes are always ≥ 0x80, so byte-level
 *   scanning is safe for any UTF-8 input).
 * - Each complete element is parsed with the native JSON.parse.
 * - Elements larger than `maxElementBytes` are skipped (reported via
 *   `onOversized`) instead of exhausting memory.
 * - With `allowPrefix`, any bytes before the first "[" are ignored. This is
 *   how the X archive wrapper `window.YTD.tweets.part0 = [...]` is handled —
 *   the JavaScript is never evaluated.
 */

export interface JsonArrayStreamOptions {
  allowPrefix?: boolean;
  maxElementBytes?: number;
  onElement: (value: unknown, index: number) => void | Promise<void>;
  onOversized?: (index: number, bytes: number) => void;
  onMalformed?: (index: number, error: Error) => void;
  onBytes?: (bytes: number) => void;
}

const OPEN_BRACE = 0x7b;
const CLOSE_BRACE = 0x7d;
const OPEN_BRACKET = 0x5b;
const CLOSE_BRACKET = 0x5d;
const QUOTE = 0x22;
const BACKSLASH = 0x5c;
const COMMA = 0x2c;

function isWhitespace(byte: number) {
  return byte === 0x20 || byte === 0x0a || byte === 0x0d || byte === 0x09;
}

type State = "before" | "between" | "element" | "done";

export async function streamJsonArray(
  source: AsyncIterable<Buffer | Uint8Array | string>,
  options: JsonArrayStreamOptions,
): Promise<{ elements: number; oversized: number; malformed: number }> {
  const maxBytes = options.maxElementBytes ?? 64 * 1024 * 1024;
  let state: State = "before";
  let depth = 0;
  let inString = false;
  let escape = false;
  let scalar = false;
  let chunks: Buffer[] = [];
  let elementBytes = 0;
  let skipping = false;
  let index = 0;
  let oversized = 0;
  let malformed = 0;
  let sawBom = false;
  let prefixBytes = 0;

  const finishElement = async (tail: Buffer) => {
    if (skipping) {
      oversized += 1;
      options.onOversized?.(index, elementBytes);
    } else {
      chunks.push(tail);
      const text = Buffer.concat(chunks).toString("utf8");
      let value: unknown;
      let parsed = false;
      try {
        value = JSON.parse(text);
        parsed = true;
      } catch (error) {
        malformed += 1;
        options.onMalformed?.(index, error as Error);
      }
      if (parsed) await options.onElement(value, index);
    }
    index += 1;
    chunks = [];
    elementBytes = 0;
    skipping = false;
    scalar = false;
    state = "between";
  };

  for await (const raw of source) {
    const chunk = typeof raw === "string" ? Buffer.from(raw, "utf8") : Buffer.isBuffer(raw) ? raw : Buffer.from(raw);
    options.onBytes?.(chunk.length);
    let elementStart = state === "element" ? 0 : -1;

    for (let i = 0; i < chunk.length; i += 1) {
      const byte = chunk[i]!;

      if (state === "done") {
        if (!isWhitespace(byte) && byte !== 0x3b /* ; */) {
          // Trailing data after the array (e.g. a second wrapper) is ignored.
        }
        continue;
      }

      if (state === "before") {
        if (!sawBom && prefixBytes === 0 && byte === 0xef) {
          sawBom = true;
          continue;
        }
        if (sawBom && (byte === 0xbb || byte === 0xbf) && prefixBytes < 2) {
          prefixBytes += 1;
          continue;
        }
        if (byte === OPEN_BRACKET) {
          state = "between";
          continue;
        }
        if (isWhitespace(byte)) continue;
        if (options.allowPrefix) {
          prefixBytes += 1;
          if (prefixBytes > 4096) throw new ImportFormatError("Could not find the start of the data array.");
          continue;
        }
        throw new ImportFormatError("Expected a JSON array at the top level of the file.");
      }

      if (state === "between") {
        if (isWhitespace(byte) || byte === COMMA) continue;
        if (byte === CLOSE_BRACKET) {
          state = "done";
          continue;
        }
        state = "element";
        depth = 0;
        inString = false;
        escape = false;
        scalar = !(byte === OPEN_BRACE || byte === OPEN_BRACKET || byte === QUOTE);
        elementStart = i;
        // fall through to process this byte as part of the element
      }

      // state === "element"
      if (inString) {
        if (escape) escape = false;
        else if (byte === BACKSLASH) escape = true;
        else if (byte === QUOTE) {
          inString = false;
          if (depth === 0) {
            await finishElement(chunk.subarray(elementStart, i + 1));
            elementStart = -1;
          }
        }
        continue;
      }
      if (scalar) {
        if (byte === COMMA || byte === CLOSE_BRACKET || isWhitespace(byte)) {
          await finishElement(chunk.subarray(elementStart, i));
          elementStart = -1;
          if (byte === CLOSE_BRACKET) state = "done";
        }
        continue;
      }
      if (byte === QUOTE) inString = true;
      else if (byte === OPEN_BRACE || byte === OPEN_BRACKET) depth += 1;
      else if (byte === CLOSE_BRACE || byte === CLOSE_BRACKET) {
        depth -= 1;
        if (depth === 0) {
          await finishElement(chunk.subarray(elementStart, i + 1));
          elementStart = -1;
        }
      }
    }

    // Carry the unfinished element over to the next chunk.
    if (state === "element" && elementStart >= 0) {
      const piece = chunk.subarray(elementStart);
      elementBytes += piece.length;
      if (!skipping && elementBytes > maxBytes) {
        skipping = true;
        chunks = [];
      }
      if (!skipping) chunks.push(Buffer.from(piece));
    }
  }

  if (state === "before") throw new ImportFormatError("The file is empty or does not contain a JSON array.");
  if (state === "element") {
    malformed += 1;
    options.onMalformed?.(index, new Error("Unexpected end of file inside an element"));
  }
  return { elements: index, oversized, malformed };
}
