import { prisma } from "@/lib/db";
import { placeholdersVisible } from "@/lib/env";
import { mediaUrl } from "@/lib/media/storage";
import { DEFAULT_COMPANY, DEFAULT_PRIVACY_POLICY, DEFAULT_SEO, DEFAULT_TERMS } from "@/lib/content/defaults";
import type { Prisma } from "@/generated/prisma/client";
import type {
  CapabilityDTO,
  CategoryDTO,
  CollaborationCardDTO,
  CollaborationDetailDTO,
  CompanyDTO,
  MediaDTO,
  MilestoneDTO,
  PartnerDTO,
  PrincipleDTO,
  ProductCardDTO,
  ProductDetailDTO,
  SettingsDTO,
  SocialLinkDTO,
  TeamGroupDTO,
  TeamMemberDTO,
} from "@/lib/content/types";
import { SOCIAL_PLATFORM_LABELS } from "@/lib/labels";
import type { Platform, ReleaseStage } from "@/generated/prisma/enums";

/**
 * Raw (uncached) public queries. Every query that feeds a public page goes
 * through `visibility()`, which only ever returns PUBLISHED records, hides
 * placeholder content in production and — for records that require owner
 * verification — also requires `verifiedAt`. The `preview` flag (admin draft
 * preview only) relaxes the status filter for a single record lookup.
 */

const mediaSelect = {
  id: true,
  fileName: true,
  width: true,
  height: true,
  alt: true,
  mimeType: true,
} satisfies Prisma.MediaAssetSelect;

type MediaRow = Prisma.MediaAssetGetPayload<{ select: typeof mediaSelect }>;

function toMedia(row: MediaRow | null | undefined, fallbackAlt = ""): MediaDTO | null {
  if (!row) return null;
  return {
    id: row.id,
    url: mediaUrl(row),
    width: row.width,
    height: row.height,
    alt: row.alt || fallbackAlt,
    mimeType: row.mimeType,
  };
}

const iso = (value: Date) => value.toISOString();

function placeholderFilter() {
  return placeholdersVisible() ? {} : { isPlaceholder: false };
}

function visibility(requiresVerification: boolean) {
  return {
    status: "PUBLISHED" as const,
    ...placeholderFilter(),
    ...(requiresVerification ? { verifiedAt: { not: null } } : {}),
  };
}

// ---------------------------------------------------------------------------
// Company & settings
// ---------------------------------------------------------------------------

export async function loadCompany(): Promise<CompanyDTO> {
  const row = await prisma.companyProfile.findUnique({
    where: { id: 1 },
    include: { logo: { select: mediaSelect } },
  });
  const c = row ?? null;
  const address =
    c && c.showAddress && c.addressLine1
      ? {
          line1: c.addressLine1,
          line2: c.addressLine2,
          city: c.city,
          region: c.region,
          postalCode: c.postalCode,
          country: c.country,
        }
      : null;
  return {
    name: c?.name ?? DEFAULT_COMPANY.name,
    legalName: c?.legalName ?? null,
    tagline: c ? c.tagline : DEFAULT_COMPANY.tagline,
    shortDescription: c?.shortDescription ?? DEFAULT_COMPANY.shortDescription,
    heroEyebrow: c ? c.heroEyebrow : DEFAULT_COMPANY.heroEyebrow,
    heroHeadline: c?.heroHeadline ?? DEFAULT_COMPANY.heroHeadline,
    heroDescription: c?.heroDescription ?? DEFAULT_COMPANY.heroDescription,
    primaryCtaLabel: c?.primaryCtaLabel ?? DEFAULT_COMPANY.primaryCtaLabel,
    secondaryCtaLabel: c?.secondaryCtaLabel ?? DEFAULT_COMPANY.secondaryCtaLabel,
    introHeading: c ? c.introHeading : DEFAULT_COMPANY.introHeading,
    introBody: c ? c.introBody : DEFAULT_COMPANY.introBody,
    whoWeAre: c ? c.whoWeAre : DEFAULT_COMPANY.whoWeAre,
    whyWeExist: c ? c.whyWeExist : DEFAULT_COMPANY.whyWeExist,
    mission: c ? c.mission : DEFAULT_COMPANY.mission,
    vision: c ? c.vision : DEFAULT_COMPANY.vision,
    philosophyIntro: c ? c.philosophyIntro : DEFAULT_COMPANY.philosophyIntro,
    approach: c ? c.approach : DEFAULT_COMPANY.approach,
    longTermDirection: c ? c.longTermDirection : DEFAULT_COMPANY.longTermDirection,
    whatWeDoIntro: c ? c.whatWeDoIntro : DEFAULT_COMPANY.whatWeDoIntro,
    closingHeadline: c ? c.closingHeadline : DEFAULT_COMPANY.closingHeadline,
    closingBody: c ? c.closingBody : DEFAULT_COMPANY.closingBody,
    founded:
      c?.foundedDate && c.foundedDateVerified
        ? { date: iso(c.foundedDate), precision: c.foundedDatePrecision }
        : null,
    logo: toMedia(c?.logo, `${c?.name ?? DEFAULT_COMPANY.name} logo`),
    contact: {
      intro: c?.contactIntro ?? null,
      contactEmail: c?.contactEmail ?? null,
      businessEmail: c?.businessEmail ?? null,
      partnershipEmail: c?.partnershipEmail ?? null,
      generalEmail: c?.generalEmail ?? null,
      pressEmail: c?.pressEmail ?? null,
      country: c?.country ?? null,
      address,
    },
  };
}

