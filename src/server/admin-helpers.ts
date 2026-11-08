import "server-only";
import { revalidatePath, updateTag } from "next/cache";
import { Prisma } from "@/generated/prisma/client";
import { CACHE_TAGS } from "@/lib/content/tags";
import { uniqueSlug } from "@/lib/utils";
import type { ActionResult } from "@/lib/validation/fields";

/**
 * Invalidate all cached public content (read-your-own-writes) and refresh
 * admin views. Called after every successful admin mutation.
 */
export function refreshPublic(adminPath?: string) {
  updateTag(CACHE_TAGS.public);
  revalidatePath("/admin", "layout");
  if (adminPath) revalidatePath(adminPath);
}

/** Resolve a unique slug from an explicit slug or a fallback title. */
export function resolveSlug(
  explicit: string | null,
  fallback: string,
  exists: (slug: string) => Promise<boolean>,
): Promise<string> {
  return uniqueSlug(explicit ?? fallback, exists);
}

/** Move an item up/down in an ordered list, renumbering sortOrder densely. */
export async function reorder(
  items: Array<{ id: string; sortOrder: number }>,
  id: string,
  direction: "up" | "down",
  save: (id: string, sortOrder: number) => Prisma.PrismaPromise<unknown>,
  transaction: (ops: Prisma.PrismaPromise<unknown>[]) => Promise<unknown>,
): Promise<void> {
  const index = items.findIndex((item) => item.id === id);
  const target = direction === "up" ? index - 1 : index + 1;
  if (index < 0 || target < 0 || target >= items.length) return;
  const next = [...items];
  [next[index], next[target]] = [next[target]!, next[index]!];
  const ops = next.flatMap((item, position) => (item.sortOrder === position ? [] : [save(item.id, position)]));
  if (ops.length) await transaction(ops);
}

/** Translates database errors into friendly form messages. */
export function prismaErrorResult(error: unknown, context = "record"): ActionResult {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === "P2002") {
      const target = Array.isArray(error.meta?.target) ? (error.meta.target as string[]).join(", ") : "value";
      return { ok: false, message: `Another ${context} already uses this ${target}.`, fieldErrors: target.includes("slug") ? { slug: "Already in use." } : undefined };
    }
    if (error.code === "P2003") return { ok: false, message: "A linked item (image, category or relation) no longer exists. Re-select it and save again." };
    if (error.code === "P2025") return { ok: false, message: `This ${context} no longer exists.` };
  }
  const text = error instanceof Error ? error.message : String(error);
  if (text.includes("published_requires_verification")) {
    return { ok: false, message: "Only verified records can be published. Tick “Verified by owner” first." };
  }
  console.error(`[admin] failed to save ${context}`, error);
  return { ok: false, message: `Could not save this ${context}. Please try again.` };
}
