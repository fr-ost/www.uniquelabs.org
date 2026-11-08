import type * as Content from "@/content";

/**
 * Checks the content files for mistakes that would break pages or links:
 * duplicate or malformed slugs, references to things that don't exist, bad
 * dates and URLs. Runs on every build (and in the unit tests), so a typo
 * fails loudly instead of shipping a broken page.
 */

type ContentModule = typeof Content;

const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const DATE = /^(\d{4})(?:-(0[1-9]|1[0-2])(?:-(0[1-9]|[12]\d|3[01]))?)?$/;
const HEX = /^#[0-9a-fA-F]{6}$/;

export function isValidDate(value: string): boolean {
  const match = DATE.exec(value);
  if (!match) return false;
  const [, y, m, d] = match;
  if (!d) return true;
  const date = new Date(Date.UTC(Number(y), Number(m) - 1, Number(d)));
  return date.getUTCMonth() === Number(m) - 1;
}

export function isHttpUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:";
  } catch {
    return false;
  }
}

export function validateContent(c: ContentModule): string[] {
  const problems: string[] = [];
  const add = (where: string, message: string) => problems.push(`${where}: ${message}`);

  const checkSlugs = (kind: string, items: Array<{ slug: string }>) => {
    const seen = new Set<string>();
    for (const item of items) {
      if (!SLUG.test(item.slug)) add(`${kind} "${item.slug}"`, "slug must use lowercase letters, numbers and single dashes");
      if (seen.has(item.slug)) add(`${kind} "${item.slug}"`, "slug is used twice");
      seen.add(item.slug);
    }
    return seen;
  };
  const checkDate = (where: string, value: string | undefined) => {
    if (value !== undefined && !isValidDate(value)) add(where, `date "${value}" must look like 2025, 2025-06 or 2025-06-14`);
  };
  const checkUrl = (where: string, value: string | undefined) => {
    if (value !== undefined && !isHttpUrl(value)) add(where, `"${value}" is not a full http(s) URL`);
  };
  const checkImage = (where: string, image: { src: string } | undefined) => {
    if (image && !image.src.startsWith("/")) add(where, `image "${image.src}" must be a path in /public, e.g. /images/…`);
  };
  const checkColor = (where: string, value: string | undefined) => {
    if (value !== undefined && !HEX.test(value)) add(where, `accent colour "${value}" must look like #ff6b35`);
  };

  const categorySlugs = checkSlugs("category", c.categories);
  const productSlugs = checkSlugs("product", c.products);
  checkSlugs("project", c.projects);
  const partnerSlugs = checkSlugs("partner", c.partners);
  const partnershipSlugs = checkSlugs("partnership", c.partnerships);
  const departmentSlugs = checkSlugs("department", c.departments);
  const memberSlugs = checkSlugs("team member", c.team);

  const refs = (where: string, kind: string, values: string[] | undefined, known: Set<string>) => {
    for (const value of values ?? []) if (!known.has(value)) add(where, `unknown ${kind} "${value}"`);
  };

  checkDate("company.founded", c.company.founded);
  checkImage("company.logo", c.company.logo);
  for (const [key, email] of Object.entries(c.company.contact.emails)) {
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) add(`company.contact.emails.${key}`, `"${email}" is not an email address`);
  }
  for (const social of c.company.socials) checkUrl(`company.socials (${social.platform})`, social.url);
  checkDate("site.legal.privacyUpdated", c.site.legal.privacyUpdated);
  checkDate("site.legal.termsUpdated", c.site.legal.termsUpdated);

  for (const p of c.products) {
    const where = `product "${p.slug}"`;
    if (p.category && !categorySlugs.has(p.category)) add(where, `unknown category "${p.category}"`);
    checkDate(where, p.released);
    checkUrl(`${where} website`, p.website);
    checkUrl(`${where} cta`, p.cta?.url);
    for (const link of p.links ?? []) checkUrl(`${where} link`, link.url);
    checkImage(`${where} logo`, p.logo);
    checkImage(`${where} cover`, p.cover);
    for (const s of p.screenshots ?? []) checkImage(`${where} screenshot`, s);
    checkColor(where, p.accentColor);
  }

  for (const p of c.projects) {
    const where = `project "${p.slug}"`;
    checkDate(where, p.date);
    refs(where, "product", p.products, productSlugs);
    refs(where, "partner", p.partners, partnerSlugs);
    for (const link of p.links ?? []) checkUrl(`${where} link`, link.url);
    checkImage(`${where} cover`, p.cover);
    for (const image of p.images ?? []) checkImage(`${where} image`, image);
    checkColor(where, p.accentColor);
  }

  for (const p of c.partners) {
    checkUrl(`partner "${p.slug}" website`, p.website);
    checkImage(`partner "${p.slug}" logo`, p.logo);
  }

  for (const p of c.partnerships) {
    const where = `partnership "${p.slug}"`;
    if (p.partners.length === 0) add(where, "needs at least one partner");
    refs(where, "partner", p.partners.map((x) => (typeof x === "string" ? x : x.slug)), partnerSlugs);
    refs(where, "product", p.products, productSlugs);
    checkDate(where, p.date);
    checkUrl(`${where} source`, p.source?.url);
    checkUrl(`${where} link`, p.link);
    checkImage(`${where} cover`, p.cover);
  }

  for (const d of c.departments) {
    if (d.lead && !memberSlugs.has(d.lead)) add(`department "${d.slug}"`, `unknown lead "${d.lead}"`);
  }

  for (const m of c.team) {
    const where = `team member "${m.slug}"`;
    if (m.department && !departmentSlugs.has(m.department)) add(where, `unknown department "${m.department}"`);
    checkDate(where, m.joined);
    checkImage(`${where} photo`, m.photo);
    for (const [key, url] of Object.entries(m.links ?? {})) checkUrl(`${where} ${key}`, url);
  }

  for (const m of c.milestones) {
    const where = `milestone "${m.title}"`;
    if (!isValidDate(m.date)) add(where, `date "${m.date}" must look like 2025, 2025-06 or 2025-06-14`);
    if (m.product && !productSlugs.has(m.product)) add(where, `unknown product "${m.product}"`);
    if (m.partnership && !partnershipSlugs.has(m.partnership)) add(where, `unknown partnership "${m.partnership}"`);
    checkUrl(`${where} source`, m.source?.url);
    checkImage(`${where} image`, m.image);
  }

  for (const cap of c.capabilities) refs(`capability "${cap.title}"`, "product", cap.products, productSlugs);

  return problems;
}
