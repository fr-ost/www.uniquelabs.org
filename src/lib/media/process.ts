import sharp, { type Metadata as SharpMetadata } from "sharp";

/**
 * Image validation & normalisation for uploads.
 *
 * - The real format is detected from the bytes (never from the filename or
 *   the client-supplied MIME type).
 * - Raster images are auto-oriented, resized to a sane maximum and re-encoded
 *   to WebP. Re-encoding strips EXIF/GPS metadata and neutralises polyglots.
 * - SVG is accepted only if it contains no scripting or external references,
 *   and is served with a sandboxing CSP (see the /media route).
 */

export const MAX_IMAGE_DIMENSION = 2560;
const MAX_INPUT_PIXELS = 50_000_000;
const MAX_SVG_BYTES = 1024 * 1024;

export interface ProcessedImage {
  data: Buffer;
  mimeType: string;
  extension: string;
  width: number | null;
  height: number | null;
}

export class MediaValidationError extends Error {}

const RASTER_FORMATS = new Set(["jpeg", "png", "webp", "avif", "gif", "tiff"]);

export function looksLikeSvg(buffer: Buffer): boolean {
  const head = buffer.subarray(0, 1024).toString("utf8").replace(/^﻿/, "").trimStart();
  return /^(<\?xml[^>]*>\s*)?(<!--[\s\S]*?-->\s*)*<svg[\s>]/i.test(head);
}

const SVG_DENYLIST: Array<[RegExp, string]> = [
  [/<script[\s>/]/i, "script elements"],
  [/\son[a-z]+\s*=/i, "event handler attributes"],
  [/javascript\s*:/i, "javascript: URLs"],
  [/<foreignObject[\s>/]/i, "foreignObject"],
  [/<(iframe|embed|object|audio|video|canvas|image|feImage)[\s>/]/i, "embedded content"],
  [/<!ENTITY/i, "XML entities"],
  [/<!DOCTYPE/i, "DOCTYPE declarations"],
  [/@import/i, "CSS imports"],
  [/data:\s*text\/html/i, "embedded HTML"],
];

/** Only same-document fragment references (#id) are allowed. */
function hasExternalReference(source: string): boolean {
  const hrefPattern = /\b(?:xlink:)?href\s*=\s*(["'])(.*?)\1/gi;
  for (const match of source.matchAll(hrefPattern)) {
    if (!(match[2] ?? "").trim().startsWith("#")) return true;
  }
  const urlPattern = /url\(\s*(["']?)(.*?)\1\s*\)/gi;
  for (const match of source.matchAll(urlPattern)) {
    if (!(match[2] ?? "").trim().startsWith("#")) return true;
  }
  return false;
}

export function svgProblem(source: string): string | null {
  for (const [pattern, label] of SVG_DENYLIST) {
    if (pattern.test(source)) {
      return `SVG contains ${label}, which is not allowed. Export a plain SVG or upload a PNG instead.`;
    }
  }
  if (hasExternalReference(source)) {
    return "SVG references external resources, which is not allowed. Export a plain SVG or upload a PNG instead.";
  }
  return null;
}

export async function processImage(input: Buffer): Promise<ProcessedImage> {
  if (input.length === 0) throw new MediaValidationError("The file is empty.");

  if (looksLikeSvg(input)) {
    if (input.length > MAX_SVG_BYTES) {
      throw new MediaValidationError("SVG files must be smaller than 1 MB.");
    }
    const source = input.toString("utf8");
    const problem = svgProblem(source);
    if (problem) throw new MediaValidationError(problem);
    let width: number | null = null;
    let height: number | null = null;
    try {
      const meta = await sharp(input, { limitInputPixels: MAX_INPUT_PIXELS }).metadata();
      width = meta.width ?? null;
      height = meta.height ?? null;
    } catch {
      throw new MediaValidationError("The SVG could not be parsed.");
    }
    return { data: input, mimeType: "image/svg+xml", extension: "svg", width, height };
  }

  let metadata: SharpMetadata;
  try {
    metadata = await sharp(input, { limitInputPixels: MAX_INPUT_PIXELS }).metadata();
  } catch {
    throw new MediaValidationError("Unsupported or corrupted image. Use JPEG, PNG, WebP, AVIF or GIF.");
  }
  if (!metadata.format || !RASTER_FORMATS.has(metadata.format)) {
    throw new MediaValidationError("Unsupported image format. Use JPEG, PNG, WebP, AVIF or GIF.");
  }

  const animated = (metadata.pages ?? 1) > 1 && (metadata.format === "gif" || metadata.format === "webp");
  const pipeline = sharp(input, { limitInputPixels: MAX_INPUT_PIXELS, animated })
    .rotate()
    .resize({
      width: MAX_IMAGE_DIMENSION,
      height: MAX_IMAGE_DIMENSION,
      fit: "inside",
      withoutEnlargement: true,
    });

  const output =
    metadata.format === "png"
      ? pipeline.webp({ quality: 92, nearLossless: true, effort: 5 })
      : pipeline.webp({ quality: 86, effort: 5 });

  const { data, info } = await output.toBuffer({ resolveWithObject: true });
  return {
    data,
    mimeType: "image/webp",
    extension: "webp",
    width: info.width ?? null,
    height: animated ? (info.pageHeight ?? info.height ?? null) : (info.height ?? null),
  };
}

/** Normalises an uploaded filename for display and URLs. */
export function cleanFileName(name: string, extension: string): string {
  const base = name
    .replace(/\\/g, "/")
    .split("/")
    .pop()!
    .replace(/\.[a-z0-9]{1,5}$/i, "")
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-zA-Z0-9._-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
  return `${base || "image"}.${extension}`;
}