export async function loadSettings(): Promise<SettingsDTO> {
  const row = await prisma.siteSettings.findUnique({
    where: { id: 1 },
    include: { ogImage: { select: mediaSelect } },
  });
  return {
    seoTitleDefault: row?.seoTitleDefault ?? DEFAULT_SEO.seoTitleDefault,
    seoTitleTemplate: row?.seoTitleTemplate ?? DEFAULT_SEO.seoTitleTemplate,
    seoDescription: row?.seoDescription ?? DEFAULT_SEO.seoDescription,
    seoKeywords: row?.seoKeywords ?? DEFAULT_SEO.seoKeywords,
    twitterHandle: row?.twitterHandle ?? null,
    allowIndexing: row?.allowIndexing ?? true,
    googleSiteVerification: row?.googleSiteVerification ?? null,
    bingSiteVerification: row?.bingSiteVerification ?? null,
    ogImage: toMedia(row?.ogImage),
    privacyPolicy: row?.privacyPolicy ?? DEFAULT_PRIVACY_POLICY,
    privacyUpdatedAt: row?.privacyUpdatedAt ? iso(row.privacyUpdatedAt) : null,
    termsOfUse: row?.termsOfUse ?? DEFAULT_TERMS,
    termsUpdatedAt: row?.termsUpdatedAt ? iso(row.termsUpdatedAt) : null,
    contactFormEnabled: row?.contactFormEnabled ?? true,
  };
}

// ---------------------------------------------------------------------------
// Products
// ---------------------------------------------------------------------------

const productCardSelect = {
  id: true,
  slug: true,
  name: true,
  tagline: true,
  summary: true,
  platforms: true,
  stage: true,
  websiteUrl: true,
  primaryCtaUrl: true,
  primaryCtaLabel: true,
  featured: true,
  accentColor: true,
  isPlaceholder: true,
  updatedAt: true,
  category: { select: { slug: true, name: true, description: true } },
  logo: { select: mediaSelect },
  cover: { select: mediaSelect },
} satisfies Prisma.ProductSelect;

type ProductCardRow = Prisma.ProductGetPayload<{ select: typeof productCardSelect }>;

function toProductCard(row: ProductCardRow): ProductCardDTO {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    tagline: row.tagline,
    summary: row.summary,
    category: row.category,
    platforms: row.platforms,
    stage: row.stage,
    websiteUrl: row.websiteUrl,
    primaryCtaUrl: row.primaryCtaUrl,
    primaryCtaLabel: row.primaryCtaLabel,
    logo: toMedia(row.logo, `${row.name} logo`),
    cover: toMedia(row.cover, `${row.name} preview`),
    featured: row.featured,
    accentColor: row.accentColor,
    isPlaceholder: row.isPlaceholder,
    updatedAt: iso(row.updatedAt),
  };
}

