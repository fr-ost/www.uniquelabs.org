/**
 * Baseline seed — safe to run in every environment, any number of times.
 *
 * Creates only content supplied in the owner's brief (positioning, hero copy,
 * philosophy, proposed focus areas as DRAFTS, taxonomy). It never overwrites
 * records that already exist, never creates people, products, partners or
 * milestones, and never creates an admin account (see docs/ADMIN.md).
 */
import { prisma } from "../src/lib/db.ts";
import {
  DEFAULT_CATEGORIES,
  DEFAULT_COMPANY,
  DEFAULT_PRINCIPLES,
  DEFAULT_PRIVACY_POLICY,
  DEFAULT_SEO,
  DEFAULT_TEAM_GROUPS,
  DEFAULT_TERMS,
  SUGGESTED_CAPABILITIES,
} from "../src/lib/content/defaults.ts";
import { slugify } from "../src/lib/utils/index.ts";

async function main() {
  const log: string[] = [];

  const company = await prisma.companyProfile.findUnique({ where: { id: 1 } });
  if (!company) {
    await prisma.companyProfile.create({ data: { id: 1, ...DEFAULT_COMPANY } });
    log.push("Created company profile from the brief.");
  }

  const settings = await prisma.siteSettings.findUnique({ where: { id: 1 } });
  if (!settings) {
    const today = new Date(new Date().toISOString().slice(0, 10));
    await prisma.siteSettings.create({
      data: {
        id: 1,
        ...DEFAULT_SEO,
        privacyPolicy: DEFAULT_PRIVACY_POLICY,
        privacyUpdatedAt: today,
        termsOfUse: DEFAULT_TERMS,
        termsUpdatedAt: today,
      },
    });
    log.push("Created site settings, privacy policy and terms templates.");
  }

  if ((await prisma.principle.count()) === 0) {
    await prisma.principle.createMany({
      data: DEFAULT_PRINCIPLES.map((principle, index) => ({
        ...principle,
        status: "PUBLISHED" as const,
        sortOrder: index,
      })),
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
    log.push(
      `Created ${SUGGESTED_CAPABILITIES.length} suggested focus areas as DRAFTS — review and publish them in Admin → What We Do.`,
    );
  }

  for (const [index, category] of DEFAULT_CATEGORIES.entries()) {
    const exists = await prisma.category.findUnique({ where: { slug: category.slug } });
    if (!exists) {
      await prisma.category.create({ data: { ...category, sortOrder: index } });
      log.push(`Created product category "${category.name}".`);
    }
  }

  for (const [index, group] of DEFAULT_TEAM_GROUPS.entries()) {
    await prisma.teamGroup.upsert({
      where: { slug: group.slug },
      update: {},
      create: { ...group, sortOrder: index },
    });
  }

  const admins = await prisma.adminUser.count();
  console.log(log.length > 0 ? log.map((line) => `• ${line}`).join("\n") : "• Baseline content already present — nothing changed.");
  if (admins === 0) {
    console.log(
      "\nNo admin account exists yet. Create the first one with `npm run admin:create`,\n" +
        "or set ADMIN_SETUP_TOKEN and open /admin/setup. See docs/ADMIN.md.",
    );
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
