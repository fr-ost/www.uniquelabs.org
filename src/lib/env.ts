/**
 * The only runtime setting: the public URL of the site, used for canonical
 * links, the sitemap and social share images. Defaults to the production URL.
 */
export function siteUrl(): string {
  return (process.env.SITE_URL ?? process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.uniquelabs.org").replace(/\/+$/, "");
}

/** Vercel preview deployments (and any non-production build) must not be indexed. */
export function isIndexable(): boolean {
  const vercelEnv = process.env.VERCEL_ENV;
  return vercelEnv === undefined || vercelEnv === "production";
}