const productOrder: Prisma.ProductOrderByWithRelationInput[] = [
  { sortOrder: "asc" },
  { createdAt: "desc" },
];

export interface ProductFilter {
  category?: string;
  platform?: Platform;
  stage?: ReleaseStage;
}

export async function loadProducts(filter: ProductFilter = {}): Promise<ProductCardDTO[]> {
  const rows = await prisma.product.findMany({
    where: {
      ...visibility(true),
      ...(filter.category ? { category: { slug: filter.category } } : {}),
      ...(filter.platform ? { platforms: { has: filter.platform } } : {}),
      ...(filter.stage ? { stage: filter.stage } : {}),
    },
    orderBy: productOrder,
    select: productCardSelect,
  });
  return rows.map(toProductCard);
}

export async function loadFeaturedProducts(limit = 6): Promise<ProductCardDTO[]> {
  const featured = await prisma.product.findMany({
    where: { ...visibility(true), featured: true },
    orderBy: productOrder,
    take: limit,
    select: productCardSelect,
  });
  if (featured.length > 0) return featured.map(toProductCard);
  const latest = await prisma.product.findMany({
    where: visibility(true),
    orderBy: productOrder,
    take: Math.min(limit, 3),
    select: productCardSelect,
  });
  return latest.map(toProductCard);
}

export async function loadProductCategories(): Promise<CategoryDTO[]> {
  return prisma.category.findMany({
    where: { products: { some: visibility(true) } },
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    select: { slug: true, name: true, description: true },
  });
}

export async function loadProductPlatforms(): Promise<Platform[]> {
  const rows = await prisma.product.findMany({ where: visibility(true), select: { platforms: true } });
  return [...new Set(rows.flatMap((row) => row.platforms))];
}

export async function loadProduct(slug: string, preview = false): Promise<ProductDetailDTO | null> {
  const row = await prisma.product.findFirst({
    where: preview ? { slug } : { slug, ...visibility(true) },
    select: {
      ...productCardSelect,
      description: true,
      audience: true,
      pricing: true,
      releaseDate: true,
      releaseDatePrecision: true,
      releaseDateVerified: true,
      seoTitle: true,
      seoDescription: true,
      status: true,
      features: { orderBy: { sortOrder: "asc" }, select: { id: true, title: true, description: true } },
      images: {
        orderBy: { sortOrder: "asc" },
        select: { id: true, caption: true, media: { select: mediaSelect } },
      },
      links: { orderBy: { sortOrder: "asc" }, select: { id: true, kind: true, label: true, url: true } },
      milestones: {
        where: visibility(true),
        orderBy: { date: "asc" },
        select: { slug: true, title: true, date: true, datePrecision: true },
      },
      collaborations: { where: visibility(true), select: { slug: true, title: true } },
      capabilities: { where: { status: "PUBLISHED", ...placeholderFilter() }, select: { slug: true, title: true } },
    },
  });
  if (!row) return null;
  return {
    ...toProductCard(row),
    description: row.description,
    audience: row.audience,
    pricing: row.pricing,
    release:
      row.releaseDate && row.releaseDateVerified
        ? { date: iso(row.releaseDate), precision: row.releaseDatePrecision }
        : null,
    features: row.features,
    images: row.images.flatMap((image) => {
      const media = toMedia(image.media, image.caption ?? `${row.name} screenshot`);
      return media ? [{ id: image.id, caption: image.caption, media }] : [];
    }),
    links: row.links,
    milestones: row.milestones.map((m) => ({
      slug: m.slug,
      title: m.title,
      date: iso(m.date),
      precision: m.datePrecision,
    })),
    collaborations: row.collaborations,
    capabilities: row.capabilities,
    seoTitle: row.seoTitle,
    seoDescription: row.seoDescription,
    status: row.status,
  };
}

// ---------------------------------------------------------------------------
// Collaborations
// ---------------------------------------------------------------------------

