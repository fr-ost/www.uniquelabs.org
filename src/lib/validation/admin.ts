import { z } from "zod";
import {
  checkbox,
  hexColor,
  jsonList,
  mediaId,
  optionalDate,
  optionalEmail,
  optionalText,
  optionalUrl,
  requiredText,
  slugInput,
  sortOrder,
  stringList,
} from "@/lib/validation/fields";

const PUBLISH = ["DRAFT", "PUBLISHED", "ARCHIVED"] as const;
const PRECISION = ["DAY", "MONTH", "YEAR"] as const;
export const PLATFORMS = [
  "CHROME_EXTENSION",
  "FIREFOX_ADDON",
  "EDGE_ADDON",
  "SAFARI_EXTENSION",
  "WEB_APP",
  "WEBSITE",
  "IOS",
  "ANDROID",
  "MACOS",
  "WINDOWS",
  "LINUX",
  "CLI",
  "API",
  "OTHER",
] as const;
export const STAGES = ["AVAILABLE", "BETA", "COMING_SOON", "DISCONTINUED"] as const;
export const PRICING = ["UNSPECIFIED", "FREE", "FREEMIUM", "PAID", "OPEN_SOURCE"] as const;
export const LINK_KINDS = [
  "WEBSITE",
  "STORE_LISTING",
  "SOURCE_CODE",
  "DOCUMENTATION",
  "SUPPORT",
  "PRIVACY_POLICY",
  "CHANGELOG",
  "SOCIAL",
  "OTHER",
] as const;
export const COLLAB_CATEGORIES = [
  "BRAND_PARTNERSHIP",
  "PRODUCT_INTEGRATION",
  "CO_CREATION",
  "SPONSORSHIP",
  "CAMPAIGN",
  "COMMUNITY",
  "CONTRIBUTION",
  "OTHER",
] as const;
export const MILESTONE_KINDS = [
  "FOUNDING",
  "PRODUCT",
  "LAUNCH",
  "COLLABORATION",
  "MILESTONE",
  "PLATFORM",
  "ORGANIZATION",
  "OTHER",
] as const;
export const SOCIAL_PLATFORMS = [
  "X",
  "LINKEDIN",
  "GITHUB",
  "YOUTUBE",
  "INSTAGRAM",
  "FACEBOOK",
  "THREADS",
  "BLUESKY",
  "MASTODON",
  "DISCORD",
  "TELEGRAM",
  "MEDIUM",
  "PRODUCT_HUNT",
  "CHROME_WEB_STORE",
  "OTHER",
] as const;

const urlItem = z.string().trim().max(2048).refine((value) => {
  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:";
  } catch {
    return false;
  }
}, "Each link needs a full https:// URL.");

export const productSchema = z.object({
  name: requiredText(120, "Give the product a name."),
  slug: slugInput,
  tagline: optionalText(160),
  summary: requiredText(320, "Add a short description (shown on cards)."),
  description: optionalText(20000),
  audience: optionalText(1000),
  categoryId: optionalText(40),
  platforms: z.array(z.enum(PLATFORMS)).max(PLATFORMS.length),
  stage: z.enum(STAGES),
  pricing: z.enum(PRICING),
  websiteUrl: optionalUrl,
  primaryCtaUrl: optionalUrl,
  primaryCtaLabel: optionalText(40),
  releaseDate: optionalDate,
  releaseDatePrecision: z.enum(PRECISION),
  releaseDateVerified: checkbox,
  accentColor: hexColor,
  logoId: mediaId,
  coverId: mediaId,
  seoTitle: optionalText(70),
  seoDescription: optionalText(170),
  featured: checkbox,
  verified: checkbox,
  status: z.enum(PUBLISH),
  features: jsonList(
    z.object({ title: z.string().trim().min(1, "Every feature needs a title.").max(120), description: z.string().trim().max(400).optional().default("") }),
    24,
  ),
  links: jsonList(
    z.object({ kind: z.enum(LINK_KINDS), label: z.string().trim().min(1, "Every link needs a label.").max(60), url: urlItem }),
    20,
  ),
  images: jsonList(
    z.object({ mediaId: z.string().regex(/^[A-Za-z0-9_-]{10,40}$/), caption: z.string().trim().max(160).optional().default("") }),
    24,
  ),
});
export type ProductInput = z.infer<typeof productSchema>;

export const collaborationSchema = z.object({
  title: requiredText(160, "Give the collaboration a title."),
  slug: slugInput,
  summary: requiredText(400, "Add a short summary."),
  description: optionalText(20000),
  category: z.enum(COLLAB_CATEGORIES),
  date: optionalDate,
  datePrecision: z.enum(PRECISION),
  sourceUrl: optionalUrl,
  sourceLabel: optionalText(60),
  externalUrl: optionalUrl,
  coverId: mediaId,
  featured: checkbox,
  verified: checkbox,
  status: z.enum(PUBLISH),
  partnerIds: z.array(z.string().regex(/^[a-z0-9]{10,40}$/)).max(12),
  productIds: z.array(z.string().regex(/^[a-z0-9]{10,40}$/)).max(24),
});
export type CollaborationInput = z.infer<typeof collaborationSchema>;

