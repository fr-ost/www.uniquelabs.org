/**
 * DEVELOPMENT-ONLY sample content.
 *
 *   npm run db:seed:demo            # create sample records
 *   npm run db:seed:demo -- --clear # delete every sample record
 *
 * Every record is flagged `isPlaceholder = true`, carries "Sample" in its
 * name, and is excluded from public queries on production deployments (see
 * placeholdersVisible() in src/lib/env.ts). The script refuses to run when
 * NODE_ENV=production or when SITE_URL is not a localhost address.
 */
import sharp from "sharp";
import { prisma } from "../src/lib/db.ts";
import { storeMedia } from "../src/lib/media/storage.ts";

function assertDevelopment() {
  const site = process.env.SITE_URL ?? "";
  let host = "";
  try {
    host = new URL(site).hostname;
  } catch {
    host = "";
  }
  if (process.env.NODE_ENV === "production" || !["localhost", "127.0.0.1"].includes(host)) {
    console.error(
      "Refusing to seed sample content: this script only runs in development with SITE_URL on localhost.",
    );
    process.exit(1);
  }
}

async function clear() {
  const where = { isPlaceholder: true };
  const products = await prisma.product.deleteMany({ where });
  const collaborations = await prisma.collaboration.deleteMany({ where });
  const team = await prisma.teamMember.deleteMany({ where });
  const milestones = await prisma.companyMilestone.deleteMany({ where });
  const capabilities = await prisma.capability.deleteMany({ where });
  await prisma.partner.deleteMany({ where: { slug: { startsWith: "sample-" } } });
  console.log(
    `Removed sample content: ${products.count} products, ${collaborations.count} collaborations, ` +
      `${team.count} team members, ${milestones.count} milestones, ${capabilities.count} capabilities.`,
  );
}

async function makeImage(svg: string, name: string) {
  const png = await sharp(Buffer.from(svg)).png().toBuffer();
  const { asset } = await storeMedia({ buffer: png, originalName: name, alt: `${name.replace(/\.\w+$/, "")} (sample image)` });
  return asset.id;
}

function logoSvg(color: string, shape: "circle" | "square" | "ring" | "bars") {
  const inner =
    shape === "circle"
      ? `<circle cx="128" cy="128" r="58" fill="${color}"/>`
      : shape === "square"
        ? `<rect x="74" y="74" width="108" height="108" rx="26" fill="${color}"/>`
        : shape === "ring"
          ? `<circle cx="128" cy="128" r="56" fill="none" stroke="${color}" stroke-width="26"/>`
          : `<rect x="70" y="84" width="116" height="22" rx="11" fill="${color}"/><rect x="70" y="117" width="84" height="22" rx="11" fill="${color}" opacity=".75"/><rect x="70" y="150" width="56" height="22" rx="11" fill="${color}" opacity=".5"/>`;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="256" height="256"><rect width="256" height="256" rx="56" fill="#16161b"/>${inner}</svg>`;
}

function coverSvg(color: string, title: string) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1600" height="900">
  <defs><radialGradient id="g" cx="75%" cy="20%" r="80%"><stop offset="0%" stop-color="${color}" stop-opacity=".55"/><stop offset="100%" stop-color="#0d0d10" stop-opacity="0"/></radialGradient></defs>
  <rect width="1600" height="900" fill="#111115"/><rect width="1600" height="900" fill="url(#g)"/>
  <rect x="180" y="150" width="1240" height="700" rx="28" fill="#1b1b21" stroke="#2b2b33"/>
  <rect x="180" y="150" width="1240" height="64" rx="28" fill="#202027"/>
  <circle cx="230" cy="182" r="9" fill="#3a3a44"/><circle cx="262" cy="182" r="9" fill="#3a3a44"/><circle cx="294" cy="182" r="9" fill="#3a3a44"/>
  <rect x="260" y="290" width="520" height="40" rx="10" fill="#2c2c35"/>
  <rect x="260" y="356" width="760" height="22" rx="8" fill="#24242b"/><rect x="260" y="396" width="680" height="22" rx="8" fill="#24242b"/>
  <rect x="260" y="480" width="300" height="250" rx="18" fill="${color}" opacity=".85"/>
  <rect x="590" y="480" width="300" height="250" rx="18" fill="#26262e"/><rect x="920" y="480" width="300" height="250" rx="18" fill="#26262e"/>
  <text x="1380" y="820" font-family="monospace" font-size="22" fill="#6e6e79" text-anchor="end">SAMPLE · ${title}</text>
</svg>`;
}

