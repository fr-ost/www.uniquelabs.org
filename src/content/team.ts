import type { DepartmentInput, TeamMemberInput } from "./schema";

/**
 * Company structure: departments, studios or divisions, in display order.
 * They appear on the About and Team pages. Template:
 * { slug: "product", name: "Product", description: "What this team owns.",
 *   focus: ["Research", "Design"], lead: "jane-doe" },
 */
export const departments: DepartmentInput[] = [];

/**
 * Team members. Add only real people, with their consent. Template:
 *
 * {
 *   slug: "jane-doe",                        // → /team/jane-doe
 *   name: "Jane Doe",
 *   position: "Founder",
 *   department: "product",                   // department slug
 *   leadership: true,
 *   shortBio: "One or two sentences.",
 *   bio: "Longer **Markdown** biography.",
 *   expertise: ["Product design"],
 *   photo: { src: "/images/team/jane-doe.jpg", alt: "Jane Doe" },
 *   links: { linkedin: "https://…", x: "https://x.com/…", github: "https://github.com/…" },
 *   joined: "2024",
 * },
 */
export const team: TeamMemberInput[] = [];
