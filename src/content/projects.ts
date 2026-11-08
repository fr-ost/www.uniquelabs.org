import type { ProjectInput } from "./schema";

/**
 * Projects and work (case studies), in display order. Add only real work,
 * with real outcomes. Template:
 *
 * {
 *   slug: "my-project",                      // → /projects/my-project
 *   title: "My Project",
 *   summary: "One or two sentences for cards.",
 *   description: "What the challenge was and what we built (**Markdown**).",
 *   outcome: "Verifiable results (Markdown).",
 *   client: "Client name, partner or Internal",
 *   status: "COMPLETED",                     // IN_PROGRESS · COMPLETED · ONGOING · CONCEPT
 *   date: "2025-09",
 *   services: ["Product design", "Chrome extension"],
 *   cover: { src: "/images/projects/my-project/cover.png", alt: "…" },
 *   images: [{ src: "/images/projects/my-project/1.png", caption: "…" }],
 *   links: [{ label: "Live site", url: "https://…" }],
 *   products: ["my-product"],                // product slugs
 *   partners: ["partner-slug"],              // partner slugs from partnerships.ts
 *   featured: true,
 * },
 */
export const projects: ProjectInput[] = [];
