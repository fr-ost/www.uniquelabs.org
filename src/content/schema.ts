/**
 * Shapes of the content files in this folder. Every page of the website is
 * built from these files — edit them to change what the site says.
 * See docs/CONTENT.md for a step-by-step guide.
 */
import type {
  LinkKind,
  MilestoneKind,
  PartnershipCategory,
  Platform,
  PricingModel,
  ProjectStatus,
  ReleaseStage,
  SocialPlatform,
} from "@/lib/content/enums";
import type { CapabilityIcon } from "@/lib/labels";

export type {
  LinkKind,
  MilestoneKind,
  PartnershipCategory,
  Platform,
  PricingModel,
  ProjectStatus,
  ReleaseStage,
  SocialPlatform,
  CapabilityIcon,
};

/**
 * An image stored in /public, referenced by its path, e.g.
 * "/images/products/tabnest/logo.png". Give width/height (pixels) for
 * images shown at their natural size, such as logos.
 */
export interface ImageInput {
  src: string;
  alt?: string;
  width?: number;
  height?: number;
}

/** "2025", "2025-06" or "2025-06-14" — the precision shown follows what you write. */
export type DateInput = string;

export interface LinkInput {
  url: string;
  label?: string;
  kind?: LinkKind;
}

export interface SocialLinkInput {
  platform: SocialPlatform;
  url: string;
  label?: string;
}

export interface CompanyInput {
  name: string;
  legalName?: string;
  tagline: string;
  shortDescription: string;
  /** Only shown when set. */
  founded?: DateInput;
  logo?: ImageInput;
  hero: {
    eyebrow?: string;
    headline: string;
    description: string;
    primaryCta: string;
    secondaryCta: string;
  };
  intro: { heading: string; body: string };
  about: {
    whoWeAre: string;
    whyWeExist: string;
    mission: string;
    vision: string;
    approach: string;
    longTermDirection: string;
    philosophyIntro: string;
  };
  whatWeDoIntro: string;
  /** Introduction for the "How we're organised" section (company structure). */
  structureIntro: string;
  closing: { headline: string; body: string };
  contact: {
    intro?: string;
    /** Addresses are shown on the Contact page and in the footer when set. */
    emails: { general?: string; business?: string; partnerships?: string; press?: string };
    country?: string;
    address?: { line1: string; line2?: string; city?: string; region?: string; postalCode?: string; country?: string };
  };
  socials: SocialLinkInput[];
}

export interface SiteInput {
  seo: {
    title: string;
    /** "%s" is replaced by the page title. */
    titleTemplate: string;
    description: string;
    keywords: string[];
    twitterHandle?: string;
    googleSiteVerification?: string;
    bingSiteVerification?: string;
    /** Default share image; branded images are generated when empty. */
    ogImage?: ImageInput;
  };
  legal: {
    /** Markdown. Tokens: {{company}}, {{site}}, {{contact}}. */
    privacyPolicy: string;
    privacyUpdated: DateInput;
    termsOfUse: string;
    termsUpdated: DateInput;
  };
}

export interface PrincipleInput {
  title: string;
  description: string;
}

export interface CapabilityInput {
  title: string;
  summary: string;
  description?: string;
  icon?: CapabilityIcon;
  featured?: boolean;
  /** Product slugs related to this focus area. */
  products?: string[];
}

export interface CategoryInput {
  slug: string;
  name: string;
  description?: string;
}

