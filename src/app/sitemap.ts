import type { MetadataRoute } from "next";
import { getSitemapEntries } from "@/lib/content/public";
import { siteUrl } from "@/lib/env";

const STATIC_ROUTES: Array<{ path: string; priority: number; changeFrequency: "weekly" | "monthly" | "yearly" }> = [
  { path: "/", priority: 1, changeFrequency: "weekly" },
  { path: "/products", priority: 0.9, changeFrequency: "weekly" },
  { path: "/projects", priority: 0.9, changeFrequency: "weekly" },
  { path: "/partnerships", priority: 0.8, changeFrequency: "monthly" },
  { path: "/about", priority: 0.8, changeFrequency: "monthly" },
  { path: "/services", priority: 0.9, changeFrequency: "monthly" },
  { path: "/team", priority: 0.6, changeFrequency: "monthly" },
  { path: "/journey", priority: 0.6, changeFrequency: "monthly" },
  { path: "/contact", priority: 0.5, changeFrequency: "yearly" },
  { path: "/privacy", priority: 0.2, changeFrequency: "yearly" },
  { path: "/terms", priority: 0.2, changeFrequency: "yearly" },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = siteUrl();
  const entries = await getSitemapEntries();
  const detail = (section: string, slugs: string[], priority: number) =>
    slugs.map((slug) => ({ url: `${base}/${section}/${slug}`, changeFrequency: "monthly" as const, priority }));
  return [
    ...STATIC_ROUTES.map((route) => ({
      url: `${base}${route.path === "/" ? "" : route.path}`,
      changeFrequency: route.changeFrequency,
      priority: route.priority,
    })),
    ...detail("products", entries.products, 0.8),
    ...detail("projects", entries.projects, 0.8),
    ...detail("partnerships", entries.partnerships, 0.6),
    ...detail("team", entries.team, 0.5),
  ];
}
