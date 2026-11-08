export const CACHE_TAGS = {
  public: "public",
  company: "company",
  settings: "settings",
  products: "products",
  collaborations: "collaborations",
  team: "team",
  milestones: "milestones",
  capabilities: "capabilities",
  principles: "principles",
  social: "social",
} as const;

export type CacheTag = (typeof CACHE_TAGS)[keyof typeof CACHE_TAGS];
