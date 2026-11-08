import type {
  CollaborationCategory,
  DatePrecision,
  InquiryType,
  LinkKind,
  MilestoneKind,
  Platform,
  PricingModel,
  PublishStatus,
  ReleaseStage,
  SocialPlatform,
  TeamMemberType,
} from "@/generated/prisma/enums";

/**
 * Public data transfer objects. Only fields that are safe to render on the
 * public website exist here — import provenance, verification metadata and
 * other private fields are never selected for public queries.
 * Dates are ISO strings so DTOs survive the data cache's JSON serialisation.
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
  contactFormEnabled: boolean;
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
  isPlaceholder: boolean;
  updatedAt: string;
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
  capabilities: Array<{ slug: string; title: string }>;
  seoTitle: string | null;
  seoDescription: string | null;
  status: PublishStatus;
}

export interface PartnerDTO {
  slug: string;
  name: string;
  websiteUrl: string | null;
  xHandle: string | null;
  logo: MediaDTO | null;
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
  isPlaceholder: boolean;
  updatedAt: string;
}

export interface CollaborationDetailDTO extends CollaborationCardDTO {
  description: string | null;
  externalUrl: string | null;
  products: Array<{ slug: string; name: string }>;
  status: PublishStatus;
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
  githubUrl: string | null;
  websiteUrl: string | null;
  joined: DatedValue | null;
  memberType: TeamMemberType;
  isLeadership: boolean;
  hasProfilePage: boolean;
  group: { slug: string; name: string; description: string | null } | null;
  isPlaceholder: boolean;
  updatedAt: string;
  status: PublishStatus;
}

export interface TeamGroupDTO {
  slug: string;
  name: string;
  description: string | null;
  members: TeamMemberDTO[];
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
  isPlaceholder: boolean;
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
  isPlaceholder: boolean;
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

export type { InquiryType };
