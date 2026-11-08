import type { MetadataRoute } from "next";
import { isIndexable, siteUrl } from "@/lib/env";

/** Production allows crawling; Vercel preview deployments disallow everything. */
export default function robots(): MetadataRoute.Robots {
  const base = siteUrl();
  if (!isIndexable()) {
    return { rules: [{ userAgent: "*", disallow: "/" }] };
  }
  return {
    rules: [{ userAgent: "*", allow: "/" }],
    sitemap: `${base}/sitemap.xml`,
    host: base,
  };
}
