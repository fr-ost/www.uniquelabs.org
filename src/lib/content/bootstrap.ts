import { prisma } from "@/lib/db";
import {
  DEFAULT_CATEGORIES,
  DEFAULT_COMPANY,
  DEFAULT_PRINCIPLES,
  DEFAULT_PRIVACY_POLICY,
  DEFAULT_SEO,
  DEFAULT_TEAM_GROUPS,
  DEFAULT_TERMS,
  SUGGESTED_CAPABILITIES,
} from "@/lib/content/defaults";
import { slugify } from "@/lib/utils";

/**
 * Idempotent baseline content, created only when missing.
 *
 * Contains nothing but copy from the owner's brief (positioning, hero,
 * philosophy), the proposed focus areas as DRAFTS, and empty taxonomy. It
 * never overwrites existing records, never creates people, products,
 * partners or milestones, and never creates an admin account.
 *
 * Runs on server start (src/instrumentation.ts) and via `npm run db:seed`.
 */
export async function ensureBaselineContent(): Promise<string[]> {
  const log: string[] = [];

  if (!(await prisma.companyProfile.findUnique({ where: { id: 1 }, select: { id: true } }))) {
    await prisma.companyProfile.create({ data: { id: 1, ...DEFAULT_COMPANY } });
    log.push("Created the company profile from the brief.");
  }

  if (!(await prisma.siteSettings.findUnique({ where: { id: 1 }, select: { id: true } }))) {
    const today = new Date(new Date().toISOString().slice(0, 10));
    await prisma.siteSettings.create({
      data: { id: 1, ...DEFAULT_SEO, privacyPolicy: DEFAULT_PRIVACY_POLICY, privacyUpdatedAt: today, termsOfUse: DEFAULT_TERMS, termsUpdatedAt: today },
    });
    log.push("Created site settings and the privacy policy / terms templates.");
  }

  if ((await prisma.principle.count()) === 0) {
    await prisma.principle.createMany({
      data: DEFAULT_PRINCIPLES.map((principle, index) => ({ ...principle, status: "PUBLISHED" as const, sortOrder: index })),
    });
    log.push(`Created ${DEFAULT_PRINCIPLES.length} philosophy principles.`);
  }

  if ((await prisma.capability.count()) === 0) {
    await prisma.capability.createMany({
      data: SUGGESTED_CAPABILITIES.map((capability, index) => ({
        ...capability,
        slug: slugify(capability.title),
        status: "DRAFT" as const,
        sortOrder: index,
      })),
    });
    log.push(`Created ${SUGGESTED_CAPABILITIES.length} suggested focus areas as drafts (review them in Admin → What We Do).`);
  }

  for (const [index, category] of DEFAULT_CATEGORIES.entries()) {
    if (!(await prisma.category.findUnique({ where: { slug: category.slug }, select: { id: true } }))) {
      await prisma.category.create({ data: { ...category, sortOrder: index } });
      log.push(`Created product category “${category.name}”.`);
    }
  }

  for (const [index, group] of DEFAULT_TEAM_GROUPS.entries()) {
    if (!(await prisma.teamGroup.findUnique({ where: { slug: group.slug }, select: { id: true } }))) {
      await prisma.teamGroup.create({ data: { ...group, sortOrder: index } });
    }
  }

  return log;
}
