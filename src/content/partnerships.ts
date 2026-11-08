import type { PartnerInput, PartnershipInput } from "./schema";

/**
 * Partners (organisations and people we work with). Template:
 * { slug: "acme", name: "Acme", website: "https://acme.example", x: "acme",
 *   logo: { src: "/images/partners/acme.svg", alt: "Acme", width: 240, height: 80 },
 *   description: "One line about the partner." },
 */
export const partners: PartnerInput[] = [];

/**
 * Partnerships and collaborations, in display order. Link each one to its
 * public announcement. Template:
 *
 * {
 *   slug: "acme-integration",                // → /partnerships/acme-integration
 *   title: "Integration with Acme",
 *   summary: "One or two sentences.",
 *   description: "Longer **Markdown** description.",
 *   category: "PRODUCT_INTEGRATION",         // BRAND_PARTNERSHIP · PRODUCT_INTEGRATION · CO_CREATION ·
 *                                            // SPONSORSHIP · CAMPAIGN · COMMUNITY · CONTRIBUTION · OTHER
 *   date: "2025-11",
 *   partners: ["acme"],                      // or [{ slug: "acme", role: "Integration partner" }]
 *   products: ["my-product"],
 *   source: { url: "https://x.com/…/status/…", label: "Announcement on X" },
 *   featured: true,
 * },
 */
export const partnerships: PartnershipInput[] = [];
