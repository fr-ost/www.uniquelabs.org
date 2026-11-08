/** Fixed vocabularies used by the content files (src/content). */

export type DatePrecision = "DAY" | "MONTH" | "YEAR";

/** Product lifecycle, shown as a status badge. */
export type ReleaseStage = "AVAILABLE" | "BETA" | "COMING_SOON" | "DISCONTINUED";

export type Platform =
  | "CHROME_EXTENSION"
  | "FIREFOX_ADDON"
  | "EDGE_ADDON"
  | "SAFARI_EXTENSION"
  | "WEB_APP"
  | "WEBSITE"
  | "IOS"
  | "ANDROID"
  | "MACOS"
  | "WINDOWS"
  | "LINUX"
  | "CLI"
  | "API"
  | "OTHER";

export type PricingModel = "UNSPECIFIED" | "FREE" | "FREEMIUM" | "PAID" | "OPEN_SOURCE";

export type LinkKind =
  | "WEBSITE"
  | "STORE_LISTING"
  | "SOURCE_CODE"
  | "DOCUMENTATION"
  | "SUPPORT"
  | "PRIVACY_POLICY"
  | "CHANGELOG"
  | "SOCIAL"
  | "OTHER";

export type PartnershipCategory =
  | "BRAND_PARTNERSHIP"
  | "PRODUCT_INTEGRATION"
  | "CO_CREATION"
  | "SPONSORSHIP"
  | "CAMPAIGN"
  | "COMMUNITY"
  | "CONTRIBUTION"
  | "OTHER";

/** Kept for compatibility with existing components. */
export type CollaborationCategory = PartnershipCategory;

export type ProjectStatus = "IN_PROGRESS" | "COMPLETED" | "ONGOING" | "CONCEPT";

export type TeamMemberType = "CURRENT" | "FORMER";

export type MilestoneKind = "FOUNDING" | "PRODUCT" | "LAUNCH" | "COLLABORATION" | "MILESTONE" | "PLATFORM" | "ORGANIZATION" | "OTHER";

export type SocialPlatform =
  | "X"
  | "LINKEDIN"
  | "GITHUB"
  | "YOUTUBE"
  | "INSTAGRAM"
  | "FACEBOOK"
  | "THREADS"
  | "BLUESKY"
  | "MASTODON"
  | "DISCORD"
  | "TELEGRAM"
  | "MEDIUM"
  | "PRODUCT_HUNT"
  | "CHROME_WEB_STORE"
  | "OTHER";
