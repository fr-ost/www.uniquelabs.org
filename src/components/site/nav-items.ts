export interface NavItem {
  href: string;
  label: string;
}

export const PRIMARY_NAV: NavItem[] = [
  { href: "/products", label: "Products" },
  { href: "/what-we-do", label: "What We Do" },
  { href: "/collaborations", label: "Collaborations" },
  { href: "/journey", label: "Journey" },
  { href: "/team", label: "Team" },
  { href: "/about", label: "About" },
];

export const FOOTER_NAV: Array<{ title: string; items: NavItem[] }> = [
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
