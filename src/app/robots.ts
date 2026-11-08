import type { MetadataRoute } from "next";
import { headers } from "next/headers";
import { getSettings } from "@/lib/content/public";
import { siteUrl } from "@/lib/env";

export const dynamic = "force-dynamic";

export default async function robots(): Promise<MetadataRoute.Robots> {
  const base = siteUrl();
  const settings = await getSettings();
  const host = (await headers()).get("host");
  const canonicalHost = new URL(base).host;
  const nonCanonical = process.env.NODE_ENV === "production" && host !== null && host !== canonicalHost;

  if (!settings.allowIndexing || nonCanonical) {
    return { rules: [{ userAgent: "*", disallow: "/" }] };
  }
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: ["/admin", "/api/"] }],
    sitemap: `${base}/sitemap.xml`,
    host: base,
  };
}
