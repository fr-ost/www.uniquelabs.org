import "server-only";
import { unstable_cache } from "next/cache";
import { draftMode } from "next/headers";
import { cache } from "react";
import { getSession } from "@/lib/auth/session";
import * as q from "@/lib/content/queries";
import { CACHE_TAGS, type CacheTag } from "@/lib/content/tags";
import type { Platform, ReleaseStage } from "@/generated/prisma/enums";

/**
 * Cached public data access. Results are stored in Next's data cache and
 * invalidated on every admin mutation (see src/server/revalidate.ts), with a
 * 10-minute time-based safety net for multi-instance deployments.
 *
 * Wrapped in React `cache()` as well so a single render never queries twice.
 */
function cached<A extends unknown[], R>(
  fn: (...args: A) => Promise<R>,
  key: string,
  tags: CacheTag[],
): (...args: A) => Promise<R> {
  // In development, always read fresh data (seeds and manual DB edits
  // bypass the app's cache invalidation).
  if (process.env.NODE_ENV === "development" || process.env.DISABLE_DATA_CACHE === "true") {
    return cache(fn);
  }
  const wrapped = unstable_cache(fn, [`public:${key}`], {
    tags: [...tags, CACHE_TAGS.public],
    revalidate: 600,
  });
  return cache(wrapped);
}

export const getCompany = cached(q.loadCompany, "company", [CACHE_TAGS.company]);
export const getSettings = cached(q.loadSettings, "settings", [CACHE_TAGS.settings]);
export const getPrinciples = cached(q.loadPrinciples, "principles", [CACHE_TAGS.principles]);
export const getSocialLinks = cached(q.loadSocialLinks, "social", [CACHE_TAGS.social]);
export const getCapabilities = cached(q.loadCapabilities, "capabilities", [
  CACHE_TAGS.capabilities,
  CACHE_TAGS.products,
]);

const getProductsCached = cached(
  (category: string, platform: string, stage: string) =>
    q.loadProducts({
      category: category || undefined,
      platform: (platform || undefined) as Platform | undefined,
      stage: (stage || undefined) as ReleaseStage | undefined,
    }),
  "products",
  [CACHE_TAGS.products],
);

export function getProducts(filter: q.ProductFilter = {}) {
  return getProductsCached(filter.category ?? "", filter.platform ?? "", filter.stage ?? "");
}

export const getFeaturedProducts = cached(q.loadFeaturedProducts, "products:featured", [CACHE_TAGS.products]);
export const getProductCategories = cached(q.loadProductCategories, "products:categories", [CACHE_TAGS.products]);
export const getProductPlatforms = cached(q.loadProductPlatforms, "products:platforms", [CACHE_TAGS.products]);
const getProductCached = cached((slug: string) => q.loadProduct(slug, false), "product", [
  CACHE_TAGS.products,
  CACHE_TAGS.milestones,
  CACHE_TAGS.collaborations,
  CACHE_TAGS.capabilities,
]);

export const getCollaborations = cached(q.loadCollaborations, "collaborations", [CACHE_TAGS.collaborations]);
export const getFeaturedCollaborations = cached(q.loadFeaturedCollaborations, "collaborations:featured", [
  CACHE_TAGS.collaborations,
]);
export const getPartners = cached(q.loadPartners, "partners", [CACHE_TAGS.collaborations]);
const getCollaborationCached = cached((slug: string) => q.loadCollaboration(slug, false), "collaboration", [
  CACHE_TAGS.collaborations,
  CACHE_TAGS.products,
]);

export const getTeam = cached(q.loadTeam, "team", [CACHE_TAGS.team]);
export const getTeamPreview = cached(q.loadTeamPreview, "team:preview", [CACHE_TAGS.team]);
const getTeamMemberCached = cached((slug: string) => q.loadTeamMember(slug, false), "team:member", [
  CACHE_TAGS.team,
]);

export const getMilestones = cached(q.loadMilestones, "milestones", [
  CACHE_TAGS.milestones,
  CACHE_TAGS.products,
  CACHE_TAGS.collaborations,
]);
export const getRecentMilestones = cached(q.loadRecentMilestones, "milestones:recent", [
  CACHE_TAGS.milestones,
  CACHE_TAGS.products,
  CACHE_TAGS.collaborations,
]);

export const getPlaceholderCount = cached(q.loadPlaceholderCount, "placeholders", [
  CACHE_TAGS.products,
  CACHE_TAGS.collaborations,
  CACHE_TAGS.team,
  CACHE_TAGS.milestones,
  CACHE_TAGS.capabilities,
]);

export const getSitemapEntries = cached(q.loadSitemapEntries, "sitemap", [
  CACHE_TAGS.products,
  CACHE_TAGS.collaborations,
  CACHE_TAGS.team,
]);

/**
 * Draft preview is only active when Draft Mode is enabled AND the request
 * carries a valid admin session. A leaked preview cookie alone shows nothing.
 */
export const isPreviewRequest = cache(async (): Promise<boolean> => {
  const draft = await draftMode();
  if (!draft.isEnabled) return false;
  const session = await getSession();
  return session !== null;
});

export async function getProduct(slug: string) {
  if (await isPreviewRequest()) return q.loadProduct(slug, true);
  return getProductCached(slug);
}

export async function getCollaboration(slug: string) {
  if (await isPreviewRequest()) return q.loadCollaboration(slug, true);
  return getCollaborationCached(slug);
}

export async function getTeamMember(slug: string) {
  if (await isPreviewRequest()) return q.loadTeamMember(slug, true);
  return getTeamMemberCached(slug);
}