const partnerSelect = {
  slug: true,
  name: true,
  websiteUrl: true,
  xHandle: true,
  logo: { select: mediaSelect },
} satisfies Prisma.PartnerSelect;

const collaborationCardSelect = {
  id: true,
  slug: true,
  title: true,
  summary: true,
  category: true,
  date: true,
  datePrecision: true,
  featured: true,
  sourceUrl: true,
  sourceLabel: true,
  isPlaceholder: true,
  updatedAt: true,
  cover: { select: mediaSelect },
  partners: {
    orderBy: { sortOrder: "asc" },
    select: { role: true, partner: { select: partnerSelect } },
  },
} satisfies Prisma.CollaborationSelect;

type CollaborationCardRow = Prisma.CollaborationGetPayload<{ select: typeof collaborationCardSelect }>;

function toPartner(row: Prisma.PartnerGetPayload<{ select: typeof partnerSelect }>): PartnerDTO {
  return {
    slug: row.slug,
    name: row.name,
    websiteUrl: row.websiteUrl,
    xHandle: row.xHandle,
    logo: toMedia(row.logo, `${row.name} logo`),
  };
}

function toCollaborationCard(row: CollaborationCardRow): CollaborationCardDTO {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    summary: row.summary,
    category: row.category,
    date: row.date ? { date: iso(row.date), precision: row.datePrecision } : null,
    featured: row.featured,
    sourceUrl: row.sourceUrl,
    sourceLabel: row.sourceLabel,
    cover: toMedia(row.cover, row.title),
    partners: row.partners.map((link) => ({ ...toPartner(link.partner), role: link.role })),
    isPlaceholder: row.isPlaceholder,
    updatedAt: iso(row.updatedAt),
  };
}

export async function loadCollaborations(): Promise<CollaborationCardDTO[]> {
  const rows = await prisma.collaboration.findMany({
    where: visibility(true),
    orderBy: [{ date: { sort: "desc", nulls: "last" } }, { sortOrder: "asc" }],
    select: collaborationCardSelect,
  });
  return rows.map(toCollaborationCard);
}

export async function loadFeaturedCollaborations(limit = 3): Promise<CollaborationCardDTO[]> {
  const rows = await prisma.collaboration.findMany({
    where: { ...visibility(true), featured: true },
    orderBy: [{ sortOrder: "asc" }, { date: { sort: "desc", nulls: "last" } }],
    take: limit,
    select: collaborationCardSelect,
  });
  return rows.map(toCollaborationCard);
}

export async function loadPartners(): Promise<PartnerDTO[]> {
  const rows = await prisma.partner.findMany({
    where: { collaborations: { some: { collaboration: visibility(true) } } },
    orderBy: { name: "asc" },
    select: partnerSelect,
  });
  return rows.map(toPartner);
}

export async function loadCollaboration(slug: string, preview = false): Promise<CollaborationDetailDTO | null> {
  const row = await prisma.collaboration.findFirst({
    where: preview ? { slug } : { slug, ...visibility(true) },
    select: {
      ...collaborationCardSelect,
      description: true,
      externalUrl: true,
      status: true,
      products: { where: visibility(true), select: { slug: true, name: true } },
    },
  });
  if (!row) return null;
  return {
    ...toCollaborationCard(row),
    description: row.description,
    externalUrl: row.externalUrl,
    products: row.products,
    status: row.status,
  };
}

// ---------------------------------------------------------------------------
// Team
// ---------------------------------------------------------------------------

const teamSelect = {
  id: true,
  slug: true,
  name: true,
  position: true,
  shortBio: true,
  bio: true,
  responsibilities: true,
  expertise: true,
  linkedinUrl: true,
  xUrl: true,
  githubUrl: true,
  websiteUrl: true,
  joinDate: true,
  joinDatePrecision: true,
  joinDateVerified: true,
  memberType: true,
  isLeadership: true,
  hasProfilePage: true,
  isPlaceholder: true,
  updatedAt: true,
  status: true,
  photo: { select: mediaSelect },
  group: { select: { slug: true, name: true, description: true, sortOrder: true } },
} satisfies Prisma.TeamMemberSelect;

