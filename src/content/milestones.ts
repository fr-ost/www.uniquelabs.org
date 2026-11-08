import type { MilestoneInput } from "./schema";

/**
 * The company journey (timeline). Only verified events, ideally with a public
 * source. Order doesn't matter — the timeline sorts by date. Template:
 *
 * {
 *   title: "First Chrome extension published",
 *   date: "2025-05",                         // "2025", "2025-05" or "2025-05-14"
 *   kind: "LAUNCH",                          // FOUNDING · PRODUCT · LAUNCH · COLLABORATION ·
 *                                            // MILESTONE · PLATFORM · ORGANIZATION · OTHER
 *   description: "One or two sentences.",
 *   product: "my-product",                   // related product slug
 *   source: { url: "https://…", label: "Chrome Web Store" },
 *   featured: true,                          // show on the home page
 * },
 */
export const milestones: MilestoneInput[] = [];
