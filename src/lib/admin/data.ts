import "server-only";
import { mediaUrl } from "@/lib/media/storage";
import type { PickedMedia } from "@/components/admin/media-field";

/** Prisma select for media shown in admin pickers. */
export const adminMediaSelect = {
  id: true,
  fileName: true,
  alt: true,
  mimeType: true,
  width: true,
  height: true,
} as const;

export function toPicked(
  asset: { id: string; fileName: string; alt: string; mimeType: string; width: number | null; height: number | null } | null | undefined,
): PickedMedia | null {
  if (!asset) return null;
  return {
    id: asset.id,
    url: mediaUrl(asset),
    alt: asset.alt,
    mimeType: asset.mimeType,
    width: asset.width,
    height: asset.height,
    fileName: asset.fileName,
  };
}

export function toDateInputValue(value: Date | null | undefined): string {
  return value ? value.toISOString().slice(0, 10) : "";
}

export function enumOptions<T extends string>(labels: Record<T, string>) {
  return (Object.entries(labels) as Array<[T, string]>).map(([value, label]) => ({ value, label }));
}
