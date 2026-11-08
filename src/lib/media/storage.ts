import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { prisma } from "@/lib/db";
import { env } from "@/lib/env";
import { randomToken, sha256Hex } from "@/lib/security";
import { cleanFileName, processImage } from "@/lib/media/process";
import type { MediaAsset } from "@/generated/prisma/client";

/**
 * Media storage with two interchangeable drivers:
 * - "database" (default): bytes live in PostgreSQL. Works on any host,
 *   including containers with ephemeral disks, and is covered by DB backups.
 * - "filesystem": bytes live under MEDIA_DIR on a persistent volume.
 */

function mediaRoot(): string {
  return path.resolve(process.cwd(), env().MEDIA_DIR);
}

function fsKey(sha256: string, extension: string): string {
  return path.posix.join(sha256.slice(0, 2), `${sha256}.${extension}`);
}

function resolveFsKey(key: string): string {
  const root = mediaRoot();
  const resolved = path.resolve(root, key);
  if (!resolved.startsWith(root + path.sep)) {
    throw new Error("Invalid media storage key");
  }
  return resolved;
}

export interface StoreMediaInput {
  buffer: Buffer;
  originalName: string;
  alt?: string;
  uploadedById?: string | null;
}

export async function storeMedia(input: StoreMediaInput): Promise<{ asset: MediaAsset; deduplicated: boolean }> {
  const processed = await processImage(input.buffer);
  const sha256 = sha256Hex(processed.data);

  const existing = await prisma.mediaAsset.findUnique({ where: { sha256 } });
  if (existing) return { asset: existing, deduplicated: true };

  const driver = env().MEDIA_STORAGE;
  const fileName = cleanFileName(input.originalName, processed.extension);
  // Unguessable identifier: media URLs are public but not enumerable.
  const id = randomToken(18);

  if (driver === "filesystem") {
    const key = fsKey(sha256, processed.extension);
    const target = resolveFsKey(key);
    await mkdir(path.dirname(target), { recursive: true });
    await writeFile(target, processed.data, { mode: 0o640 });
    const asset = await prisma.mediaAsset.create({
      data: {
        id,
        fileName,
        mimeType: processed.mimeType,
        size: processed.data.length,
        width: processed.width,
        height: processed.height,
        alt: input.alt?.slice(0, 300) ?? "",
        sha256,
        storage: "FILESYSTEM",
        storageKey: key,
        uploadedById: input.uploadedById ?? null,
      },
    });
    return { asset, deduplicated: false };
  }

  const asset = await prisma.mediaAsset.create({
    data: {
      id,
      fileName,
      mimeType: processed.mimeType,
      size: processed.data.length,
      width: processed.width,
      height: processed.height,
      alt: input.alt?.slice(0, 300) ?? "",
      sha256,
      storage: "DATABASE",
      uploadedById: input.uploadedById ?? null,
      blob: { create: { data: new Uint8Array(processed.data) } },
    },
  });
  return { asset, deduplicated: false };
}

export async function readMediaBytes(asset: Pick<MediaAsset, "id" | "storage" | "storageKey">): Promise<Buffer | null> {
  if (asset.storage === "FILESYSTEM") {
    if (!asset.storageKey) return null;
    try {
      return await readFile(resolveFsKey(asset.storageKey));
    } catch {
      return null;
    }
  }
  const blob = await prisma.mediaBlob.findUnique({ where: { assetId: asset.id } });
  return blob ? Buffer.from(blob.data) : null;
}

export async function deleteMediaAsset(id: string): Promise<void> {
  const asset = await prisma.mediaAsset.findUnique({ where: { id } });
  if (!asset) return;
  await prisma.mediaAsset.delete({ where: { id } });
  if (asset.storage === "FILESYSTEM" && asset.storageKey) {
    await rm(resolveFsKey(asset.storageKey), { force: true }).catch(() => undefined);
  }
}

/** Number of places a media asset is referenced (used before deletion). */
export async function mediaUsageCount(id: string): Promise<number> {
  const [company, settings, logos, covers, images, partners, collabs, team, milestones] = await Promise.all([
    prisma.companyProfile.count({ where: { logoId: id } }),
    prisma.siteSettings.count({ where: { ogImageId: id } }),
    prisma.product.count({ where: { logoId: id } }),
    prisma.product.count({ where: { coverId: id } }),
    prisma.productImage.count({ where: { mediaId: id } }),
    prisma.partner.count({ where: { logoId: id } }),
    prisma.collaboration.count({ where: { coverId: id } }),
    prisma.teamMember.count({ where: { photoId: id } }),
    prisma.companyMilestone.count({ where: { imageId: id } }),
  ]);
  return company + settings + logos + covers + images + partners + collabs + team + milestones;
}

export function mediaUrl(asset: Pick<MediaAsset, "id" | "fileName">): string {
  return `/media/${asset.id}/${encodeURIComponent(asset.fileName)}`;
}