type TeamRow = Prisma.TeamMemberGetPayload<{ select: typeof teamSelect }>;

function toTeamMember(row: TeamRow): TeamMemberDTO {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    position: row.position,
    shortBio: row.shortBio,
    bio: row.bio,
    responsibilities: row.responsibilities,
    expertise: row.expertise,
    photo: toMedia(row.photo, `Portrait of ${row.name}`),
    linkedinUrl: row.linkedinUrl,
    xUrl: row.xUrl,
    githubUrl: row.githubUrl,
    websiteUrl: row.websiteUrl,
    joined:
      row.joinDate && row.joinDateVerified
        ? { date: iso(row.joinDate), precision: row.joinDatePrecision }
        : null,
    memberType: row.memberType,
    isLeadership: row.isLeadership,
    hasProfilePage: row.hasProfilePage,
    group: row.group ? { slug: row.group.slug, name: row.group.name, description: row.group.description } : null,
    isPlaceholder: row.isPlaceholder,
    updatedAt: iso(row.updatedAt),
    status: row.status,
  };
}

export async function loadTeam(): Promise<{
  leadership: TeamMemberDTO[];
  groups: TeamGroupDTO[];
  former: TeamMemberDTO[];
}> {
  const rows = await prisma.teamMember.findMany({
    where: visibility(false),
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    select: teamSelect,
  });
  const members = rows.map(toTeamMember);
  const current = members.filter((m) => m.memberType === "CURRENT");
  const leadership = current.filter((m) => m.isLeadership);
  const rest = current.filter((m) => !m.isLeadership);

  const groupOrder = new Map<string, number>();
  for (const row of rows) {
    if (row.group) groupOrder.set(row.group.slug, row.group.sortOrder);
  }
  const groupsMap = new Map<string, TeamGroupDTO>();
  for (const member of rest) {
    const key = member.group?.slug ?? "__team";
    if (!groupsMap.has(key)) {
      groupsMap.set(key, {
        slug: member.group?.slug ?? "team",
        name: member.group?.name ?? "Team",
        description: member.group?.description ?? null,
        members: [],
      });
    }
    groupsMap.get(key)!.members.push(member);
  }
  const groups = [...groupsMap.entries()]
    .sort(([a], [b]) => (groupOrder.get(a) ?? 999) - (groupOrder.get(b) ?? 999))
    .map(([, group]) => group);

  return { leadership, groups, former: members.filter((m) => m.memberType === "FORMER") };
}

export async function loadTeamPreview(limit = 4): Promise<TeamMemberDTO[]> {
  const rows = await prisma.teamMember.findMany({
    where: { ...visibility(false), memberType: "CURRENT" },
    orderBy: [{ isLeadership: "desc" }, { sortOrder: "asc" }, { name: "asc" }],
    take: limit,
    select: teamSelect,
  });
  return rows.map(toTeamMember);
}

export async function loadTeamMember(slug: string, preview = false): Promise<TeamMemberDTO | null> {
  const row = await prisma.teamMember.findFirst({
    where: preview ? { slug } : { slug, hasProfilePage: true, ...visibility(false) },
    select: teamSelect,
  });
  return row ? toTeamMember(row) : null;
}

// ---------------------------------------------------------------------------
// Journey
// ---------------------------------------------------------------------------

const milestoneSelect = {
  id: true,
  slug: true,
  title: true,
  description: true,
  date: true,
  datePrecision: true,
  kind: true,
  sourceUrl: true,
  sourceLabel: true,
  featured: true,
  isPlaceholder: true,
  image: { select: mediaSelect },
  product: { select: { slug: true, name: true, status: true, verifiedAt: true, isPlaceholder: true } },
  collaboration: { select: { slug: true, title: true, status: true, verifiedAt: true, isPlaceholder: true } },
} satisfies Prisma.CompanyMilestoneSelect;

type MilestoneRow = Prisma.CompanyMilestoneGetPayload<{ select: typeof milestoneSelect }>;

function isVisibleRelation(rel: { status: string; verifiedAt: Date | null; isPlaceholder: boolean } | null) {
  if (!rel) return false;
  return rel.status === "PUBLISHED" && rel.verifiedAt !== null && (placeholdersVisible() || !rel.isPlaceholder);
}

