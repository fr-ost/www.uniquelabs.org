export interface NavItem {
  href: string;
  label: string;
  description?: string;
}

export interface NavGroup {
  label: string;
  items: NavItem[];
}

export type NavEntry = NavItem | NavGroup;

export function isGroup(entry: NavEntry): entry is NavGroup {
  return "items" in entry;
}

export const COMPANY_NAV: NavItem[] = [
  { href: "/about", label: "About", description: "Who we are, why we exist, how we're organised" },
  { href: "/team", label: "Team", description: "The people and teams behind our work" },
  { href: "/journey", label: "Journey", description: "Milestones, in order" },
  { href: "/what-we-do", label: "What We Do", description: "Our areas of focus" },
];

export const PRIMARY_NAV: NavEntry[] = [
  { href: "/products", label: "Products" },
  { href: "/projects", label: "Projects" },
  { href: "/partnerships", label: "Partnerships" },
  { label: "Company", items: COMPANY_NAV },
];

export const FOOTER_NAV: Array<{ title: string; items: NavItem[] }> = [
  {
    title: "Work",
    items: [
      { href: "/products", label: "Products" },
      { href: "/projects", label: "Projects" },
      { href: "/partnerships", label: "Partnerships" },
      { href: "/what-we-do", label: "What We Do" },
    ],
  },
  {
    title: "Company",
    items: [
      { href: "/about", label: "About" },
      { href: "/team", label: "Team" },
      { href: "/journey", label: "Journey" },
      { href: "/contact", label: "Contact" },
    ],
  },
  {
    title: "Legal",
    items: [
      { href: "/privacy", label: "Privacy Policy" },
      { href: "/terms", label: "Terms of Use" },
    ],
  },
];