async function seed() {
  const existing = await prisma.product.count({ where: { isPlaceholder: true } });
  if (existing > 0) {
    console.log("Sample content already exists. Run with --clear first to recreate it.");
    return;
  }
  const now = new Date();
  const category = async (slug: string) => (await prisma.category.findUnique({ where: { slug } }))?.id ?? null;

  const products = [
    {
      name: "Sample — Focus Tabs",
      slug: "sample-focus-tabs",
      tagline: "Calm, organised browsing.",
      summary: "Groups open tabs into tidy sessions so you can pick up exactly where you left off — processed entirely on your device.",
      platforms: ["CHROME_EXTENSION", "EDGE_ADDON"] as const,
      stage: "AVAILABLE" as const,
      pricing: "FREE" as const,
      categorySlug: "browser-extensions",
      color: "#ff6b35",
      shape: "bars" as const,
      featured: true,
    },
    {
      name: "Sample — Clean Reader",
      slug: "sample-clean-reader",
      tagline: "Read the article, not the clutter.",
      summary: "A distraction-free reading view with adjustable typography and offline-friendly saving.",
      platforms: ["CHROME_EXTENSION"] as const,
      stage: "BETA" as const,
      pricing: "FREE" as const,
      categorySlug: "productivity",
      color: "#74d9b6",
      shape: "square" as const,
      featured: true,
    },
    {
      name: "Sample — Page Snapshot",
      slug: "sample-page-snapshot",
      tagline: null,
      summary: "Capture full pages, regions or visible areas and annotate them before sharing.",
      platforms: ["CHROME_EXTENSION"] as const,
      stage: "AVAILABLE" as const,
      pricing: "FREEMIUM" as const,
      categorySlug: "utilities",
      color: "#9cb8f2",
      shape: "circle" as const,
      featured: true,
    },
    {
      name: "Sample — Quick Notes",
      slug: "sample-quick-notes",
      tagline: "Notes that live where you work.",
      summary: "A lightweight web app for capturing ideas instantly, with local-first storage and optional sync.",
      platforms: ["WEB_APP"] as const,
      stage: "COMING_SOON" as const,
      pricing: "UNSPECIFIED" as const,
      categorySlug: "web-applications",
      color: "#f2c45a",
      shape: "ring" as const,
      featured: false,
    },
  ];

  const productIds: Record<string, string> = {};
  for (const [index, p] of products.entries()) {
    const logoId = await makeImage(logoSvg(p.color, p.shape), `${p.slug}-logo.png`);
    const coverId = await makeImage(coverSvg(p.color, p.name.replace("Sample — ", "")), `${p.slug}-cover.png`);
    const shotId = await makeImage(coverSvg(p.color, `${p.name.replace("Sample — ", "")} screen 2`), `${p.slug}-screen.png`);
    const product = await prisma.product.create({
      data: {
        name: p.name,
        slug: p.slug,
        tagline: p.tagline,
        summary: p.summary,
        description:
          "This is **sample content** used while developing the website. It is never shown on the production site.\n\n" +
          "Use it to preview layouts: long-form descriptions support Markdown, including lists:\n\n" +
          "- Clear, focused purpose\n- Minimal permissions\n- Local-first processing",
        audience: "Anyone who wants a calmer, faster everyday browser experience (sample text).",
        platforms: [...p.platforms],
        stage: p.stage,
        pricing: p.pricing,
        categoryId: await category(p.categorySlug),
        websiteUrl: "https://example.com/",
        primaryCtaUrl: p.stage === "COMING_SOON" ? null : "https://example.com/install",
        primaryCtaLabel: p.platforms.includes("CHROME_EXTENSION" as never) ? "Add to Chrome" : "Open app",
        releaseDate: p.stage === "AVAILABLE" ? new Date(Date.UTC(2025, 4 + index, 1)) : null,
        releaseDatePrecision: "MONTH",
        releaseDateVerified: p.stage === "AVAILABLE",
        accentColor: p.color,
        logoId,
        coverId,
        status: "PUBLISHED",
        featured: p.featured,
        sortOrder: index,
        verifiedAt: now,
        publishedAt: now,
        isPlaceholder: true,
        features: {
          create: [
            { title: "Works offline", description: "Core features run locally without a network connection.", sortOrder: 0 },
            { title: "Private by default", description: "No accounts, no tracking — your data stays on your device.", sortOrder: 1 },
            { title: "Keyboard first", description: "Every action has a shortcut for fast, focused use.", sortOrder: 2 },
          ],
        },
        images: {
          create: [
            { mediaId: coverId, caption: "Main view (sample)", sortOrder: 0 },
            { mediaId: shotId, caption: "Settings (sample)", sortOrder: 1 },
          ],
        },
        links: {
          create: [
            { kind: "WEBSITE", label: "Website", url: "https://example.com/", sortOrder: 0 },
            { kind: "SUPPORT", label: "Support", url: "https://example.com/support", sortOrder: 1 },
          ],
        },
      },
    });
    productIds[p.slug] = product.id;
  }

  const partnerA = await prisma.partner.create({
    data: {
      name: "Sample Partner Studio",
      slug: "sample-partner-studio",
      websiteUrl: "https://example.org/",
      logoId: await makeImage(logoSvg("#e6e6ea", "circle"), "sample-partner-studio.png"),
    },
  });
  const partnerB = await prisma.partner.create({
    data: { name: "Example Collective", slug: "sample-example-collective", websiteUrl: "https://example.net/" },
  });

  const collaborations = [
    {
      title: "Sample — Community launch campaign",
      slug: "sample-community-launch-campaign",
      summary: "A sample collaboration used to preview the collaborations showcase.",
      category: "CAMPAIGN" as const,
      date: new Date(Date.UTC(2025, 8, 12)),
      partners: [partnerA.id],
      featured: true,
    },
    {
      title: "Sample — Product integration",
      slug: "sample-product-integration",
      summary: "Example of an integration announcement with a partner product.",
      category: "PRODUCT_INTEGRATION" as const,
      date: new Date(Date.UTC(2026, 1, 3)),
      partners: [partnerB.id],
      featured: true,
    },
    {
      title: "Sample — Open-source contribution",
      slug: "sample-open-source-contribution",
      summary: "Example contribution record linked to its original source.",
      category: "CONTRIBUTION" as const,
      date: new Date(Date.UTC(2024, 10, 20)),
      partners: [partnerA.id, partnerB.id],
      featured: false,
    },
  ];
  for (const [index, c] of collaborations.entries()) {
    await prisma.collaboration.create({
      data: {
        title: c.title,
        slug: c.slug,
        summary: c.summary,
        description: "Sample long-form description of the collaboration. **Never shown in production.**",
        category: c.category,
        date: c.date,
        datePrecision: "DAY",
        sourceUrl: "https://x.com/",
        sourceLabel: "Original post on X",
        status: "PUBLISHED",
        featured: c.featured,
        sortOrder: index,
        verifiedAt: now,
        publishedAt: now,
        isPlaceholder: true,
        partners: { create: c.partners.map((partnerId, order) => ({ partnerId, sortOrder: order })) },
        products: { connect: [{ id: productIds["sample-focus-tabs"]! }] },
      },
    });
  }

  const leadership = await prisma.teamGroup.findUnique({ where: { slug: "leadership" } });
  const teamGroup = await prisma.teamGroup.findUnique({ where: { slug: "team" } });
  const members = [
    { name: "Alex Example", position: "Founder (sample)", leadership: true, type: "CURRENT" as const },
    { name: "Sam Placeholder", position: "Product Designer (sample)", leadership: false, type: "CURRENT" as const },
    { name: "Jordan Sample", position: "Software Engineer (sample)", leadership: false, type: "CURRENT" as const },
    { name: "Riley Demo", position: "Former Contributor (sample)", leadership: false, type: "FORMER" as const },
  ];
  for (const [index, member] of members.entries()) {
    await prisma.teamMember.create({
      data: {
        name: member.name,
        slug: member.name.toLowerCase().replace(/\s+/g, "-"),
        position: member.position,
        shortBio: "Sample biography used to preview the team directory. Not a real person.",
        bio: "This is a **sample** profile. Replace sample content with real team members in the admin dashboard.",
        responsibilities: ["Example responsibility", "Another responsibility"],
        expertise: ["Product", "Design", "Engineering"].slice(0, 2 + (index % 2)),
        memberType: member.type,
        isLeadership: member.leadership,
        groupId: member.leadership ? (leadership?.id ?? null) : (teamGroup?.id ?? null),
        linkedinUrl: "https://www.linkedin.com/",
        status: "PUBLISHED",
        sortOrder: index,
        publishedAt: now,
        isPlaceholder: true,
      },
    });
  }

  const milestones = [
    { title: "Sample — Company established", kind: "FOUNDING" as const, date: new Date(Date.UTC(2023, 0, 1)), precision: "YEAR" as const },
    { title: "Sample — First prototype", kind: "PRODUCT" as const, date: new Date(Date.UTC(2024, 5, 1)), precision: "MONTH" as const },
    { title: "Sample — First extension published", kind: "LAUNCH" as const, date: new Date(Date.UTC(2025, 4, 1)), precision: "MONTH" as const, product: "sample-focus-tabs" },
    { title: "Sample — First collaboration", kind: "COLLABORATION" as const, date: new Date(Date.UTC(2025, 8, 12)), precision: "DAY" as const },
    { title: "Sample — Expanding to the web", kind: "PLATFORM" as const, date: new Date(Date.UTC(2026, 2, 1)), precision: "MONTH" as const, product: "sample-quick-notes" },
  ];
  for (const [index, milestone] of milestones.entries()) {
    await prisma.companyMilestone.create({
      data: {
        title: milestone.title,
        slug: `sample-milestone-${index + 1}`,
        description: "Sample milestone description used to preview the journey timeline.",
        date: milestone.date,
        datePrecision: milestone.precision,
        kind: milestone.kind,
        productId: milestone.product ? (productIds[milestone.product] ?? null) : null,
        sourceUrl: "https://example.com/",
        sourceLabel: "Source",
        status: "PUBLISHED",
        featured: index >= 1,
        verifiedAt: now,
        publishedAt: now,
        isPlaceholder: true,
      },
    });
  }

  console.log("Created sample products, collaborations, team members and milestones (hidden in production).");
}

async function main() {
  assertDevelopment();
  if (process.argv.includes("--clear")) {
    await clear();
  } else {
    await seed();
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
