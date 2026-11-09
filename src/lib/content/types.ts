import type {
  CollaborationCategory,
  DatePrecision,
  LinkKind,
  MilestoneKind,
  Platform,
  PricingModel,
  ProjectStatus,
  ReleaseStage,
  SocialPlatform,
  TeamMemberType,
} from "@/lib/content/enums";

/**
 * Normalised shapes the pages render. They are built from the content files
 * in src/content by src/lib/content/public.ts — edit the content files, not
 * these types, to change what the site says.
 */

export interface MediaDTO {
  id: string;
  url: string;
  width: number | null;
  height: number | null;
  alt: string;
  mimeType: string;
}

export interface DatedValue {
  date: string;
  precision: DatePrecision;
}

export interface CompanyDTO {
  name: string;
  legalName: string | null;
  tagline: string | null;
  shortDescription: string;
  heroEyebrow: string | null;
  heroHeadline: string;
  heroDescription: string;
  primaryCtaLabel: string;
  secondaryCtaLabel: string;
  introHeading: string | null;
  introBody: string | null;
  whoWeAre: string | null;
  whyWeExist: string | null;
  mission: string | null;
  vision: string | null;
  philosophyIntro: string | null;
  approach: string | null;
  longTermDirection: string | null;
  whatWeDoIntro: string | null;
  structureIntro: string | null;
  closingHeadline: string | null;
  closingBody: string | null;
  founded: DatedValue | null;
  logo: MediaDTO | null;
  contact: {
    intro: string | null;
    contactEmail: string | null;
    businessEmail: string | null;
    partnershipEmail: string | null;
    generalEmail: string | null;
    pressEmail: string | null;
    country: string | null;
    address: {
      line1: string;
      line2: string | null;
      city: string | null;
      region: string | null;
      postalCode: string | null;
      country: string | null;
    } | null;
  };
}

export interface SettingsDTO {
  seoTitleDefault: string;
  seoTitleTemplate: string;
  seoDescription: string;
  seoKeywords: string[];
  twitterHandle: string | null;
  allowIndexing: boolean;
  googleSiteVerification: string | null;
  bingSiteVerification: string | null;
  ogImage: MediaDTO | null;
  privacyPolicy: string;
  privacyUpdatedAt: string | null;
  termsOfUse: string;
  termsUpdatedAt: string | null;
}

export interface CategoryDTO {
  slug: string;
  name: string;
  description: string | null;
}

export interface ProductCardDTO {
  id: string;
  slug: string;
  name: string;
  tagline: string | null;
  summary: string;
  category: CategoryDTO | null;
  platforms: Platform[];
  stage: ReleaseStage;
  websiteUrl: string | null;
  primaryCtaUrl: string | null;
  primaryCtaLabel: string | null;
  logo: MediaDTO | null;
  cover: MediaDTO | null;
  featured: boolean;
  accentColor: string | null;
}

export interface ProductDetailDTO extends ProductCardDTO {
  description: string | null;
  audience: string | null;
  pricing: PricingModel;
  release: DatedValue | null;
  features: Array<{ id: string; title: string; description: string | null }>;
  images: Array<{ id: string; caption: string | null; media: MediaDTO }>;
  links: Array<{ id: string; kind: LinkKind; label: string; url: string }>;
  milestones: Array<{ slug: string; title: string; date: string; precision: DatePrecision }>;
  collaborations: Array<{ slug: string; title: string }>;
  projects: Array<{ slug: string; title: string }>;
  capabilities: Array<{ slug: string; title: string }>;
  seoTitle: string | null;
  seoDescription: string | null;
}

export interface PartnerDTO {
  slug: string;
  name: string;
  websiteUrl: string | null;
  xHandle: string | null;
  logo: MediaDTO | null;
  description: string | null;
}

export interface CollaborationCardDTO {
  id: string;
  slug: string;
  title: string;
  summary: string;
  category: CollaborationCategory;
  date: DatedValue | null;
  featured: boolean;
  sourceUrl: string | null;
  sourceLabel: string | null;
  cover: MediaDTO | null;
  partners: Array<PartnerDTO & { role: string | null }>;
}

export interface CollaborationDetailDTO extends CollaborationCardDTO {
  description: string | null;
  externalUrl: string | null;
  products: Array<{ slug: string; name: string }>;
}

export interface ProjectCardDTO {
  id: string;
  slug: string;
  title: string;
  summary: string;
  client: string | null;
  status: ProjectStatus;
  date: DatedValue | null;
  services: string[];
  cover: MediaDTO | null;
  featured: boolean;
  accentColor: string | null;
}

export interface ProjectDetailDTO extends ProjectCardDTO {
  description: string | null;
  outcome: string | null;
  images: Array<{ id: string; caption: string | null; media: MediaDTO }>;
  links: Array<{ id: string; kind: LinkKind; label: string; url: string }>;
  products: Array<{ slug: string; name: string }>;
  partners: PartnerDTO[];
}

export interface TeamMemberDTO {
  id: string;
  slug: string;
  name: string;
  position: string;
  shortBio: string | null;
  bio: string | null;
  responsibilities: string[];
  expertise: string[];
  photo: MediaDTO | null;
  linkedinUrl: string | null;
  xUrl: string | null;
  telegramUrl: string | null;
  githubUrl: string | null;
  websiteUrl: string | null;
  joined: DatedValue | null;
  memberType: TeamMemberType;
  isLeadership: boolean;
  hasProfilePage: boolean;
  group: { slug: string; name: string; description: string | null } | null;
}

export interface TeamGroupDTO {
  slug: string;
  name: string;
  description: string | null;
  members: TeamMemberDTO[];
}

/** A unit in the company structure (department, studio, division…). */
export interface DepartmentDTO {
  slug: string;
  name: string;
  description: string | null;
  focus: string[];
  lead: { slug: string; name: string; position: string; hasProfilePage: boolean } | null;
  memberCount: number;
}

export interface MilestoneDTO {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  date: string;
  precision: DatePrecision;
  kind: MilestoneKind;
  image: MediaDTO | null;
  product: { slug: string; name: string } | null;
  collaboration: { slug: string; title: string } | null;
  sourceUrl: string | null;
  sourceLabel: string | null;
  featured: boolean;
}

export interface CapabilityDTO {
  id: string;
  slug: string;
  title: string;
  summary: string;
  description: string | null;
  icon: string;
  featured: boolean;
  products: Array<{ slug: string; name: string }>;
}

export interface PrincipleDTO {
  id: string;
  title: string;
  description: string;
}

export interface SocialLinkDTO {
  id: string;
  platform: SocialPlatform;
  label: string;
  url: string;
}