export const partnerSchema = z.object({
  name: requiredText(120, "Enter the partner's name."),
  slug: slugInput,
  description: optionalText(1000),
  websiteUrl: optionalUrl,
  xHandle: z
    .string()
    .trim()
    .optional()
    .transform((value) => (value ? value.replace(/^@/, "").replace(/^https?:\/\/(x|twitter)\.com\//i, "").slice(0, 30) : null))
    .refine((value) => value === null || /^[A-Za-z0-9_]{1,30}$/.test(value), "Enter a valid X handle."),
  logoId: mediaId,
});

export const teamMemberSchema = z.object({
  name: requiredText(120, "Enter the person's full name."),
  slug: slugInput,
  position: requiredText(120, "Enter their position."),
  shortBio: optionalText(400),
  bio: optionalText(10000),
  responsibilities: stringList(20, 160),
  expertise: stringList(20, 60),
  photoId: mediaId,
  linkedinUrl: optionalUrl,
  xUrl: optionalUrl,
  githubUrl: optionalUrl,
  websiteUrl: optionalUrl,
  joinDate: optionalDate,
  joinDatePrecision: z.enum(PRECISION),
  joinDateVerified: checkbox,
  memberType: z.enum(["CURRENT", "FORMER"]),
  isLeadership: checkbox,
  hasProfilePage: checkbox,
  groupId: optionalText(40),
  status: z.enum(PUBLISH),
});

export const milestoneSchema = z.object({
  title: requiredText(160, "Give the milestone a title."),
  slug: slugInput,
  description: optionalText(2000),
  date: optionalDate.refine((value) => value !== null, "A date is required."),
  datePrecision: z.enum(PRECISION),
  kind: z.enum(MILESTONE_KINDS),
  imageId: mediaId,
  productId: optionalText(40),
  collaborationId: optionalText(40),
  sourceUrl: optionalUrl,
  sourceLabel: optionalText(60),
  featured: checkbox,
  verified: checkbox,
  status: z.enum(PUBLISH),
});

export const capabilitySchema = z.object({
  title: requiredText(120, "Give the focus area a title."),
  slug: slugInput,
  summary: requiredText(300, "Add a one-sentence summary."),
  description: optionalText(5000),
  icon: z.string().trim().max(40).default("sparkles"),
  featured: checkbox,
  status: z.enum(PUBLISH),
  productIds: z.array(z.string().regex(/^[a-z0-9]{10,40}$/)).max(24),
});

export const principleSchema = z.object({
  title: requiredText(80, "Give the principle a short title."),
  description: requiredText(400, "Describe the principle in a sentence."),
  status: z.enum(PUBLISH),
});

export const categorySchema = z.object({
  name: requiredText(60, "Enter a category name."),
  slug: slugInput,
  description: optionalText(400),
});

export const teamGroupSchema = z.object({
  name: requiredText(60, "Enter a group name."),
  slug: slugInput,
  description: optionalText(400),
});

export const socialLinkSchema = z.object({
  platform: z.enum(SOCIAL_PLATFORMS),
  label: optionalText(40),
  url: optionalUrl.refine((value) => value !== null, "A URL is required."),
  visible: checkbox,
});

export const companySchema = z.object({
  name: requiredText(80, "The company name is required."),
  legalName: optionalText(120),
  tagline: optionalText(160),
  shortDescription: requiredText(400, "Add a short description."),
  heroEyebrow: optionalText(80),
  heroHeadline: requiredText(120, "The homepage headline is required."),
  heroDescription: requiredText(400, "The homepage description is required."),
  primaryCtaLabel: requiredText(40),
  secondaryCtaLabel: requiredText(40),
  introHeading: optionalText(160),
  introBody: optionalText(2000),
  whoWeAre: optionalText(10000),
  whyWeExist: optionalText(10000),
  mission: optionalText(1000),
  vision: optionalText(1000),
  philosophyIntro: optionalText(600),
  approach: optionalText(10000),
  longTermDirection: optionalText(10000),
  whatWeDoIntro: optionalText(1000),
  closingHeadline: optionalText(200),
  closingBody: optionalText(400),
  foundedDate: optionalDate,
  foundedDatePrecision: z.enum(PRECISION),
  foundedDateVerified: checkbox,
  logoId: mediaId,
});

export const contactInfoSchema = z.object({
  contactIntro: optionalText(600),
  contactEmail: optionalEmail,
  generalEmail: optionalEmail,
  businessEmail: optionalEmail,
  partnershipEmail: optionalEmail,
  pressEmail: optionalEmail,
  country: optionalText(80),
  addressLine1: optionalText(160),
  addressLine2: optionalText(160),
  city: optionalText(80),
  region: optionalText(80),
  postalCode: optionalText(20),
  showAddress: checkbox,
  contactFormEnabled: checkbox,
});

export const seoSchema = z.object({
  seoTitleDefault: requiredText(80, "A default title is required."),
  seoTitleTemplate: requiredText(80).refine((value) => value.includes("%s"), "The template must contain %s."),
  seoDescription: requiredText(200, "A default description is required."),
  seoKeywords: stringList(20, 60),
  twitterHandle: z
    .string()
    .trim()
    .optional()
    .transform((value) => (value ? `@${value.replace(/^@/, "")}` : null))
    .refine((value) => value === null || /^@[A-Za-z0-9_]{1,30}$/.test(value), "Enter a valid X handle."),
  allowIndexing: checkbox,
  googleSiteVerification: optionalText(120),
  bingSiteVerification: optionalText(120),
  ogImageId: mediaId,
});

export const legalSchema = z.object({
  privacyPolicy: requiredText(60000, "The privacy policy cannot be empty."),
  privacyUpdatedAt: optionalDate,
  termsOfUse: requiredText(60000, "The terms of use cannot be empty."),
  termsUpdatedAt: optionalDate,
});

export { sortOrder };