function toMilestone(row: MilestoneRow): MilestoneDTO {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    description: row.description,
    date: iso(row.date),
    precision: row.datePrecision,
    kind: row.kind,
    image: toMedia(row.image, row.title),
    product: isVisibleRelation(row.product) ? { slug: row.product!.slug, name: row.product!.name } : null,
    collaboration: isVisibleRelation(row.collaboration)
      ? { slug: row.collaboration!.slug, title: row.collaboration!.title }
      : null,
    sourceUrl: row.sourceUrl,
    sourceLabel: row.sourceLabel,
    featured: row.featured,
    isPlaceholder: row.isPlaceholder,
  };
}

export async function loadMilestones(): Promise<MilestoneDTO[]> {
  const rows = await prisma.companyMilestone.findMany({
    where: visibility(true),
    orderBy: [{ date: "asc" }, { createdAt: "asc" }],
    select: milestoneSelect,
  });
  return rows.map(toMilestone);
}

export async function loadRecentMilestones(limit = 4): Promise<MilestoneDTO[]> {
  const featured = await prisma.companyMilestone.findMany({
    where: { ...visibility(true), featured: true },
    orderBy: { date: "desc" },
    take: limit,
    select: milestoneSelect,
  });
  const rows =
    featured.length > 0
      ? featured
      : await prisma.companyMilestone.findMany({
          where: visibility(true),
          orderBy: { date: "desc" },
          take: limit,
          select: milestoneSelect,
        });
  return rows.map(toMilestone).reverse();
}

// ---------------------------------------------------------------------------
// Capabilities, principles, social links
// ---------------------------------------------------------------------------

export async function loadCapabilities(): Promise<CapabilityDTO[]> {
  const rows = await prisma.capability.findMany({
    where: visibility(false),
    orderBy: [{ sortOrder: "asc" }, { title: "asc" }],
    select: {
      id: true,
      slug: true,
      title: true,
      summary: true,
      description: true,
      icon: true,
      featured: true,
      isPlaceholder: true,
      products: { where: visibility(true), select: { slug: true, name: true } },
    },
  });
  return rows;
}

export async function loadPrinciples(): Promise<PrincipleDTO[]> {
  return prisma.principle.findMany({
    where: { status: "PUBLISHED" },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
    select: { id: true, title: true, description: true },
  });
}

export async function loadSocialLinks(): Promise<SocialLinkDTO[]> {
  const rows = await prisma.socialLink.findMany({
    where: { visible: true },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
  });
  return rows.map((row) => ({
    id: row.id,
    platform: row.platform,
    label: row.label || SOCIAL_PLATFORM_LABELS[row.platform],
    url: row.url,
  }));
}

// ---------------------------------------------------------------------------
// Sitemap
// ---------------------------------------------------------------------------

export async function loadSitemapEntries() {
  const [products, collaborations, team] = await Promise.all([
    prisma.product.findMany({ where: visibility(true), select: { slug: true, updatedAt: true } }),
    prisma.collaboration.findMany({ where: visibility(true), select: { slug: true, updatedAt: true } }),
    prisma.teamMember.findMany({
      where: { ...visibility(false), hasProfilePage: true },
      select: { slug: true, updatedAt: true },
    }),
  ]);
  const map = (rows: Array<{ slug: string; updatedAt: Date }>) =>
    rows.map((row) => ({ slug: row.slug, updatedAt: iso(row.updatedAt) }));
  return { products: map(products), collaborations: map(collaborations), team: map(team) };
}

/** Number of development sample records (used to label dev builds). */
export async function loadPlaceholderCount(): Promise<number> {
  if (!placeholdersVisible()) return 0;
  const where = { isPlaceholder: true };
  const counts = await Promise.all([
    prisma.product.count({ where }),
    prisma.collaboration.count({ where }),
    prisma.teamMember.count({ where }),
    prisma.companyMilestone.count({ where }),
    prisma.capability.count({ where }),
  ]);
  return counts.reduce((sum, value) => sum + value, 0);
}
