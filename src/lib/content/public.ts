import * as content from "@/content";
import type { DateInput, ImageInput, LinkInput } from "@/content/schema";
import type { Platform, ReleaseStage } from "@/lib/content/enums";
import type {
  CapabilityDTO,
  CategoryDTO,
  CollaborationCardDTO,
  CollaborationDetailDTO,
  CompanyDTO,
  DatedValue,
  DepartmentDTO,
  MediaDTO,
  MilestoneDTO,
  PartnerDTO,
  PrincipleDTO,
  ProductCardDTO,
  ProductDetailDTO,
  ProjectCardDTO,
  ProjectDetailDTO,
  SettingsDTO,
  SocialLinkDTO,
  TeamGroupDTO,
  TeamMemberDTO,
} from "@/lib/content/types";
import { validateContent } from "@/lib/content/validate";
import { LINK_KIND_LABELS, SOCIAL_PLATFORM_LABELS } from "@/lib/labels";
import { slugify } from "@/lib/utils";

/**
 * Turns the content files (src/content) into the shapes the pages render.
 * Everything is static: pages are generated at build time, so there is no
 * database, admin or API behind the site. Broken content fails the build.
 */

const problems = validateContent(content);
if (problems.length > 0) {
  throw new Error(`The website content has ${problems.length} problem(s):\n- ${problems.join("\n- ")}\n\nFix them in src/content (see docs/CONTENT.md).`);
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

export function parseDate(input: DateInput | undefined): DatedValue | null {
  if (!input) return null;
  const [y, m, d] = input.split("-");
  const precision = d ? "DAY" : m ? "MONTH" : "YEAR";
  return { date: `${y}-${m ?? "01"}-${d ?? "01"}`, precision };
}

const MIME: Record<string, string> = {
  svg: "image/svg+xml",
  png: "image/png",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  webp: "image/webp",
  avif: "image/avif",
  gif: "image/gif",
};

export function media(image: ImageInput | undefined, fallbackAlt: string): MediaDTO | null {
  if (!image) return null;
  const extension = image.src.split(".").pop()?.toLowerCase() ?? "";
  return {
    id: image.src,
    url: image.src,
    width: image.width ?? null,
    height: image.height ?? null,
    alt: image.alt ?? fallbackAlt,
    mimeType: MIME[extension] ?? "image/png",
  };
}

function hostLabel(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

function links(items: LinkInput[] | undefined, prefix: string) {
  return (items ?? []).map((link, index) => ({
    id: `${prefix}-link-${index}`,
    kind: link.kind ?? "OTHER",
    label: link.label ?? (link.kind && link.kind !== "OTHER" ? LINK_KIND_LABELS[link.kind] : hostLabel(link.url)),
    url: link.url,
  }));
}

const byDateAsc = (a: { date: DatedValue | null }, b: { date: DatedValue | null }) => (a.date?.date ?? "").localeCompare(b.date?.date ?? "");

// ---------------------------------------------------------------------------
// Company, settings, principles, capabilities
// ---------------------------------------------------------------------------

const companyDto: CompanyDTO = (() => {
  const c = content.company;
  const emails = c.contact.emails;
  return {
    name: c.name,
    legalName: c.legalName ?? null,
    tagline: c.tagline,
    shortDescription: c.shortDescription,
    heroEyebrow: c.hero.eyebrow ?? null,
    heroHeadline: c.hero.headline,
    heroDescription: c.hero.description,
    primaryCtaLabel: c.hero.primaryCta,
    secondaryCtaLabel: c.hero.secondaryCta,
    introHeading: c.intro.heading,
    introBody: c.intro.body,
    whoWeAre: c.about.whoWeAre,
    whyWeExist: c.about.whyWeExist,
    mission: c.about.mission,
    vision: c.about.vision,
    philosophyIntro: c.about.philosophyIntro,
    approach: c.about.approach,
    longTermDirection: c.about.longTermDirection,
    whatWeDoIntro: c.whatWeDoIntro,
    structureIntro: c.structureIntro,
    closingHeadline: c.closing.headline,
    closingBody: c.closing.body,
    founded: parseDate(c.founded),
    logo: media(c.logo, c.name),
    contact: {
      intro: c.contact.intro ?? null,
      contactEmail: emails.general ?? emails.business ?? emails.partnerships ?? emails.press ?? null,
      businessEmail: emails.business ?? null,
      partnershipEmail: emails.partnerships ?? null,
      generalEmail: emails.general ?? null,
      pressEmail: emails.press ?? null,
      country: c.contact.country ?? null,
      address: c.contact.address
        ? {
            line1: c.contact.address.line1,
            line2: c.contact.address.line2 ?? null,
            city: c.contact.address.city ?? null,
            region: c.contact.address.region ?? null,
            postalCode: c.contact.address.postalCode ?? null,
            country: c.contact.address.country ?? null,
          }
        : null,
    },
  };
})();

const settingsDto: SettingsDTO = {
  seoTitleDefault: content.site.seo.title,
  seoTitleTemplate: content.site.seo.titleTemplate,
  seoDescription: content.site.seo.description,
  seoKeywords: content.site.seo.keywords,
  twitterHandle: content.site.seo.twitterHandle ?? null,
  allowIndexing: true,
  googleSiteVerification: content.site.seo.googleSiteVerification ?? null,
  bingSiteVerification: content.site.seo.bingSiteVerification ?? null,
  ogImage: media(content.site.seo.ogImage, content.company.name),
  privacyPolicy: content.site.legal.privacyPolicy,
  privacyUpdatedAt: parseDate(content.site.legal.privacyUpdated)?.date ?? null,
  termsOfUse: content.site.legal.termsOfUse,
  termsUpdatedAt: parseDate(content.site.legal.termsUpdated)?.date ?? null,
};

const productNames = new Map(content.products.map((p) => [p.slug, p.name]));
const productRefs = (slugs: string[] | undefined) => (slugs ?? []).map((slug) => ({ slug, name: productNames.get(slug)! }));

const principleDtos: PrincipleDTO[] = content.principles.map((p, i) => ({ id: `principle-${i + 1}`, ...p }));

const capabilityDtos: CapabilityDTO[] = content.capabilities.map((c) => {
  const slug = slugify(c.title);
  return {
    id: slug,
    slug,
    title: c.title,
    summary: c.summary,
    description: c.description ?? null,
    icon: c.icon ?? "sparkles",
    featured: c.featured ?? false,
    products: productRefs(c.products),
  };
});

const socialDtos: SocialLinkDTO[] = content.company.socials.map((s, i) => ({
  id: `social-${i}`,
  platform: s.platform,
  label: s.label ?? SOCIAL_PLATFORM_LABELS[s.platform],
  url: s.url,
}));

// ---------------------------------------------------------------------------
// Products
// ---------------------------------------------------------------------------

const categoryMap = new Map<string, CategoryDTO>(content.categories.map((c) => [c.slug, { slug: c.slug, name: c.name, description: c.description ?? null }]));

const productCards: ProductCardDTO[] = content.products.map((p) => ({
  id: p.slug,
  slug: p.slug,
  name: p.name,
  tagline: p.tagline ?? null,
  summary: p.summary,
  category: p.category ? (categoryMap.get(p.category) ?? null) : null,
  platforms: p.platforms ?? [],
  stage: p.stage,
  websiteUrl: p.website ?? null,
  primaryCtaUrl: p.cta?.url ?? null,
  primaryCtaLabel: p.cta?.label ?? null,
  logo: media(p.logo, `${p.name} logo`),
  cover: media(p.cover, p.name),
  featured: p.featured ?? false,
  accentColor: p.accentColor ?? null,
}));

// ---------------------------------------------------------------------------
// Partners & partnerships
// ---------------------------------------------------------------------------

const partnerDtos = new Map<string, PartnerDTO>(
  content.partners.map((p) => [
    p.slug,
    { slug: p.slug, name: p.name, websiteUrl: p.website ?? null, xHandle: p.x ?? null, logo: media(p.logo, p.name), description: p.description ?? null },
  ]),
);

const partnershipCards: CollaborationCardDTO[] = content.partnerships.map((p) => ({
  id: p.slug,
  slug: p.slug,
  title: p.title,
  summary: p.summary,
  category: p.category,
  date: parseDate(p.date),
  featured: p.featured ?? false,
  sourceUrl: p.source?.url ?? null,
  sourceLabel: p.source?.label ?? null,
  cover: media(p.cover, p.title),
  partners: p.partners.map((ref) => {
    const slug = typeof ref === "string" ? ref : ref.slug;
    return { ...partnerDtos.get(slug)!, role: typeof ref === "string" ? null : (ref.role ?? null) };
  }),
}));

// ---------------------------------------------------------------------------
// Projects
// ---------------------------------------------------------------------------

const projectCards: ProjectCardDTO[] = content.projects.map((p) => ({
  id: p.slug,
  slug: p.slug,
  title: p.title,
  summary: p.summary,
  client: p.client ?? null,
  status: p.status,
  date: parseDate(p.date),
  services: p.services ?? [],
  cover: media(p.cover, p.title),
  featured: p.featured ?? false,
  accentColor: p.accentColor ?? null,
}));

// ---------------------------------------------------------------------------
// Team & structure
// ---------------------------------------------------------------------------

const departmentInfo = new Map(content.departments.map((d) => [d.slug, d]));

const memberDtos: TeamMemberDTO[] = content.team.map((m) => {
  const dept = m.department ? departmentInfo.get(m.department) : undefined;
  return {
    id: m.slug,
    slug: m.slug,
    name: m.name,
    position: m.position,
    shortBio: m.shortBio ?? null,
    bio: m.bio ?? null,
    responsibilities: m.responsibilities ?? [],
    expertise: m.expertise ?? [],
    photo: media(m.photo, m.name),
    linkedinUrl: m.links?.linkedin ?? null,
    xUrl: m.links?.x ?? null,
    telegramUrl: m.links?.telegram ?? null,
    githubUrl: m.links?.github ?? null,
    websiteUrl: m.links?.website ?? null,
    joined: parseDate(m.joined),
    memberType: m.former ? "FORMER" : "CURRENT",
    isLeadership: m.leadership ?? false,
    hasProfilePage: m.profilePage ?? true,
    group: dept ? { slug: dept.slug, name: dept.name, description: dept.description ?? null } : null,
  };
});

// ---------------------------------------------------------------------------
// Milestones
// ---------------------------------------------------------------------------

const partnershipTitles = new Map(content.partnerships.map((p) => [p.slug, p.title]));

const milestoneDtos: MilestoneDTO[] = content.milestones
  .map((m) => {
    const date = parseDate(m.date)!;
    const slug = slugify(`${m.date}-${m.title}`);
    return {
      id: slug,
      slug,
      title: m.title,
      description: m.description ?? null,
      date: date.date,
      precision: date.precision,
      kind: m.kind ?? "MILESTONE",
      image: media(m.image, m.title),
      product: m.product ? { slug: m.product, name: productNames.get(m.product)! } : null,
      collaboration: m.partnership ? { slug: m.partnership, title: partnershipTitles.get(m.partnership)! } : null,
      sourceUrl: m.source?.url ?? null,
      sourceLabel: m.source?.label ?? null,
      featured: m.featured ?? false,
    };
  })
  .sort((a, b) => a.date.localeCompare(b.date));

// ---------------------------------------------------------------------------
// Public API (async to keep page code simple and future-proof)
// ---------------------------------------------------------------------------

export async function getCompany(): Promise<CompanyDTO> {
  return companyDto;
}

export async function getSettings(): Promise<SettingsDTO> {
  return settingsDto;
}

export async function getPrinciples(): Promise<PrincipleDTO[]> {
  return principleDtos;
}

export async function getCapabilities(): Promise<CapabilityDTO[]> {
  return capabilityDtos;
}

export async function getSocialLinks(): Promise<SocialLinkDTO[]> {
  return socialDtos;
}

export interface ProductFilter {
  category?: string;
  platform?: Platform;
  stage?: ReleaseStage;
}

export async function getProducts(filter: ProductFilter = {}): Promise<ProductCardDTO[]> {
  return productCards.filter(
    (p) =>
      (!filter.category || p.category?.slug === filter.category) &&
      (!filter.platform || p.platforms.includes(filter.platform)) &&
      (!filter.stage || p.stage === filter.stage),
  );
}

export async function getFeaturedProducts(limit = 6): Promise<ProductCardDTO[]> {
  const featured = productCards.filter((p) => p.featured);
  return (featured.length > 0 ? featured : productCards).slice(0, limit);
}

export async function getProductCategories(): Promise<CategoryDTO[]> {
  const used = new Set(productCards.map((p) => p.category?.slug).filter(Boolean));
  return [...categoryMap.values()].filter((c) => used.has(c.slug));
}

export async function getProductPlatforms(): Promise<Platform[]> {
  return [...new Set(productCards.flatMap((p) => p.platforms))];
}

export function productSlugs(): string[] {
  return content.products.map((p) => p.slug);
}

export async function getProduct(slug: string): Promise<ProductDetailDTO | null> {
  const p = content.products.find((x) => x.slug === slug);
  const card = productCards.find((x) => x.slug === slug);
  if (!p || !card) return null;
  return {
    ...card,
    description: p.description ?? null,
    audience: p.audience ?? null,
    pricing: p.pricing ?? "UNSPECIFIED",
    release: parseDate(p.released),
    features: (p.features ?? []).map((f, i) => ({ id: `${p.slug}-feature-${i}`, title: f.title, description: f.description ?? null })),
    images: (p.screenshots ?? []).map((s, i) => ({ id: `${p.slug}-shot-${i}`, caption: s.caption ?? null, media: media(s, s.caption ?? `${p.name} screenshot`)! })),
    links: links(p.links, p.slug),
    milestones: milestoneDtos.filter((m) => m.product?.slug === slug).map((m) => ({ slug: m.slug, title: m.title, date: m.date, precision: m.precision })),
    collaborations: content.partnerships.filter((x) => x.products?.includes(slug)).map((x) => ({ slug: x.slug, title: x.title })),
    projects: content.projects.filter((x) => x.products?.includes(slug)).map((x) => ({ slug: x.slug, title: x.title })),
    capabilities: capabilityDtos.filter((c) => c.products.some((x) => x.slug === slug)).map((c) => ({ slug: c.slug, title: c.title })),
    seoTitle: p.seo?.title ?? null,
    seoDescription: p.seo?.description ?? null,
  };
}

export async function getCollaborations(): Promise<CollaborationCardDTO[]> {
  return [...partnershipCards].sort((a, b) => byDateAsc(b, a));
}

export async function getFeaturedCollaborations(limit = 3): Promise<CollaborationCardDTO[]> {
  const sorted = await getCollaborations();
  const featured = sorted.filter((p) => p.featured);
  return (featured.length > 0 ? featured : sorted).slice(0, limit);
}

export async function getPartners(): Promise<PartnerDTO[]> {
  return [...partnerDtos.values()];
}

export function partnershipSlugs(): string[] {
  return content.partnerships.map((p) => p.slug);
}

export async function getCollaboration(slug: string): Promise<CollaborationDetailDTO | null> {
  const p = content.partnerships.find((x) => x.slug === slug);
  const card = partnershipCards.find((x) => x.slug === slug);
  if (!p || !card) return null;
  return { ...card, description: p.description ?? null, externalUrl: p.link ?? null, products: productRefs(p.products) };
}

export async function getProjects(): Promise<ProjectCardDTO[]> {
  return projectCards;
}

export async function getFeaturedProjects(limit = 4): Promise<ProjectCardDTO[]> {
  const featured = projectCards.filter((p) => p.featured);
  return (featured.length > 0 ? featured : projectCards).slice(0, limit);
}

export function projectSlugs(): string[] {
  return content.projects.map((p) => p.slug);
}

export async function getProject(slug: string): Promise<ProjectDetailDTO | null> {
  const p = content.projects.find((x) => x.slug === slug);
  const card = projectCards.find((x) => x.slug === slug);
  if (!p || !card) return null;
  return {
    ...card,
    description: p.description ?? null,
    outcome: p.outcome ?? null,
    images: (p.images ?? []).map((s, i) => ({ id: `${p.slug}-image-${i}`, caption: s.caption ?? null, media: media(s, s.caption ?? p.title)! })),
    links: links(p.links, p.slug),
    products: productRefs(p.products),
    partners: (p.partners ?? []).map((slug) => partnerDtos.get(slug)!),
  };
}

export async function getTeam(): Promise<{ leadership: TeamMemberDTO[]; groups: TeamGroupDTO[]; former: TeamMemberDTO[] }> {
  const current = memberDtos.filter((m) => m.memberType === "CURRENT");
  const rest = current.filter((m) => !m.isLeadership);
  const groups: TeamGroupDTO[] = [];
  for (const d of content.departments) {
    const members = rest.filter((m) => m.group?.slug === d.slug);
    if (members.length) groups.push({ slug: d.slug, name: d.name, description: d.description ?? null, members });
  }
  const unassigned = rest.filter((m) => !m.group);
  if (unassigned.length) groups.push({ slug: "team", name: "Team", description: null, members: unassigned });
  return { leadership: current.filter((m) => m.isLeadership), groups, former: memberDtos.filter((m) => m.memberType === "FORMER") };
}

export async function getTeamPreview(limit = 4): Promise<TeamMemberDTO[]> {
  const current = memberDtos.filter((m) => m.memberType === "CURRENT");
  return [...current.filter((m) => m.isLeadership), ...current.filter((m) => !m.isLeadership)].slice(0, limit);
}

export function teamProfileSlugs(): string[] {
  return memberDtos.filter((m) => m.hasProfilePage).map((m) => m.slug);
}

export async function getTeamMember(slug: string): Promise<TeamMemberDTO | null> {
  return memberDtos.find((m) => m.slug === slug && m.hasProfilePage) ?? null;
}

export async function getDepartments(): Promise<DepartmentDTO[]> {
  return content.departments.map((d) => {
    const lead = d.lead ? memberDtos.find((m) => m.slug === d.lead) : undefined;
    return {
      slug: d.slug,
      name: d.name,
      description: d.description ?? null,
      focus: d.focus ?? [],
      lead: lead ? { slug: lead.slug, name: lead.name, position: lead.position, hasProfilePage: lead.hasProfilePage } : null,
      memberCount: memberDtos.filter((m) => m.memberType === "CURRENT" && m.group?.slug === d.slug).length,
    };
  });
}

export async function getMilestones(): Promise<MilestoneDTO[]> {
  return milestoneDtos;
}

export async function getRecentMilestones(limit = 4): Promise<MilestoneDTO[]> {
  const featured = milestoneDtos.filter((m) => m.featured);
  return (featured.length > 0 ? featured : milestoneDtos).slice(-limit);
}

export async function getSitemapEntries() {
  return { products: productSlugs(), projects: projectSlugs(), partnerships: partnershipSlugs(), team: teamProfileSlugs() };
}
