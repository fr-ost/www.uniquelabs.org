import { open as openFile } from "node:fs/promises";
import { createReadStream } from "node:fs";
import type { Readable } from "node:stream";
import yauzl from "yauzl";
import { ImportFormatError, type UploadedFile } from "@/lib/importers/core/types";

/**
 * Safe access to uploaded files and ZIP archives.
 *
 * Archives are never extracted to disk: matching entries are streamed
 * straight into the parser, so path traversal is impossible by design.
 * Defences against hostile archives:
 * - entry names are validated (absolute paths, "..", NUL, drive letters)
 * - limits on entry count, per-entry and total uncompressed size
 * - compression-ratio check against decompression bombs
 * - yauzl verifies the actual inflated size never exceeds the declared size
 * - encrypted entries are skipped
 */

export const ARCHIVE_LIMITS = {
  maxEntries: 250_000,
  maxEntryBytes: 4 * 1024 * 1024 * 1024,
  maxTotalReadBytes: 12 * 1024 * 1024 * 1024,
  maxCompressionRatio: 250,
  ratioCheckMinBytes: 64 * 1024 * 1024,
};

export interface SourceEntry {
  /** Display name: file name, or "archive.zip › data/tweets.js". */
  label: string;
  /** Path inside the archive (or the original file name). */
  path: string;
  size: number;
  open: () => Promise<Readable>;
}

export async function isZipFile(path: string): Promise<boolean> {
  const handle = await openFile(path, "r");
  try {
    const buffer = Buffer.alloc(4);
    const { bytesRead } = await handle.read(buffer, 0, 4, 0);
    if (bytesRead < 4) return false;
    return buffer[0] === 0x50 && buffer[1] === 0x4b && (buffer[2] === 0x03 || buffer[2] === 0x05) && (buffer[3] === 0x04 || buffer[3] === 0x06);
  } finally {
    await handle.close();
  }
}

export function isSafeEntryName(name: string): boolean {
  if (!name || name.length > 1024) return false;
  if (name.includes("\u0000")) return false;
  const normalised = name.replace(/\\/g, "/");
  if (normalised.startsWith("/") || /^[a-zA-Z]:/.test(normalised)) return false;
  return !normalised.split("/").some((part) => part === "..");
}

function openZip(path: string): Promise<yauzl.ZipFile> {
  return new Promise((resolve, reject) => {
    yauzl.open(
      path,
      { lazyEntries: true, autoClose: false, validateEntrySizes: true, strictFileNames: false, decodeStrings: true },
      (error, zipfile) => {
        if (error || !zipfile) reject(new ImportFormatError(`Could not read the ZIP archive: ${error?.message ?? "unknown error"}`));
        else resolve(zipfile);
      },
    );
  });
}

/**
 * Lists archive entries whose path matches `wanted`, validating every entry
 * against the safety limits. The returned entries can be opened later (the
 * archive stays open until `close` is called).
 */
export async function scanArchive(
  file: UploadedFile,
  wanted: (path: string) => boolean,
  warn: (message: string) => void,
): Promise<{ entries: SourceEntry[]; close: () => void; totalEntries: number }> {
  const zip = await openZip(file.path);
  const entries: SourceEntry[] = [];
  let count = 0;
  let totalWanted = 0;

  await new Promise<void>((resolve, reject) => {
    zip.on("error", (error: Error) => reject(new ImportFormatError(`Malformed ZIP archive: ${error.message}`)));
    zip.on("end", () => resolve());
    zip.on("entry", (entry: yauzl.Entry) => {
      count += 1;
      if (count > ARCHIVE_LIMITS.maxEntries) {
        reject(new ImportFormatError(`The archive contains more than ${ARCHIVE_LIMITS.maxEntries.toLocaleString()} files.`));
        return;
      }
      const name = entry.fileName;
      if (!isSafeEntryName(name)) {
        reject(new ImportFormatError(`The archive contains an unsafe file path (${name.slice(0, 120)}).`));
        return;
      }
      const isDirectory = name.endsWith("/");
      if (!isDirectory && wanted(name)) {
        if (entry.isEncrypted()) {
          warn(`Skipped encrypted entry ${name}.`);
        } else if (entry.uncompressedSize > ARCHIVE_LIMITS.maxEntryBytes) {
          reject(new ImportFormatError(`${name} is larger than the ${Math.round(ARCHIVE_LIMITS.maxEntryBytes / 1024 ** 3)} GB limit.`));
          return;
        } else if (
          entry.uncompressedSize > ARCHIVE_LIMITS.ratioCheckMinBytes &&
          entry.compressedSize > 0 &&
          entry.uncompressedSize / entry.compressedSize > ARCHIVE_LIMITS.maxCompressionRatio
        ) {
          reject(new ImportFormatError(`${name} has a suspicious compression ratio and was rejected (possible decompression bomb).`));
          return;
        } else {
          totalWanted += entry.uncompressedSize;
          if (totalWanted > ARCHIVE_LIMITS.maxTotalReadBytes) {
            reject(new ImportFormatError("The archive's data files exceed the total size limit."));
            return;
          }
          entries.push({
            label: `${file.name} › ${name}`,
            path: name,
            size: entry.uncompressedSize,
            open: () =>
              new Promise<Readable>((res, rej) => {
                zip.openReadStream(entry, (error, stream) => {
                  if (error || !stream) rej(new ImportFormatError(`Could not read ${name}: ${error?.message ?? "unknown error"}`));
                  else res(stream);
                });
              }),
          });
        }
      }
      zip.readEntry();
    });
    zip.readEntry();
  });

  return { entries, close: () => zip.close(), totalEntries: count };
}

/** A plain (non-archive) uploaded file as a source entry. */
export function plainFileEntry(file: UploadedFile): SourceEntry {
  return {
    label: file.name,
    path: file.name,
    size: file.size,
    open: async () => createReadStream(file.path, { highWaterMark: 256 * 1024 }),
  };
}

export function baseName(path: string): string {
  return path.replace(/\\/g, "/").split("/").pop() ?? path;
}

/** Reads a (small) stream fully into a string with a size cap. */
export async function readStreamText(stream: Readable, maxBytes: number): Promise<string> {
  const chunks: Buffer[] = [];
  let total = 0;
  for await (const chunk of stream) {
    const buffer = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk as string);
    total += buffer.length;
    if (total > maxBytes) {
      stream.destroy();
      throw new ImportFormatError(`File is larger than ${Math.round(maxBytes / 1024 / 1024)} MB.`);
    }
    chunks.push(buffer);
  }
  return Buffer.concat(chunks).toString("utf8");
}
