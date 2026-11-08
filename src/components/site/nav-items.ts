export interface NavItem {
  href: string;
  label: string;
  description?: string;
  /** Shows a pulsing "live" dot (real-time sections). */
  live?: boolean;
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
  { href: "/about", label: "About", description: "Who we are and why we exist" },
  { href: "/journey", label: "Our Journey", description: "Verified milestones, in order" },
  { href: "/team", label: "Our Team", description: "The people behind the products" },
  { href: "/collaborations", label: "Collaborations", description: "Work created with partners" },
];

export function primaryNav({ intelligence }: { intelligence: boolean }): NavEntry[] {
  return [
    { href: "/products", label: "Products" },
    ...(intelligence ? [{ href: "/intelligence", label: "Intelligence", live: true }] : []),
    { href: "/what-we-do", label: "What We Do" },
    { label: "Company", items: COMPANY_NAV },
  ];
}

export function footerNav({ intelligence }: { intelligence: boolean }): Array<{ title: string; items: NavItem[] }> {
  return [
    {
      title: "Company",
      items: [
        { href: "/about", label: "About" },
        { href: "/journey", label: "Our Journey" },
        { href: "/team", label: "Our Team" },
        { href: "/contact", label: "Contact" },
      ],
    },
    {
      title: "Work",
      items: [
        { href: "/products", label: "Products" },
        { href: "/what-we-do", label: "What We Do" },
        ...(intelligence ? [{ href: "/intelligence", label: "Market Intelligence" }] : []),
        { href: "/collaborations", label: "Collaborations" },
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
}