export interface ProductInput {
  /** URL: /products/<slug> — lowercase letters, numbers and dashes. */
  slug: string;
  name: string;
  /** One short line, e.g. "Calm, organised browsing." */
  tagline?: string;
  /** One or two sentences for cards and search results. */
  summary: string;
  /** Long description (Markdown). */
  description?: string;
  /** A category slug from `categories`. */
  category?: string;
  platforms?: Platform[];
  /** AVAILABLE (live) · BETA · COMING_SOON · DISCONTINUED */
  stage: ReleaseStage;
  pricing?: PricingModel;
  audience?: string;
  released?: DateInput;
  website?: string;
  /** Main button, e.g. { label: "Add to Chrome", url: "https://chromewebstore.google.com/…" } */
  cta?: { label: string; url: string };
  logo?: ImageInput;
  cover?: ImageInput;
  screenshots?: Array<ImageInput & { caption?: string }>;
  features?: Array<{ title: string; description?: string }>;
  links?: LinkInput[];
  /** Hex colour used for accents, e.g. "#ff6b35". */
  accentColor?: string;
  /** Show on the home page. */
  featured?: boolean;
  seo?: { title?: string; description?: string };
}

export interface ProjectInput {
  /** URL: /projects/<slug> */
  slug: string;
  title: string;
  summary: string;
  /** Long description (Markdown): the challenge, what was built, how. */
  description?: string;
  /** Results or impact (Markdown). Only real, verifiable outcomes. */
  outcome?: string;
  /** Who it was for (a client, partner or "Internal"). */
  client?: string;
  /** IN_PROGRESS · COMPLETED · ONGOING · CONCEPT */
  status: ProjectStatus;
  date?: DateInput;
  /** What we did, e.g. ["Product design", "Chrome extension", "Web app"]. */
  services?: string[];
  cover?: ImageInput;
  images?: Array<ImageInput & { caption?: string }>;
  links?: LinkInput[];
  /** Related product slugs. */
  products?: string[];
  /** Partner slugs from partnerships.ts. */
  partners?: string[];
  accentColor?: string;
  featured?: boolean;
}

export interface PartnerInput {
  slug: string;
  name: string;
  website?: string;
  /** X/Twitter handle without "@". */
  x?: string;
  logo?: ImageInput;
  description?: string;
  /** Network tier on the Partnerships page: 1 (featured) or 2. Omit to list the partner without a tier. */
  tier?: 1 | 2;
  /** How we worked together, e.g. "Ambassador", "KOC Partner", "Launchpad Partner". */
  role?: string;
}

export interface PartnershipInput {
  /** URL: /partnerships/<slug> */
  slug: string;
  title: string;
  summary: string;
  description?: string;
  category: PartnershipCategory;
  date?: DateInput;
  /** Partner slugs, optionally with their role. */
  partners: Array<string | { slug: string; role?: string }>;
  /** Related product slugs. */
  products?: string[];
  cover?: ImageInput;
  /** The public announcement (post, article) — strongly recommended. */
  source?: { url: string; label?: string };
  /** Further link, e.g. the partner's page about it. */
  link?: string;
  featured?: boolean;
}

/** A unit of the company structure: department, studio, division… */
export interface DepartmentInput {
  slug: string;
  name: string;
  description?: string;
  focus?: string[];
  /** Slug of the team member who leads it. */
  lead?: string;
}

export interface TeamMemberInput {
  /** URL: /team/<slug> */
  slug: string;
  name: string;
  position: string;
  /** Department slug (company structure). */
  department?: string;
  leadership?: boolean;
  /** Former team members are listed separately. */
  former?: boolean;
  shortBio?: string;
  /** Markdown. */
  bio?: string;
  responsibilities?: string[];
  expertise?: string[];
  photo?: ImageInput;
  links?: { linkedin?: string; x?: string; telegram?: string; github?: string; website?: string };
  joined?: DateInput;
  /** Give the person their own profile page (default true). */
  profilePage?: boolean;
}

export interface MilestoneInput {
  title: string;
  date: DateInput;
  description?: string;
  kind?: MilestoneKind;
  image?: ImageInput;
  /** Related product slug. */
  product?: string;
  /** Related partnership slug. */
  partnership?: string;
  /** Public record of the milestone (post, listing, article). */
  source?: { url: string; label?: string };
  featured?: boolean;
}
