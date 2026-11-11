import type { Metadata } from "next";
import type { ReactNode } from "react";
import { MotionProvider } from "@/components/motion/motion-provider";
import { SiteFooter } from "@/components/site/site-footer";
import { SiteHeader } from "@/components/site/site-header";
import { getCompany, getSettings, getSocialLinks } from "@/lib/content/public";
import { isIndexable, siteUrl } from "@/lib/env";

export async function generateMetadata(): Promise<Metadata> {
  const [settings, company] = await Promise.all([getSettings(), getCompany()]);
  // Only production is indexed; Vercel preview deployments are not.
  const indexable = settings.allowIndexing && isIndexable();
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
  const [company, socials] = await Promise.all([getCompany(), getSocialLinks()]);

  return (
    <MotionProvider>
      <div aria-hidden className="scroll-progress" />
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
    </MotionProvider>
  );
}
