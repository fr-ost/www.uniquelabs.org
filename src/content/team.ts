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
 *   links: { telegram: "https://t.me/…", linkedin: "https://…", x: "https://x.com/…", github: "https://github.com/…" },
 *   joined: "2024",
 * },
 */
export const team: TeamMemberInput[] = [
  {
    slug: "abrar-hamim",
    name: "Abrar Hamim",
    position: "Founder & CEO",
    leadership: true,
    photo: { src: "/images/team/abrar-hamim.webp", alt: "Abrar Hamim, Founder & CEO at Unique Labs", width: 512, height: 512 },
    links: { x: "https://x.com/AbrarTheCrypto_", telegram: "https://t.me/abrarthecrypto" },
  },
  {
    slug: "shahriar-ahmed",
    name: "Shahriar Ahmed",
    position: "Co-Founder & COO",
    leadership: true,
    photo: { src: "/images/team/shahriar-ahmed.webp", alt: "Shahriar Ahmed, Co-Founder & COO at Unique Labs", width: 512, height: 512 },
    links: { x: "https://x.com/0x_nation", telegram: "https://t.me/igfrostt" },
  },
  {
    slug: "nazrul-islam-jibon",
    name: "Nazrul Islam Jibon",
    position: "Head of Growth & Strategy",
    leadership: true,
    photo: { src: "/images/team/nazrul-islam-jibon.webp", alt: "Nazrul Islam Jibon, Head of Growth & Strategy at Unique Labs", width: 512, height: 512 },
    links: { x: "https://x.com/Just_Jibon", telegram: "https://t.me/JustJibon" },
  },
  {
    slug: "mahfuz-allum",
    name: "Mahfuz Allum",
    position: "Head of Partnerships & PR",
    leadership: true,
    photo: { src: "/images/team/mahfuz-allum.webp", alt: "Mahfuz Allum, Head of Partnerships & PR at Unique Labs", width: 512, height: 512 },
    links: { x: "https://x.com/mahfuzxallum", telegram: "https://t.me/mahfuzallum" },
  },
  {
    slug: "abrar-hossain-ayan",
    name: "Abrar Hossain Ayan",
    position: "Head of Marketing & BD",
    leadership: true,
    photo: { src: "/images/team/abrar-hossain-ayan.webp", alt: "Abrar Hossain Ayan, Head of Marketing & BD at Unique Labs", width: 800, height: 800 },
    links: { x: "https://x.com/AbrarLegit", telegram: "https://t.me/AbrarLegit" },
  },
];
