import type { MetadataRoute } from "next";
import { getSitemapEntries } from "@/lib/content/public";
import { siteUrl } from "@/lib/env";
import { getIntelligenceSettings } from "@/lib/market/service";

export const dynamic = "force-dynamic";

const STATIC_ROUTES: Array<{ path: string; priority: number; changeFrequency: "weekly" | "monthly" | "yearly" }> = [
  { path: "/", priority: 1, changeFrequency: "weekly" },
  { path: "/products", priority: 0.9, changeFrequency: "weekly" },
  { path: "/what-we-do", priority: 0.8, changeFrequency: "monthly" },
  { path: "/about", priority: 0.8, changeFrequency: "monthly" },
  { path: "/collaborations", priority: 0.7, changeFrequency: "monthly" },
  { path: "/journey", priority: 0.6, changeFrequency: "monthly" },
  { path: "/team", priority: 0.6, changeFrequency: "monthly" },
  { path: "/contact", priority: 0.5, changeFrequency: "yearly" },
  { path: "/privacy", priority: 0.2, changeFrequency: "yearly" },
  { path: "/terms", priority: 0.2, changeFrequency: "yearly" },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = siteUrl();
  const [entries, intelligence] = await Promise.all([getSitemapEntries(), getIntelligenceSettings()]);
  return [
    ...STATIC_ROUTES.map((route) => ({
      url: `${base}${route.path === "/" ? "" : route.path}`,
      changeFrequency: route.changeFrequency,
      priority: route.priority,
    })),
    ...(intelligence.enabled ? [{ url: `${base}/intelligence`, changeFrequency: "hourly" as const, priority: 0.8 }] : []),
    ...entries.products.map((p) => ({
      url: `${base}/products/${p.slug}`,
      lastModified: p.updatedAt,
      changeFrequency: "monthly" as const,
      priority: 0.8,
    })),
    ...entries.collaborations.map((c) => ({
      url: `${base}/collaborations/${c.slug}`,
      lastModified: c.updatedAt,
      changeFrequency: "yearly" as const,
      priority: 0.5,
    })),
    ...entries.team.map((t) => ({
      url: `${base}/team/${t.slug}`,
      lastModified: t.updatedAt,
      changeFrequency: "yearly" as const,
      priority: 0.4,
    })),
  ];
}
