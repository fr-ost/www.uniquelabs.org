import type {
  CollaborationCategory,
  LinkKind,
  MilestoneKind,
  Platform,
  PricingModel,
  ProjectStatus,
  ReleaseStage,
  SocialPlatform,
} from "@/lib/content/enums";

export const PLATFORM_LABELS: Record<Platform, string> = {
  CHROME_EXTENSION: "Chrome extension",
  FIREFOX_ADDON: "Firefox add-on",
  EDGE_ADDON: "Edge add-on",
  SAFARI_EXTENSION: "Safari extension",
  WEB_APP: "Web app",
  WEBSITE: "Website",
  IOS: "iOS",
  ANDROID: "Android",
  MACOS: "macOS",
  WINDOWS: "Windows",
  LINUX: "Linux",
  CLI: "Command line",
  API: "API",
  OTHER: "Other",
};

export const RELEASE_STAGE_LABELS: Record<ReleaseStage, string> = {
  AVAILABLE: "Live",
  BETA: "Beta",
  COMING_SOON: "Coming soon",
  DISCONTINUED: "Archived",
};

export const PRICING_LABELS: Record<PricingModel, string> = {
  UNSPECIFIED: "Not specified",
  FREE: "Free",
  FREEMIUM: "Free with optional upgrades",
  PAID: "Paid",
  OPEN_SOURCE: "Open source",
};

export const LINK_KIND_LABELS: Record<LinkKind, string> = {
  WEBSITE: "Website",
  STORE_LISTING: "Store listing",
  SOURCE_CODE: "Source code",
  DOCUMENTATION: "Documentation",
  SUPPORT: "Support",
  PRIVACY_POLICY: "Privacy policy",
  CHANGELOG: "Changelog",
  SOCIAL: "Social",
  OTHER: "Link",
};

export const COLLABORATION_CATEGORY_LABELS: Record<CollaborationCategory, string> = {
  BRAND_PARTNERSHIP: "Brand partnership",
  PRODUCT_INTEGRATION: "Product integration",
  CO_CREATION: "Co-created project",
  SPONSORSHIP: "Sponsorship",
  CAMPAIGN: "Campaign",
  COMMUNITY: "Community partnership",
  CONTRIBUTION: "Contribution",
  OTHER: "Collaboration",
};

export const PROJECT_STATUS_LABELS: Record<ProjectStatus, string> = {
  IN_PROGRESS: "In progress",
  COMPLETED: "Completed",
  ONGOING: "Ongoing",
  CONCEPT: "Concept",
};

export const MILESTONE_KIND_LABELS: Record<MilestoneKind, string> = {
  FOUNDING: "Founding",
  PRODUCT: "Product",
  LAUNCH: "Launch",
  COLLABORATION: "Collaboration",
  MILESTONE: "Milestone",
  PLATFORM: "Platform",
  ORGANIZATION: "Organization",
  OTHER: "Update",
};

export const SOCIAL_PLATFORM_LABELS: Record<SocialPlatform, string> = {
  X: "X (Twitter)",
  LINKEDIN: "LinkedIn",
  GITHUB: "GitHub",
  YOUTUBE: "YouTube",
  INSTAGRAM: "Instagram",
  FACEBOOK: "Facebook",
  THREADS: "Threads",
  BLUESKY: "Bluesky",
  MASTODON: "Mastodon",
  DISCORD: "Discord",
  TELEGRAM: "Telegram",
  MEDIUM: "Medium",
  PRODUCT_HUNT: "Product Hunt",
  CHROME_WEB_STORE: "Chrome Web Store",
  OTHER: "Website",
};

/** Curated icon names usable for capabilities (rendered via lucide-react). */
export const CAPABILITY_ICONS = [
  "puzzle",
  "globe",
  "app-window",
  "zap",
  "code",
  "flask",
  "pen-tool",
  "shield",
  "layers",
  "cpu",
  "compass",
  "sparkles",
  "lock",
  "gauge",
  "boxes",
  "workflow",
] as const;

export type CapabilityIcon = (typeof CAPABILITY_ICONS)[number];
