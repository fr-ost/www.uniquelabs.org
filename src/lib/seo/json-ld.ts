import { absoluteUrl } from "@/lib/seo/metadata";
import type { CapabilityDTO, CompanyDTO, ProductDetailDTO, ServicePageDTO, SocialLinkDTO, TeamMemberDTO } from "@/lib/content/types";
import { PLATFORM_LABELS } from "@/lib/labels";

type JsonLd = Record<string, unknown>;

/** Search engines prefer two-letter country codes (ISO 3166-1) in addresses. */
const COUNTRY_CODES: Record<string, string> = { bangladesh: "BD" };
const countryCode = (country: string) => COUNTRY_CODES[country.trim().toLowerCase()] ?? country;

/**
 * The company. One node with a stable @id that every other block points to.
 * `founders` are the team members whose position names them as a founder.
 */
export function organizationJsonLd(company: CompanyDTO, socials: SocialLinkDTO[], team: TeamMemberDTO[] = [], services: CapabilityDTO[] = []): JsonLd {
  const email = company.contact.contactEmail ?? company.contact.generalEmail;
  const founders = team.filter((m) => /founder/i.test(m.position));
  const address = company.contact.address;
  const country = address?.country ?? company.contact.country;
  return {
    "@context": "https://schema.org",
    // With a full street address the company is also a ProfessionalService (a local business with an office).
    "@type": address?.line1 && address.city ? ["Organization", "ProfessionalService"] : "Organization",
    "@id": absoluteUrl("/#organization"),
    name: company.name,
    ...(company.legalName ? { legalName: company.legalName } : {}),
    url: absoluteUrl("/"),
    logo: { "@type": "ImageObject", url: company.logo ? absoluteUrl(company.logo.url) : absoluteUrl("/brand/logo-512.png"), width: 512, height: 512 },
    image: absoluteUrl("/brand/logo-512.png"),
    description: company.shortDescription,
    slogan: company.tagline ?? undefined,
    ...(email ? { email } : {}),
    ...(company.founded
      ? {
          foundingDate: company.founded.date.slice(
            0,
            company.founded.precision === "YEAR" ? 4 : company.founded.precision === "MONTH" ? 7 : 10,
          ),
        }
      : {}),
    ...(founders.length > 0
      ? { founder: founders.map((m) => ({ "@type": "Person", "@id": absoluteUrl(`/team/${m.slug}#person`), name: m.name, jobTitle: m.position })) }
      : {}),
    ...(team.length > 0 ? { numberOfEmployees: { "@type": "QuantitativeValue", minValue: team.length } } : {}),
    ...(socials.length > 0 ? { sameAs: socials.map((s) => s.url) } : {}),
    ...(address
      ? {
          address: {
            "@type": "PostalAddress",
            streetAddress: [address.line1, address.line2].filter(Boolean).join(", "),
            addressLocality: address.city ?? undefined,
            addressRegion: address.region ?? undefined,
            postalCode: address.postalCode ?? undefined,
            addressCountry: address.country ? countryCode(address.country) : undefined,
          },
        }
      : country
        ? { address: { "@type": "PostalAddress", addressCountry: countryCode(country) }, location: { "@type": "Place", name: country } }
        : {}),
    areaServed: "Worldwide",
    ...(email
      ? { contactPoint: [{ "@type": "ContactPoint", contactType: "customer support", email, availableLanguage: ["English"] }] }
      : {}),
    ...(services.length > 0 ? { knowsAbout: services.map((c) => c.title) } : {}),
  };
}

/** The services as a list of Service items offered by the company (for /services). */
export function servicesJsonLd(pages: ServicePageDTO[], companyName: string): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: `Services by ${companyName}`,
    itemListElement: pages.map((page, index) => ({
      "@type": "ListItem",
      position: index + 1,
      item: {
        "@type": "Service",
        "@id": absoluteUrl(`/services/${page.slug}#service`),
        name: page.name,
        serviceType: page.name,
        description: page.summary,
        url: absoluteUrl(`/services/${page.slug}`),
        provider: { "@id": absoluteUrl("/#organization") },
        areaServed: "Worldwide",
      },
    })),
  };
}

/** A service page: the Service itself, provided by the company. */
export function servicePageJsonLd(page: ServicePageDTO): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    "@id": absoluteUrl(`/services/${page.slug}#service`),
    name: page.name,
    serviceType: page.name,
    description: page.quickAnswer,
    url: absoluteUrl(`/services/${page.slug}`),
    provider: { "@id": absoluteUrl("/#organization") },
    areaServed: "Worldwide",
    ...(page.audience.length > 0 ? { audience: { "@type": "BusinessAudience", audienceType: page.audience.join("; ") } } : {}),
  };
}

/** Questions answered on the page. Only use for questions visible on that page. */
export function faqJsonLd(faqs: Array<{ question: string; answer: string }>): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: { "@type": "Answer", text: faq.answer },
    })),
  };
}

/** The product directory as an ItemList (for /products). */
export function productListJsonLd(products: Array<{ slug: string; name: string }>): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Products",
    numberOfItems: products.length,
    itemListElement: products.map((product, index) => ({
      "@type": "ListItem",
      position: index + 1,
      url: absoluteUrl(`/products/${product.slug}`),
      name: product.name,
    })),
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
    ...(product.websiteUrl ? { sameAs: [product.websiteUrl] } : {}),
    ...(product.primaryCtaUrl ? { installUrl: product.primaryCtaUrl } : {}),
  };
}

export function personJsonLd(member: TeamMemberDTO, companyName: string): JsonLd {
  const sameAs = [member.linkedinUrl, member.xUrl, member.telegramUrl, member.githubUrl, member.websiteUrl].filter(Boolean);
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    "@id": absoluteUrl(`/team/${member.slug}#person`),
    name: member.name,
    jobTitle: member.position,
    url: absoluteUrl(`/team/${member.slug}`),
    ...(member.shortBio ? { description: member.shortBio } : {}),
    ...(member.photo ? { image: absoluteUrl(member.photo.url) } : {}),
    ...(sameAs.length > 0 ? { sameAs } : {}),
    ...(member.expertise.length > 0 ? { knowsAbout: member.expertise } : {}),
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
