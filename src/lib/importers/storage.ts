import { createHash } from "node:crypto";
import { createWriteStream } from "node:fs";
import { mkdir, rm, stat } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { Readable, Transform } from "node:stream";
import { pipeline } from "node:stream/promises";

/**
 * Private, temporary storage for uploaded import files. Files live outside
 * the public directory, are named by the server (never by the client), and
 * are deleted as soon as processing finishes.
 */

export function importRoot(): string {
  const configured = process.env.IMPORT_TMP_DIR;
  return path.resolve(configured && configured.trim() ? configured : path.join(os.tmpdir(), "uniquelabs-imports"));
}

export function jobDir(jobId: string): string {
  if (!/^[a-z0-9]{10,40}$/.test(jobId)) throw new Error("Invalid job id");
  return path.join(importRoot(), jobId);
}

export function safeUploadName(name: string): string {
  const base = name.replace(/\\/g, "/").split("/").pop() ?? "upload";
  const cleaned = base.replace(/[^A-Za-z0-9._-]+/g, "_").replace(/^\.+/, "").slice(0, 120);
  return cleaned || "upload";
}

export class UploadTooLargeError extends Error {}

/**
 * Streams a request body to disk with a hard size limit, computing SHA-256 on
 * the fly. Nothing is buffered in memory.
 */
export async function saveUploadStream(
  body: ReadableStream<Uint8Array>,
  destination: string,
  maxBytes: number,
): Promise<{ size: number; sha256: string }> {
  await mkdir(path.dirname(destination), { recursive: true, mode: 0o700 });
  const hash = createHash("sha256");
  let size = 0;
  const meter = new Transform({
    transform(chunk: Buffer, _encoding, callback) {
      size += chunk.length;
      if (size > maxBytes) {
        callback(new UploadTooLargeError(`File exceeds the ${Math.round(maxBytes / 1024 / 1024)} MB limit.`));
        return;
      }
      hash.update(chunk);
      callback(null, chunk);
    },
  });
  try {
    await pipeline(Readable.fromWeb(body as never), meter, createWriteStream(destination, { mode: 0o600 }));
  } catch (error) {
    await rm(destination, { force: true }).catch(() => undefined);
    throw error;
  }
  return { size, sha256: hash.digest("hex") };
}

export async function removeJobFiles(jobId: string): Promise<void> {
  await rm(jobDir(jobId), { recursive: true, force: true }).catch(() => undefined);
}

export async function fileExists(file: string): Promise<boolean> {
  try {
    await stat(file);
    return true;
  } catch {
    return false;
  }
}
