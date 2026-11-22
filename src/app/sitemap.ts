import type { MetadataRoute } from "next";
import { getProjects, getSitemapEntries } from "@/lib/content/public";
import { siteUrl } from "@/lib/env";
import { lastModified } from "@/lib/seo/last-modified";

type Freq = "weekly" | "monthly" | "yearly";

/** Each page with the files its content comes from (for <lastmod>). */
const STATIC_ROUTES: Array<{ path: string; priority: number; changeFrequency: Freq; sources: string[] }> = [
  { path: "/", priority: 1, changeFrequency: "weekly", sources: ["src/app/(site)/page.tsx", "src/content"] },
  { path: "/services", priority: 0.9, changeFrequency: "monthly", sources: ["src/app/(site)/services", "src/content/capabilities.ts"] },
  { path: "/products", priority: 0.9, changeFrequency: "weekly", sources: ["src/app/(site)/products/page.tsx", "src/content/products.ts"] },
  { path: "/partnerships", priority: 0.8, changeFrequency: "monthly", sources: ["src/app/(site)/partnerships/page.tsx", "src/content/partnerships.ts"] },
  { path: "/about", priority: 0.8, changeFrequency: "monthly", sources: ["src/app/(site)/about", "src/content/company.ts"] },
  { path: "/team", priority: 0.6, changeFrequency: "monthly", sources: ["src/app/(site)/team/page.tsx", "src/content/team.ts"] },
  { path: "/journey", priority: 0.6, changeFrequency: "monthly", sources: ["src/app/(site)/journey", "src/content/milestones.ts"] },
  { path: "/contact", priority: 0.5, changeFrequency: "yearly", sources: ["src/app/(site)/contact", "src/content/company.ts", "src/content/team.ts"] },
  { path: "/privacy", priority: 0.2, changeFrequency: "yearly", sources: ["src/content/site.ts"] },
  { path: "/terms", priority: 0.2, changeFrequency: "yearly", sources: ["src/content/site.ts"] },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = siteUrl();
  const [entries, projects] = await Promise.all([getSitemapEntries(), getProjects()]);
  const withDate = (sources: string[]) => {
    const date = lastModified(...sources);
    return date ? { lastModified: date } : {};
  };
  const detail = (section: string, slugs: string[], priority: number, sources: string[]) =>
    slugs.map((slug) => ({
      url: `${base}/${section}/${slug}`,
      changeFrequency: "monthly" as const,
      priority,
      ...withDate(sources),
    }));
  return [
    ...STATIC_ROUTES.map((route) => ({
      url: `${base}${route.path === "/" ? "" : route.path}`,
      changeFrequency: route.changeFrequency,
      priority: route.priority,
      ...withDate(route.sources),
    })),
    // /projects is listed (and indexable) only once it has case studies.
    ...(projects.length > 0
      ? [{ url: `${base}/projects`, changeFrequency: "weekly" as const, priority: 0.8, ...withDate(["src/content/projects.ts"]) }]
      : []),
    ...detail("services", entries.services, 0.9, ["src/app/(site)/services/[slug]", "src/content/service-pages.ts"]),
    ...detail("products", entries.products, 0.8, ["src/app/(site)/products/[slug]", "src/content/products.ts"]),
    ...detail("projects", entries.projects, 0.8, ["src/app/(site)/projects/[slug]", "src/content/projects.ts"]),
    ...detail("partnerships", entries.partnerships, 0.6, ["src/content/partnerships.ts"]),
    ...detail("team", entries.team, 0.5, ["src/app/(site)/team/[slug]", "src/content/team.ts"]),
  ];
}
