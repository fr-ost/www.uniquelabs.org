import { absoluteUrl } from "@/lib/seo/metadata";
import type { CompanyDTO, ProductDetailDTO, SocialLinkDTO, TeamMemberDTO } from "@/lib/content/types";
import { PLATFORM_LABELS } from "@/lib/labels";

type JsonLd = Record<string, unknown>;

export function organizationJsonLd(company: CompanyDTO, socials: SocialLinkDTO[]): JsonLd {
  const email = company.contact.contactEmail ?? company.contact.generalEmail;
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": absoluteUrl("/#organization"),
    name: company.name,
    url: absoluteUrl("/"),
    logo: company.logo ? absoluteUrl(company.logo.url) : absoluteUrl("/brand/logo-512.png"),
    description: company.shortDescription,
    ...(email ? { email } : {}),
    ...(company.founded
      ? {
          foundingDate: company.founded.date.slice(
            0,
            company.founded.precision === "YEAR" ? 4 : company.founded.precision === "MONTH" ? 7 : 10,
          ),
        }
      : {}),
    ...(socials.length > 0 ? { sameAs: socials.map((s) => s.url) } : {}),
    ...(company.contact.address
      ? {
          address: {
            "@type": "PostalAddress",
            streetAddress: [company.contact.address.line1, company.contact.address.line2].filter(Boolean).join(", "),
            addressLocality: company.contact.address.city ?? undefined,
            addressRegion: company.contact.address.region ?? undefined,
            postalCode: company.contact.address.postalCode ?? undefined,
            addressCountry: company.contact.address.country ?? undefined,
          },
        }
      : {}),
  };
}

export function websiteJsonLd(company: CompanyDTO): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": absoluteUrl("/#website"),
    name: company.name,
    url: absoluteUrl("/"),
    publisher: { "@id": absoluteUrl("/#organization") },
  };
}

export function breadcrumbJsonLd(items: Array<{ name: string; path: string }>): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}

const CATEGORY_BY_PLATFORM: Partial<Record<string, string>> = {
  CHROME_EXTENSION: "BrowserApplication",
  FIREFOX_ADDON: "BrowserApplication",
  EDGE_ADDON: "BrowserApplication",
  SAFARI_EXTENSION: "BrowserApplication",
  WEB_APP: "WebApplication",
  WEBSITE: "WebApplication",
};

/** SoftwareApplication structured data. Offers are only emitted when pricing is known. */
export function productJsonLd(product: ProductDetailDTO, companyName: string): JsonLd {
  const primary = product.platforms[0];
  const applicationCategory = (primary && CATEGORY_BY_PLATFORM[primary]) ?? "UtilitiesApplication";
  const url = absoluteUrl(`/products/${product.slug}`);
  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: product.name,
    description: product.summary,
    url,
    applicationCategory,
    ...(product.platforms.length > 0
      ? { operatingSystem: product.platforms.map((p) => PLATFORM_LABELS[p]).join(", ") }
      : {}),
    ...(product.logo ? { image: absoluteUrl(product.logo.url) } : {}),
    ...(product.images.length > 0 ? { screenshot: product.images.map((img) => absoluteUrl(img.media.url)) } : {}),
    ...(product.release ? { datePublished: product.release.date.slice(0, 10) } : {}),
    ...(product.pricing === "FREE" || product.pricing === "OPEN_SOURCE"
      ? { offers: { "@type": "Offer", price: "0", priceCurrency: "USD" } }
      : {}),
    publisher: { "@type": "Organization", name: companyName, "@id": absoluteUrl("/#organization") },
    ...(product.primaryCtaUrl ? { installUrl: product.primaryCtaUrl } : {}),
  };
}

export function personJsonLd(member: TeamMemberDTO, companyName: string): JsonLd {
  const sameAs = [member.linkedinUrl, member.xUrl, member.githubUrl, member.websiteUrl].filter(Boolean);
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    name: member.name,
    jobTitle: member.position,
    url: absoluteUrl(`/team/${member.slug}`),
    ...(member.photo ? { image: absoluteUrl(member.photo.url) } : {}),
    ...(sameAs.length > 0 ? { sameAs } : {}),
    worksFor: { "@type": "Organization", name: companyName, "@id": absoluteUrl("/#organization") },
  };
}

/** Serialises JSON-LD safely for embedding inside a <script> element. */
export function serializeJsonLd(data: JsonLd | JsonLd[]): string {
  return JSON.stringify(data)
    .replace(/</g, "\\u003c")
    .replace(/>/g, "\\u003e")
    .replace(/&/g, "\\u0026")
    .replace(new RegExp(String.fromCharCode(0x2028), "g"), "\\u2028")
    .replace(new RegExp(String.fromCharCode(0x2029), "g"), "\\u2029");
}
