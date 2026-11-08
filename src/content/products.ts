import type { CategoryInput, ProductInput } from "./schema";

/** Product categories (shown as filters once a product uses them). */
export const categories: CategoryInput[] = [
  { slug: "browser-extensions", name: "Browser Extensions" },
  { slug: "web-applications", name: "Web Applications" },
  { slug: "productivity", name: "Productivity" },
  { slug: "utilities", name: "Utilities" },
];

/**
 * Products, in display order. Add only real products. Template:
 *
 * {
 *   slug: "my-product",                      // → /products/my-product
 *   name: "My Product",
 *   tagline: "One short line.",
 *   summary: "One or two sentences for cards.",
 *   description: "Longer **Markdown** description.",
 *   category: "browser-extensions",
 *   platforms: ["CHROME_EXTENSION", "EDGE_ADDON"],
 *   stage: "AVAILABLE",                      // AVAILABLE · BETA · COMING_SOON · DISCONTINUED
 *   pricing: "FREE",                         // FREE · FREEMIUM · PAID · OPEN_SOURCE · UNSPECIFIED
 *   released: "2025-06",
 *   cta: { label: "Add to Chrome", url: "https://chromewebstore.google.com/detail/…" },
 *   website: "https://…",
 *   logo: { src: "/images/products/my-product/logo.png", alt: "My Product logo", width: 256, height: 256 },
 *   cover: { src: "/images/products/my-product/cover.png", alt: "My Product screenshot" },
 *   screenshots: [{ src: "/images/products/my-product/1.png", caption: "Main view" }],
 *   features: [{ title: "Works offline", description: "…" }],
 *   links: [{ kind: "PRIVACY_POLICY", url: "https://…" }],
 *   accentColor: "#ff6b35",
 *   featured: true,
 * },
 */
export const products: ProductInput[] = [];
