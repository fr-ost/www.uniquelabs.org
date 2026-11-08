import type { Metadata } from "next";
import { headers } from "next/headers";
import type { ReactNode } from "react";
import { MotionProvider } from "@/components/motion/motion-provider";
import { SiteFooter } from "@/components/site/site-footer";
import { SiteHeader } from "@/components/site/site-header";
import { getCompany, getPlaceholderCount, getSettings, getSocialLinks, isPreviewRequest } from "@/lib/content/public";
import { placeholdersVisible, siteUrl } from "@/lib/env";

// Public pages render at request time from cached data: no database access
// is needed at build time, and admin edits appear immediately.
export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const [settings, company] = await Promise.all([getSettings(), getCompany()]);
  const host = (await headers()).get("host");
  const canonicalHost = new URL(siteUrl()).host;
  // Only the canonical production host is ever indexed (keeps staging,
  // preview and apex/www duplicates out of search results).
  const indexable =
    settings.allowIndexing && (process.env.NODE_ENV !== "production" || host === null || host === canonicalHost);
  return {
    title: { default: settings.seoTitleDefault, template: settings.seoTitleTemplate },
    description: settings.seoDescription,
    keywords: settings.seoKeywords,
    authors: [{ name: company.name, url: siteUrl() }],
    creator: company.name,
    publisher: company.name,
    openGraph: {
      type: "website",
      siteName: company.name,
      locale: "en_US",
      title: settings.seoTitleDefault,
      description: settings.seoDescription,
      images: [
        settings.ogImage
          ? { url: settings.ogImage.url, alt: company.name }
          : { url: "/og/home", width: 1200, height: 630, alt: company.name },
      ],
    },
    twitter: {
      card: "summary_large_image",
      ...(settings.twitterHandle ? { site: settings.twitterHandle, creator: settings.twitterHandle } : {}),
    },
    robots: indexable
      ? { index: true, follow: true, googleBot: { index: true, follow: true, "max-image-preview": "large" } }
      : { index: false, follow: false },
    verification: {
      ...(settings.googleSiteVerification ? { google: settings.googleSiteVerification } : {}),
      ...(settings.bingSiteVerification ? { other: { "msvalidate.01": settings.bingSiteVerification } } : {}),
    },
  };
}

export default async function SiteLayout({ children }: { children: ReactNode }) {
  const [company, socials, preview, placeholderCount] = await Promise.all([
    getCompany(),
    getSocialLinks(),
    isPreviewRequest(),
    getPlaceholderCount(),
  ]);
  const showSamples = placeholdersVisible() && placeholderCount > 0;

  return (
    <MotionProvider>
      <a
        href="#main"
        className="sr-only z-[100] rounded-full bg-ink-50 px-4 py-2 text-sm font-medium text-ink-950 focus:not-sr-only focus:fixed focus:left-4 focus:top-4"
      >
        Skip to content
      </a>
      <SiteHeader companyName={company.name} socials={socials.map((s) => ({ label: s.label, url: s.url }))} />
      <main id="main" className="relative">
        {children}
      </main>
      <SiteFooter company={company} socials={socials} siteUrl={siteUrl()} />

      {preview || showSamples ? (
        <div className="fixed bottom-4 left-1/2 z-[60] flex -translate-x-1/2 flex-wrap items-center justify-center gap-2 px-4">
          {preview ? (
            <div className="flex items-center gap-3 rounded-full border border-signal-500/40 bg-ink-950/90 py-2 pr-2 pl-4 text-xs text-ink-100 shadow-2xl backdrop-blur">
              <span className="h-1.5 w-1.5 animate-pulse-soft rounded-full bg-signal-500" aria-hidden />
              Preview mode — drafts are visible
              <a
                href="/api/admin/preview/exit"
                className="rounded-full bg-ink-50 px-3 py-1 font-medium text-ink-950 hover:bg-white"
              >
                Exit
              </a>
            </div>
          ) : null}
          {showSamples ? (
            <div className="whitespace-nowrap rounded-full border border-dashed border-beta/50 bg-ink-950/90 px-4 py-2 font-mono text-[0.625rem] uppercase tracking-[0.14em] text-beta backdrop-blur">
              <span className="sm:hidden">Dev build · samples hidden in prod</span>
              <span className="hidden sm:inline">Development build · sample content is hidden in production</span>
            </div>
          ) : null}
        </div>
      ) : null}
    </MotionProvider>
  );
}
