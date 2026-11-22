# SEO program — www.uniquelabs.org

Prepared 22 Nov 2026 from the brief in the owner's "mega prompt" and the live code in this repository. Updated the same day after the owner's answers: all eight services are sold, every service is priced per project, results exist but are not published, and the office is in Dhaka.

How to read this document:

- **Done** means it is already implemented and on `main` (commit `1517eb0`, "SEO: titles, descriptions, headings, structured data and technical fixes"). Everything else is a plan.
- No search volumes, traffic, difficulty or backlink numbers are invented here. Where a number is needed it is labelled **estimate**, or the tool to pull it from is named (Google Search Console = GSC, Ahrefs or Semrush, Google Keyword Planner).
- The site follows the repository rule "never invent facts" (`CLAUDE.md`). Anything that needs a fact only the company has — prices, results, client names, an address — is marked **[needs owner input]** and listed in section 14.

---

## 1. Executive summary

1. **Get indexed first.** The site did not show up for `site:` or brand queries in the audit. Verify the domain in GSC and Bing Webmaster Tools, submit the sitemap and request indexing of the 10 core URLs in week 1. Nothing else matters until Google has the pages. (Biggest lever, fastest effect.)
2. **Make the brand unambiguous.** "Unique Labs" collides with unrelated labs. Every title, the Organization schema, LinkedIn, X and directory profiles should carry the same entity line: *Unique Labs — Web3 growth and software company, Bangladesh, since 2019*. Partly **done** (titles, schema, LinkedIn `sameAs`, "based in Bangladesh" on About and Contact).
3. **Titles and descriptions now target real queries** instead of "Page — Unique Labs". **Done** for all 24 indexable pages (≤ 60-character titles, 138–155-character descriptions, no "…").
4. **One page per service is the main ranking lever.** Competitors that rank (LuvKaizen, Cohort Marketing, KOL.solutions) have one deep page per service. Build eight `/services/{slug}` pages (section 4–5). Expected to drive most non-brand impressions within 2–3 months (**estimate**).
5. **Proof is the differentiator.** 243 partners (38 Tier 1) including Bybit, Binance, KuCoin, Bitget, Gate, OKX, MEXC, LBank, Galxe, Seedify, DAO Maker and CoinList is unusually strong for a young agency. Turn it into 6–10 permission-based case studies (section 7) and a structured partner page per role.
6. **Structured data is in place for the entity.** Organization (founders, 2019, Bangladesh, LinkedIn, contact point, services), Service list, product ItemList, breadcrumbs, SoftwareApplication and Person. **Done.** Add FAQPage and Service-per-page when the service pages exist.
7. **Free backlinks are waiting on owned sites.** Nine product sites and Chrome Web Store listings can link to www.uniquelabs.org with consistent anchor text. Several do not today. One afternoon of work.
8. **Start a small, focused blog.** 24 articles over 6 months around KOC/KOL, token launches and Web3 growth, each linking to a service page (section 6). Compounds from month 3 (**estimate**).
9. **Technical health is already strong.** Lighthouse SEO 100, HTTPS/HSTS, clean redirects. This round fixed the remaining items: favicon, sitemap dates, robots `Host`, noindex on empty /projects, duplicated H1, home and partners page weight. **Done.**
10. **Order of impact:** indexing → entity/brand → service pages → case studies → blog → directories and PR → local (Bangladesh) profile.

---

## 2. Technical fix list

| # | Issue | Priority | Fix | Effort | Status |
|---|---|---|---|---|---|
| 1 | Site not visible in Google | Critical | Verify in GSC + Bing, submit `/sitemap.xml`, URL-inspect and request indexing for core pages | S | To do (needs verification codes — §12) |
| 2 | Brand ambiguity | Critical | Consistent entity line in titles, schema, LinkedIn/X bios, directories; Knowledge Panel steps (§9) | M | Partly done |
| 3 | Generic titles on 24/25 pages | High | Keyword-led titles ≤ 60 chars | S | **Done** |
| 4 | Slogan H1s | High | Keyword H1s on Services, Products, Partnerships, Journey, Contact | S | **Done** (home keeps its slogan; keyword is in its title) |
| 5 | Home H1 text duplicated in HTML | High | Render the animated words as the heading text once | S | **Done** |
| 6 | All services on one URL | High | `/services/{slug}` pages (§4–5) | L | **Done** — 8 pages in `src/content/service-pages.ts`; process details still to confirm |
| 7 | No editorial content / case studies | High | Blog + case studies (§6–7) | L | To do |
| 8 | Thin Organization schema | High | `sameAs`, `founder`, `foundingDate`, `address`, `areaServed`, `contactPoint`, `knowsAbout` | S | **Done** |
| 9 | No Service / ItemList schema | High | Service list on /services, ItemList on /products | S | **Done** |
| 10 | Truncated product meta descriptions | Medium | Hand-written `seo.description` per product | S | **Done** |
| 11 | Empty /projects indexable | Medium | `noindex, follow` and out of sitemap while empty | S | **Done** |
| 12 | No social links / location | Medium | LinkedIn in footer and Contact; Dhaka office address on Contact, About and in schema | S | **Done** (X/Telegram company profiles: [needs owner input]) |
| 13 | Thin team pages | Medium | Real bios, expertise, highlights (§9) | M | To do (needs owner input) |
| 14 | Product sites don't link back | Medium | Footer "A product of Unique Labs" link on each product site (§8, §10) | S | To do (in the product repos) |
| 15 | `/favicon.ico` 404 | Low | `src/app/favicon.ico` (16/32/48 px) | S | **Done** |
| 16 | No `<lastmod>` in sitemap | Low | Dates from git history at build time | S | **Done** |
| 17 | Non-standard `Host:` in robots.txt | Low | Removed | S | **Done** |
| 18 | Home marquee duplicated ~80 logos in HTML | Low | Server renders each partner once; the decorative copy is added in the browser | S | **Done** (home HTML 599 KB → ~330 KB) |
| 19 | /partnerships ~1 MB HTML | Low | Partner logos as plain `<img>` (no `srcset`) | S | **Done** (1,056 KB → ~670 KB) |
| 20 | 2 dead outbound X links | Low | Removed `x.com/ToncashNetwork`, `x.com/zaddrnet` (partners kept) | S | **Done** |
| 21 | Unused JS ~30 KiB, render-blocking CSS | Low | See §2d | M | Partly done |
| 22 | `?status=` filter URLs crawlable | Low | Canonical to `/products` (already), never in sitemap, filters are client-side links | S | **Done** |

### 2a. Next.js metadata examples

The site uses one helper, `pageMetadata()` in `src/lib/seo/metadata.ts`, which sets the title, description, canonical, Open Graph and X card for each page (and `robots` when `noIndex` is set). The site-wide title template is `"%s — Unique Labs"` (`src/content/site.ts`).

**Home** (done; values come from `src/content/site.ts`):

```ts
// src/app/(site)/page.tsx
export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSettings();
  return pageMetadata({
    title: settings.seoTitleDefault, // "Unique Labs: Web3 Marketing, KOC & Blockchain Development"
    absoluteTitle: true,
    description: settings.seoDescription, // 145 chars, see §3
    path: "/",
  });
}
```

**Service page** (template for the new `/services/[slug]` route):

```ts
// src/app/(site)/services/[slug]/page.tsx
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getService } from "@/lib/content/public";
import { pageMetadata } from "@/lib/seo/metadata";

type Params = Promise<{ slug: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const service = await getService(slug);
  if (!service) return { title: "Service not found", robots: { index: false } };
  return pageMetadata({
    title: service.seo.title, // e.g. "Crypto KOC Marketing Agency" (+ " — Unique Labs")
    description: service.seo.description, // 140–155 characters, written by hand
    path: `/services/${service.slug}`,
    imageAlt: service.title,
  });
}
```

**Product page** (done; uses the new `seo` field on each product in `src/content/products.ts`):

```ts
// src/app/(site)/products/[slug]/page.tsx
export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProduct(slug);
  if (!product) return { title: "Product not found", robots: { index: false } };
  return pageMetadata({
    title: product.seoTitle ?? product.name, // "Rowlio: Free Web Scraper Chrome Extension"
    description: clampDescription(product.seoDescription ?? `${product.name} — ${product.summary}`),
    path: `/products/${product.slug}`,
    imageAlt: product.name,
  });
}
```

**Blog post** (template):

```ts
// src/app/(site)/blog/[slug]/page.tsx
export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) return { title: "Article not found", robots: { index: false } };
  const meta = pageMetadata({
    title: post.seo.title ?? post.title,
    description: post.seo.description,
    path: `/blog/${post.slug}`,
    type: "article",
    imageAlt: post.title,
  });
  return {
    ...meta,
    authors: [{ name: post.author.name, url: `/team/${post.author.slug}` }],
    openGraph: {
      ...meta.openGraph,
      type: "article",
      publishedTime: post.published,
      modifiedTime: post.updated ?? post.published,
      authors: [`/team/${post.author.slug}`],
      tags: post.tags,
    },
  };
}
```

### 2b. Structured data (JSON-LD)

Implemented builders live in `src/lib/seo/json-ld.ts`; pages render them with `<JsonLdScript />`. What each page emits today:

| Page | Types | Status |
|---|---|---|
| `/` | Organization, WebSite | **Done** |
| `/about` | Organization, BreadcrumbList | **Done** |
| `/services` | ItemList of Service, BreadcrumbList | **Done** |
| `/products` | ItemList, BreadcrumbList | **Done** |
| `/products/{slug}` | SoftwareApplication (with `sameAs` → product site, `installUrl`, `offers` when free), BreadcrumbList | **Done** |
| `/team/{slug}` | Person (`@id`, `sameAs`, `worksFor`), BreadcrumbList | **Done** |
| `/services/{slug}` | Service, FAQPage, BreadcrumbList | **Done** |
| `/blog/{slug}` | BlogPosting, BreadcrumbList | To do |
| `/case-studies/{slug}` | Article (or CreativeWork), BreadcrumbList | To do |

**Organization** — as rendered on the home page today:

```json
{
  "@context": "https://schema.org",
  "@type": "Organization",
  "@id": "https://www.uniquelabs.org/#organization",
  "name": "Unique Labs",
  "url": "https://www.uniquelabs.org/",
  "logo": { "@type": "ImageObject", "url": "https://www.uniquelabs.org/brand/logo-512.png", "width": 512, "height": 512 },
  "image": "https://www.uniquelabs.org/brand/logo-512.png",
  "description": "Unique Labs offers KOC and consultancy services, digital marketing and blockchain development — helping brands and Web3 projects build, launch and grow.",
  "slogan": "Helping brands and Web3 projects build, launch and grow.",
  "email": "contact@uniquelabs.org",
  "foundingDate": "2019",
  "founder": [
    { "@type": "Person", "@id": "https://www.uniquelabs.org/team/abrar-hamim#person", "name": "Abrar Hamim", "jobTitle": "Founder & CEO" },
    { "@type": "Person", "@id": "https://www.uniquelabs.org/team/shahriar-ahmed#person", "name": "Shahriar Ahmed", "jobTitle": "Co-Founder & COO" }
  ],
  "numberOfEmployees": { "@type": "QuantitativeValue", "minValue": 5 },
  "sameAs": ["https://www.linkedin.com/company/u-l"],
  "address": { "@type": "PostalAddress", "addressCountry": "BD" },
  "location": { "@type": "Place", "name": "Bangladesh" },
  "areaServed": "Worldwide",
  "contactPoint": [{ "@type": "ContactPoint", "contactType": "customer support", "email": "contact@uniquelabs.org", "availableLanguage": ["English"] }],
  "knowsAbout": ["KOC marketing", "Consultancy", "Digital marketing", "Blockchain development", "Software development", "AI & experimentation"]
}
```

When the owner confirms a street address and city, add them in `src/content/company.ts` (`contact.address`) and the schema fills in `streetAddress`, `addressLocality` and `postalCode` automatically. Add the company X and Telegram profiles to `company.socials` and they join `sameAs` (and the footer).

**WebSite** (done):

```json
{ "@context": "https://schema.org", "@type": "WebSite", "@id": "https://www.uniquelabs.org/#website", "name": "Unique Labs", "url": "https://www.uniquelabs.org/", "publisher": { "@id": "https://www.uniquelabs.org/#organization" } }
```

**ProfessionalService** — **done**: with the Dhaka office address in `company.ts`, the Organization node is typed `["Organization", "ProfessionalService"]` and carries the full address (#942, Shakila Tower, Ashkona (Uchartek Water Pump Road), Dakshinkhan, Dhaka 1230, BD). The standalone form, for reference:

```json
{
  "@context": "https://schema.org",
  "@type": "ProfessionalService",
  "@id": "https://www.uniquelabs.org/#business",
  "name": "Unique Labs",
  "url": "https://www.uniquelabs.org/",
  "parentOrganization": { "@id": "https://www.uniquelabs.org/#organization" },
  "image": "https://www.uniquelabs.org/brand/logo-512.png",
  "email": "contact@uniquelabs.org",
  "address": { "@type": "PostalAddress", "streetAddress": "#942, Shakila Tower, Ashkona (Uchartek Water Pump Road), Dakshinkhan", "addressLocality": "Dhaka", "postalCode": "1230", "addressCountry": "BD" },
  "areaServed": "Worldwide"
}
```

**Service** (one per service page):

```json
{
  "@context": "https://schema.org",
  "@type": "Service",
  "@id": "https://www.uniquelabs.org/services/koc-marketing#service",
  "name": "Crypto KOC marketing",
  "serviceType": "KOC marketing",
  "description": "KOC (key opinion consumer) campaigns for Web3 projects and exchanges: finding the right voices, shaping the message and coordinating each campaign.",
  "url": "https://www.uniquelabs.org/services/koc-marketing",
  "provider": { "@id": "https://www.uniquelabs.org/#organization" },
  "areaServed": "Worldwide",
  "audience": { "@type": "BusinessAudience", "audienceType": "Web3 projects, exchanges and launchpads" }
}
```

**FAQPage** (only with questions that are visibly answered on the same page):

```json
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    { "@type": "Question", "name": "What is KOC marketing?", "acceptedAnswer": { "@type": "Answer", "text": "KOC marketing uses key opinion consumers — real users with small, engaged audiences — to recommend a product…" } }
  ]
}
```

**BreadcrumbList** (done; `breadcrumbJsonLd()`), **ItemList** for /products (done; `productListJsonLd()`).

**BlogPosting** template:

```json
{
  "@context": "https://schema.org",
  "@type": "BlogPosting",
  "headline": "KOC vs KOL in crypto marketing",
  "description": "…",
  "image": "https://www.uniquelabs.org/og/blog/koc-vs-kol",
  "datePublished": "2026-12-01",
  "dateModified": "2026-12-01",
  "author": { "@type": "Person", "@id": "https://www.uniquelabs.org/team/nazrul-islam-jibon#person", "name": "Nazrul Islam Jibon", "url": "https://www.uniquelabs.org/team/nazrul-islam-jibon" },
  "publisher": { "@id": "https://www.uniquelabs.org/#organization" },
  "mainEntityOfPage": "https://www.uniquelabs.org/blog/koc-vs-kol-crypto-marketing"
}
```

**Person** (done; add these once bios exist): `description` (short bio), `knowsAbout` (expertise), `alumniOf`, `award`, and LinkedIn in `sameAs`. The builder already reads `shortBio` and `expertise` from `src/content/team.ts`.

### 2c. robots, sitemap, favicon, filters, /projects

All **done**:

```ts
// src/app/robots.ts — production allows all; previews disallow all; no "Host:" line
return { rules: [{ userAgent: "*", allow: "/" }], sitemap: `${base}/sitemap.xml` };
```

```ts
// src/app/sitemap.ts (excerpt) — <lastmod> from git history; /projects only when it has case studies
...STATIC_ROUTES.map((route) => ({ url: `${base}${route.path === "/" ? "" : route.path}`, changeFrequency: route.changeFrequency, priority: route.priority, ...withDate(route.sources) })),
...(projects.length > 0 ? [{ url: `${base}/projects`, changeFrequency: "weekly", priority: 0.8, ...withDate(["src/content/projects.ts"]) }] : []),
```

```ts
// src/lib/seo/last-modified.ts — git log date of the files a page is built from; omitted if git is unavailable
execFileSync("git", ["log", "-1", "--format=%cI", "--", ...paths], { encoding: "utf8" });
```

- Favicon: `src/app/favicon.ico` (16, 32, 48 px) is served at `/favicon.ico`.
- `/products?status=…`: the filters are client-side links; the page's canonical is `/products`; the sitemap never lists query URLs (a browser test checks this). No `robots.txt` disallow is needed — a disallow would stop Google seeing the canonical.
- `/projects`: `noIndex: projects.length === 0` in its `generateMetadata`, and it is left out of the sitemap until a case study exists (a browser test checks both).

Note on Vercel: the sitemap dates come from git. If a deployment's clone is too shallow to know a file's history, that `<lastmod>` is simply omitted (never guessed). If dates go missing in production, raise the clone depth or switch to a `updated` field in the content files.

### 2d. Performance quick wins

| Item | What was done / to do |
|---|---|
| Marquee duplication | **Done.** `Marquee` renders each item once on the server; `MarqueeClone` (`src/components/motion/marquee-clone.tsx`) adds the decorative copy in the browser (`aria-hidden`, links `tabindex=-1`). Both copies sit in one animated strip so they can never drift. |
| Partner logo weight | **Done.** `PartnerLogo` (`src/components/ui/partner-logo.tsx`) serves the 128 px WebP logos with a plain `<img loading="lazy">`: no `srcset`, which was ~330 KB of the Partnerships HTML. |
| Partnerships page | Remaining weight is mostly the React payload for 243 tiles. Next step if needed: render Tier 2 as a lighter list (name + role, no logo) and load logos on expand. |
| Unused JS (~30 KiB) | Earlier work already removed `motion` and `lenis`. Remaining: check `npx next build --profile` output; most is the framework runtime. Low priority. |
| Render-blocking CSS | One small Tailwind CSS file. Acceptable: Lighthouse performance is 93–99. Optional experiment: `experimental: { inlineCss: true }` in `next.config.ts`, which inlines it into the HTML — measure LCP and HTML size before keeping it. |

```tsx
// src/components/motion/marquee.tsx (excerpt)
<div className="marquee" data-reverse={reverse ? "" : undefined} style={style}>
  <div className="marquee__strip">
    <ul className="marquee__track" aria-label={label}>{items.map((item) => <li key={getKey(item)}>{renderItem(item)}</li>)}</ul>
    <MarqueeClone /> {/* replaced in the browser by an aria-hidden copy of the track */}
  </div>
</div>
```

```css
/* src/app/globals.css (excerpt) */
.marquee__strip { display: flex; gap: var(--marquee-gap); animation: marquee-x var(--marquee-duration) linear infinite; }
@keyframes marquee-x { to { transform: translate3d(calc(-50% - var(--marquee-gap) / 2), 0, 0); } }
```

---

## 3. Page-by-page on-page plan

Titles and descriptions below are the **live values** (done) unless marked "proposed". Titles include the " — Unique Labs" suffix where the template adds it. Word counts are targets for the next content pass.

| URL | Primary keyword | Title (≤ 60) | Meta description (140–155) | H1 | H2 outline | Words | Internal links to add |
|---|---|---|---|---|---|---|---|
| `/` | Web3 marketing agency | Unique Labs: Web3 Marketing, KOC & Blockchain Development | Unique Labs is a Web3 growth agency from Bangladesh: KOC and KOL campaigns, consultancy, digital marketing and blockchain development since 2019. | Build, launch and grow. (keep slogan; proposed visible sub-line: "Web3 marketing, KOC and blockchain development") | Introduction · What we do · Trusted across Web3 · Software we build in-house · Our principles · The story so far · The people | 1,400–1,800 | Each `/services/{slug}`, `/case-studies`, `/blog` (latest 3) |
| `/services` | Web3 marketing services | Web3 Marketing, KOC & Blockchain Services — Unique Labs | Unique Labs services: crypto KOC and KOL campaigns, Web3 consultancy, digital marketing, blockchain development and Chrome extension builds. | Web3 marketing and development services. | One card per service (summary + link) · How we work · Who we work with · Proof (Tier 1 logos) · FAQ | 900–1,200 (hub) | All 8 service pages; `/partnerships`; `/contact` |
| `/products` | free Chrome extensions | Free Chrome Extensions for X, PDF & More — Unique Labs | Chrome extensions built in-house by Unique Labs: UnfollowX Pro, GrowX, Unique PDF, FrameShot, Twofold, Rowlio, ScoreX, XAICG and UniqueFarm. | Chrome extensions, built in-house. | Product grid · Why we build our own tools · Chrome extension development (link) | 700–900 | `/services/chrome-extension-development` |
| `/products/unfollowx-pro` | mass unfollow X free | UnfollowX Pro: Free Mass Unfollow Tool for X — Unique Labs | UnfollowX Pro is a free Chrome extension that shows who doesn't follow you back on X (Twitter) and unfollows them at a safe pace. No limits, no sign-up. | UnfollowX Pro | About · Features · Screenshots · Links | 600–900 | Product site (exists), `/products`, related products |
| `/products/growx` | X growth tool Chrome | GrowX: X (Twitter) Growth Tool for Chrome — Unique Labs | GrowX is an all-in-one X (Twitter) growth extension for Chrome: smart auto follow, a post scheduler, an on-device AI writer and an unfollower tracker. | GrowX | as above | 600–900 | as above |
| `/products/unique-pdf` | free PDF editor Chrome extension | Unique PDF: Free PDF Editor Chrome Extension — Unique Labs | Unique PDF puts 20 free PDF tools in Chrome: merge, split, compress, edit, sign and protect, plus AI chat with any PDF. Files never leave your browser. | Unique PDF | as above | 600–900 | as above |
| `/products/frameshot` | free screen recorder Chrome extension | FrameShot: Free Screen Recorder for Chrome — Unique Labs | FrameShot is a free Chrome screen recorder and full-page screenshot tool. Record with sound and camera, annotate and blur. No watermark, stays on device. | FrameShot | as above | 600–900 | as above |
| `/products/twofold` | Chrome 2FA authenticator | Twofold: Free 2FA Authenticator for Chrome — Unique Labs | Twofold is a free 2FA authenticator for Chrome: one-click codes, phishing-aware autofill, passkeys, QR scanning and encrypted sync. No ads, works offline. | Twofold | as above | 600–900 | as above |
| `/products/rowlio` | web scraper Chrome extension free | Rowlio: Free Web Scraper Chrome Extension — Unique Labs | Rowlio is a free web scraper for Chrome. Extract tables, listings, links, images and contacts into clean rows, then export to CSV, Excel or JSON locally. | Rowlio | as above | 600–900 | as above |
| `/products/scorex` | influencer score X | ScoreX: Grow Your Influencer Score on X — Unique Labs | ScoreX is a Chrome extension that replies to the smart accounts you pick on X, in your own voice, to grow your influencer score. Invite-only early access. | ScoreX | as above | 600–900 | as above |
| `/products/xaicg` | AI reply generator for X | XAICG: Free AI Reply Generator for X (Twitter) — Unique Labs | XAICG is a free, unlimited AI reply generator for X (Twitter). Replies, questions, posts and threads in your voice, written privately on your own computer. | XAICG | as above | 700–1,000 | as above |
| `/products/uniquefarm` | (brand only) | UniqueFarm: X Engagement Side Panel (Private) — Unique Labs | UniqueFarm is a private Chrome side panel for X that drafts replies in your voice with human timing and a review hold. No external licences are sold yet. | UniqueFarm | as above | 500–800 | as above |
| `/partnerships` | Web3 KOL partners / crypto exchange partners | 243 Web3 Partners: Exchanges & Launchpads — Unique Labs | 243 exchanges, launchpads, ecosystems and Web3 projects Unique Labs has worked with as ambassadors, KOC and KOL partners and campaign partners. | Web3 partners: exchanges, launchpads and chains. | Tier 1 · Tier 2 · Proposed: "By role" (exchanges, launchpads, ecosystems) with links to service pages | 1,400–1,600 | Each role → its service page; case studies |
| `/projects` | (noindex until content) | Case studies and projects — Unique Labs | Case studies and projects by Unique Labs: Web3 campaigns, launches and software we designed, built and shipped, and what came of them. | Our work. → proposed "Case studies" | Becomes `/case-studies` hub (§4) | 500+ (hub) | Services, partners |
| `/about` | Unique Labs Web3 Bangladesh | About Unique Labs: Web3 Growth Company Since 2019 | Unique Labs is a Web3 growth and software company from Bangladesh. Founded in 2019 by friends who hunted airdrops, now a partner to 240+ Web3 projects. | From a group of friends to a Web3 growth partner. | Who we are · Why we exist · Mission & vision · Philosophy · Approach · Long-term direction · The people · Proposed: "Where we are" (city, time zone, languages) | 1,000–1,300 | `/journey`, `/team`, `/services`, `/partnerships` |
| `/journey` | Unique Labs history | Our Story: From Airdrop Hunters to Web3 Agency — Unique Labs | How Unique Labs grew from a group of friends hunting airdrops in Bangladesh in 2019 into a Web3 growth and software company, year by year. | The Unique Labs story. | One H3 per year 2019–2026 | 600–900 | Year entries → service pages and partners |
| `/team` | Unique Labs team | Our Team: Web3 Growth & Marketing Leaders — Unique Labs | Meet the Unique Labs leadership team: the founders and heads of growth, partnerships and marketing behind our Web3 campaigns and products. | The people behind Unique Labs. | Leadership · Proposed: "How we work together", "Join us" | 400–600 | Each profile, `/about`, `/contact` |
| `/team/abrar-hamim` | Abrar Hamim | Abrar Hamim, Founder & CEO of Unique Labs | Abrar Hamim is Founder & CEO at Unique Labs, a Web3 growth and software company from Bangladesh. Profile, role and links to X and Telegram. | Abrar Hamim | Role · Focus areas · Highlights · Articles (once the blog exists) | 300–500 | Authored posts, `/about` |
| `/team/shahriar-ahmed` | Shahriar Ahmed | Shahriar Ahmed, Co-Founder & COO of Unique Labs | (same pattern) | Shahriar Ahmed | as above | 300–500 | as above, plus the products he developed (XAICG) |
| `/team/nazrul-islam-jibon` | Nazrul Islam Jibon | Nazrul Islam Jibon, Head of Growth & Strategy of Unique Labs | (same pattern) | Nazrul Islam Jibon | as above | 300–500 | as above |
| `/team/mahfuz-allum` | Mahfuz Allum | Mahfuz Allum, Head of Partnerships & PR of Unique Labs | (same pattern) | Mahfuz Allum | as above | 300–500 | as above |
| `/team/abrar-hossain-ayan` | Abrar Hossain Ayan | Abrar Hossain Ayan, Head of Marketing & BD of Unique Labs | (same pattern) | Abrar Hossain Ayan | as above | 300–500 | as above |
| `/contact` | contact Unique Labs | Contact Us: Web3 Marketing & KOC Enquiries — Unique Labs | Contact Unique Labs at contact@uniquelabs.org or message our admins on Telegram about KOC campaigns, Web3 marketing or blockchain development. | Contact Unique Labs. | Email · Telegram admins · Proposed: "What to include in your brief", "Where we are" | 300–450 | Services, `/partnerships` |
| `/privacy` | — | Privacy Policy — Unique Labs | How Unique Labs handles personal information on www.uniquelabs.org: no cookies or analytics, what happens when you email us, and your rights. | Privacy Policy | as is | as is | — |
| `/terms` | — | Terms of Use — Unique Labs | The terms of use for the Unique Labs website: our services and products, intellectual property, external links, disclaimers and changes. | Terms of Use | as is | as is | — |

---

## 4. New site architecture

```
www.uniquelabs.org/
├── /                                   home (hub for everything)
├── /services                           services hub (keeps the overview)
│   ├── /services/koc-marketing         crypto KOC marketing
│   ├── /services/kol-marketing         Web3 / crypto KOL & influencer marketing
│   ├── /services/token-launch-marketing   token, IDO and launchpad launch campaigns
│   ├── /services/web3-consulting       Web3 consultancy / go-to-market
│   ├── /services/digital-marketing     digital marketing for brands and Web3
│   ├── /services/community-management  crypto community management
│   ├── /services/blockchain-development   smart contracts, dApps, Web3 sites
│   └── /services/chrome-extension-development
├── /case-studies                       hub (replaces /projects; 308 /projects → /case-studies)
│   └── /case-studies/{partner-campaign}   e.g. /case-studies/lbank-koc-campaign
├── /blog                               hub, with category filters
│   ├── /blog/category/{koc-kol | token-launch | web3-growth | development}
│   └── /blog/{slug}
├── /partnerships                       partner directory (Tier 1 / Tier 2)
├── /products  (+ 9 product pages)
├── /about  /journey  /team (+ 5 profiles)  /contact
└── /privacy  /terms
```

Decisions:

- **Keep `/services`** as the hub and link each card to its page. The current `#anchor` links on /services become links to the new pages.
- **`/services/kol-marketing`, `/token-launch-marketing` and `/community-management` are new offerings on the site.** The partner list supports them (31 "KOL Campaign" and 12 "KOL Partner" roles, 7 launchpad and 5 IDO partners, 10 "Community Campaign" roles), but each needs the owner to confirm it is a service they sell before the page goes live **[needs owner input]**.
- **`/case-studies` replaces `/projects`** once the first case study is ready (redirect, keep `noindex` on until then).
- **Location section: not yet.** A single "Where we are" block on About and Contact is justified now; a separate `/bangladesh` page only if the company wants local clients (section 11). Avoid thin city pages.

---

## 5. Content briefs for the new service pages

Shared rules for every service page:

- **Template:** quick answer (40–60 words, directly under the H1) → who it is for → what we do → how a campaign works → proof (partners by role, case studies) → pricing approach → FAQ → CTA.
- **Facts:** proof points come only from `src/content/partnerships.ts` (names and roles). No results, budgets or client quotes until the owner supplies them. Pricing: show "how pricing works" (scope-based) unless the owner gives ranges **[needs owner input]**.
- **Schema:** Service + FAQPage + BreadcrumbList.
- **Internal links:** up to `/services`, across to 2–3 sibling services, down to related case studies and blog posts, plus `/contact`.
- **CTA:** "Email contact@uniquelabs.org" + "Message an admin on Telegram" (primary), "See our partners" (secondary).

### 5.1 `/services/koc-marketing` — Crypto KOC marketing

| Field | Brief |
|---|---|
| Search intent | Commercial — a project or exchange looking for a KOC agency; secondary informational ("what is KOC marketing") |
| Primary keyword | crypto KOC marketing agency |
| Secondary | KOC marketing; KOL KOC marketing; key opinion consumer marketing; KOC marketing strategy; KOC vs KOL |
| Title | Crypto KOC Marketing Agency (+ " — Unique Labs") |
| Meta | Crypto KOC marketing by Unique Labs: real users and creators recommend your exchange or token, planned and run end to end. KOC partner of Bybit and Gate. (153) |
| H1 | Crypto KOC marketing that people trust |
| Quick answer | KOC (key opinion consumer) marketing uses real users with small, engaged audiences to try a product and share an honest recommendation. Unique Labs plans and runs KOC campaigns for exchanges, wallets and Web3 projects: choosing the voices, shaping the message and coordinating each post. |
| H2/H3 outline | What is KOC marketing? · KOC vs KOL: when to use which (H3: reach vs trust; H3: cost model) · Who it's for (exchanges, wallets, new tokens) · What's included (H3: voice selection; H3: briefs and messaging; H3: scheduling and coordination; H3: reporting) · How a KOC campaign runs (step list) · Proof: exchanges and wallets we've worked with · Pricing: how it's scoped · FAQ · Start a campaign |
| Proof points (from partner list) | KOC Partner: Gate, Bybit, Bitget Wallet (Tier 1), SuperEx, OKX Wallet, Binance Wallet, BloFin, IXFI; KOC Campaigns: Binance (Tier 1); 30 KOC Campaign partners incl. Altura, AITECH, Falcon Finance, Hinkal |
| FAQ | What is KOC marketing in crypto? · How is a KOC different from a KOL? · Is KOC marketing allowed under X's rules? (link to disclosure best practice) · How many KOCs does a campaign use? [owner] · How long does a campaign take? [owner] · How do you measure results? · Which chains and exchanges have you worked with? |
| CTA | Plan a KOC campaign → contact |
| Schema | Service (`serviceType: "KOC marketing"`), FAQPage, BreadcrumbList |
| Internal links | `/services/kol-marketing`, `/services/token-launch-marketing`, `/partnerships#tier-1`, blog "What is KOC marketing?", "KOC vs KOL" |
| Words | 1,600–2,200 |

### 5.2 `/services/kol-marketing` — Web3 KOL marketing

| Field | Brief |
|---|---|
| Intent | Commercial |
| Primary | Web3 KOL marketing agency |
| Secondary | crypto KOL marketing agency; crypto influencer marketing agency; Web3 KOL list; crypto influencer campaign |
| Title | Web3 & Crypto KOL Marketing Agency |
| Meta | Web3 KOL marketing from Unique Labs: crypto influencer campaigns on X and Telegram, from KOL selection to briefs and timing. KOL partner of KuCoin and OKX. (155) |
| H1 | Web3 KOL marketing |
| Quick answer | KOL (key opinion leader) marketing puts your project in front of established crypto voices on X, Telegram and YouTube. Unique Labs matches projects with KOLs whose audiences fit, writes the brief, times the posts around your milestones and tracks what each post delivers. |
| Outline | What KOL marketing does for a Web3 project · Choosing KOLs (H3: audience fit; H3: authenticity checks; H3: tiers) · Campaign formats (threads, spaces/AMAs, videos, quote campaigns) · How we run it · Proof · Pricing approach · FAQ · CTA |
| Proof | KOL Partner: KuCoin, OKX, Cheelee (Tier 1), Kraken, Trust Wallet, CoinGecko, Grvt, LCX; 31 KOL Campaign partners incl. Unicity, Alva AI, Edu3Labs, World of Dypians; Creator Campaigns: Kaito AI, Zora |
| FAQ | How do you choose KOLs? · How do you avoid fake followers and bots? · KOL vs KOC? · Do you run AMAs and X Spaces? · Do you work with Telegram KOLs? · How are KOLs paid? [owner] · Disclosure requirements |
| Words | 1,600–2,200 |

### 5.3 `/services/token-launch-marketing` — Token, IDO and launchpad launches

| Field | Brief |
|---|---|
| Intent | Commercial, high value |
| Primary | token launch marketing |
| Secondary | token launch marketing strategy; IDO marketing agency; launchpad marketing agency; how to promote a crypto project |
| Title | Token Launch & IDO Marketing Agency |
| Meta | Token launch and IDO marketing by Unique Labs: KOC and KOL campaigns, launchpad coordination and community growth before and after your TGE. (140) |
| H1 | Token launch marketing, from announcement to TGE |
| Quick answer | Token launch marketing builds awareness, a qualified community and demand before a token generation event, then keeps momentum after listing. Unique Labs combines KOC and KOL campaigns, community work and coordination with launchpads into one plan around your launch date. |
| Outline | The phases of a token launch (H3: pre-announcement; H3: whitelist/IDO; H3: TGE and listing; H3: post-launch) · What we do in each phase · Working with launchpads · Proof · 12-week example timeline (link to blog) · FAQ · CTA |
| Proof | Launchpad Partner: TrustFi, SeaFi, Tenset, Vision Launch, RedKite, Nova Labs, Alpha Launcher; IDO Partner: OpenPad, BSCS, DAO Maker, DeXe, Fjord Foundry; Token Sale Campaigns: CoinList; Core Contributor: Seedify; Launch Support: Elixir Games, Storm Warfare |
| FAQ | When should launch marketing start? · Do you help choose a launchpad? · What happens after listing? · Do you guarantee raise or price outcomes? (answer: no) · Which chains? · How do you handle whitelists and airdrop farmers? |
| Words | 1,800–2,500 |

### 5.4 `/services/web3-consulting` — Web3 consultancy

| Field | Brief |
|---|---|
| Intent | Commercial / research |
| Primary | Web3 consultancy |
| Secondary | blockchain consulting services; Web3 go-to-market strategy; crypto marketing consultant |
| Title | Web3 Consultancy & Go-to-Market Strategy |
| Meta | Web3 consultancy from Unique Labs: positioning, go-to-market and growth plans for token projects and exchanges, from a team with 240+ Web3 partners. (148) |
| H1 | Web3 consultancy for founders and growth teams |
| Quick answer | Unique Labs advises Web3 founders and teams on positioning, go-to-market and growth — then helps put the plan into action with campaigns and development. The advice comes from running KOC, KOL and launch campaigns with exchanges, launchpads and ecosystems since 2019. |
| Outline | When to bring in a Web3 consultant · What we advise on (positioning, launch plan, community, partnerships, product) · How an engagement works · From plan to execution · Proof · FAQ · CTA |
| Proof | Strategic Partnership: LBank; Ambassador: Bitget; Ecosystem Campaigns: Base, Solana, BNB Chain; Ecosystem Advocate: 0G Labs, Persistence, Gravity |
| FAQ | What does a Web3 consultant do? · Do you only advise, or also execute? · Typical engagement length? [owner] · Do you sign NDAs? [owner] · Do you advise on tokenomics? [owner — only if offered] |
| Words | 1,300–1,800 |

### 5.5 `/services/digital-marketing`

| Field | Brief |
|---|---|
| Intent | Commercial |
| Primary | Web3 digital marketing agency |
| Secondary | crypto marketing agency; Web3 growth agency; social media marketing for crypto; digital marketing agency Bangladesh |
| Title | Digital Marketing for Web3 Projects & Brands |
| Meta | Digital marketing by Unique Labs: social media, content, community and campaigns on X, Telegram and beyond, for Web3 projects and brands that want to grow. (155) |
| H1 | Digital marketing for Web3 projects and brands |
| Quick answer | Unique Labs runs social media, content, community and campaign management for Web3 projects and brands — on the channels where their audience spends its time, mainly X and Telegram. |
| Outline | Channels we work on · Content and social · Quest and engagement campaigns · Growth campaigns · Reporting · Proof · FAQ · CTA |
| Proof | Quest Campaign Partner: Galxe; Engagement Campaign: Aptos, MetaMask, Aleo, Litecoin; Growth Campaign: 28 partners incl. DeepLink, BloodLoop; Trading Campaign Partner: BitMEX |
| Words | 1,300–1,800 |

### 5.6 `/services/community-management`

| Field | Brief |
|---|---|
| Intent | Commercial |
| Primary | crypto community management services |
| Secondary | Telegram community management; Discord community management Web3; crypto ambassador program |
| Title | Crypto Community Management Services |
| Meta | Crypto community management by Unique Labs: Telegram and X communities, ambassador programmes and AMAs, run by a team that grew up in Web3 communities. (151) |
| H1 | Community management for crypto projects |
| Quick answer | Crypto community management keeps a project's Telegram, X and Discord active, safe and on-message: moderation, announcements, AMAs and ambassador programmes. Unique Labs' team started as community members and ambassadors, and now runs communities for projects. |
| Outline | What community management covers · Moderation and safety (scams, raids) · Ambassador programmes · AMAs and X Spaces · Reporting · Proof · FAQ · CTA |
| Proof | Community Campaign: Nodepay (Tier 1), MoonPay, Phantom, Polymarket, TON; Community Partner: Seedworld; Core Contributor: Seedify (ambassador team, 2022); Early-Access Community: CoinMarketCap |
| Words | 1,300–1,800 |

### 5.7 `/services/blockchain-development`

| Field | Brief |
|---|---|
| Intent | Commercial |
| Primary | blockchain development company |
| Secondary | smart contract development services; smart contract development cost; Web3 development agency; blockchain development company in Bangladesh |
| Title | Blockchain & Smart Contract Development |
| Meta | Blockchain development by Unique Labs: smart contracts, decentralised applications and the websites and tools around them, for Web3 projects worldwide. (151) |
| H1 | Blockchain and smart contract development |
| Quick answer | Unique Labs designs and develops blockchain solutions for Web3 projects — smart contracts, decentralised applications and the websites and tools around them — with the same team that builds our own software. |
| Outline | What we build · Chains and stack **[needs owner input]** · Security and audits **[needs owner input]** · How a build works · Cost: what drives it · FAQ · CTA |
| Proof | No public development case studies yet — do not invent; use product engineering (9 extensions) as craft proof until case studies exist |
| Words | 1,400–2,000 |

### 5.8 `/services/chrome-extension-development`

| Field | Brief |
|---|---|
| Intent | Commercial |
| Primary | Chrome extension development company |
| Secondary | Chrome extension development services; browser extension development company; Manifest V3 migration |
| Title | Chrome Extension Development Company |
| Meta | Chrome extension development by the team behind nine of its own extensions, including Unique PDF, FrameShot and XAICG. Manifest V3, privacy-first. (146) |
| H1 | Chrome extension development |
| Quick answer | Unique Labs builds Chrome extensions end to end — design, Manifest V3 development, privacy policy and Chrome Web Store listing. We have shipped nine of our own, from a PDF editor to an on-device AI reply generator. |
| Outline | What we build · Our own extensions (proof) · Privacy-first and on-device AI · Store listing and review · How a project works · FAQ · CTA |
| Proof | UnfollowX Pro, GrowX, Unique PDF, FrameShot, Twofold, Rowlio, ScoreX, XAICG, UniqueFarm (all real, all linked) |
| Words | 1,400–2,000 |

---

## 6. Blog and content plan (first 6 months)

Rules: every post links to one service page (the "money page") and one related post; authors are real team members (author box links to their profile); no invented statistics — cite sources or use your own campaign data with permission.

| # | Title | Primary keyword | Intent | Funnel | Links to |
|---|---|---|---|---|---|
| **KOC / KOL** |||||
| 1 | What is KOC marketing? A plain guide for Web3 projects | what is KOC marketing | Informational | Top | `/services/koc-marketing` |
| 2 | KOC vs KOL in crypto marketing: which does your project need? | KOC vs KOL | Informational/commercial | Middle | `/services/koc-marketing` |
| 3 | How to choose crypto KOLs without paying for fake reach | crypto KOL marketing | Commercial | Middle | `/services/kol-marketing` |
| 4 | KOC marketing strategy: a step-by-step campaign plan | KOC marketing strategy | Informational | Middle | `/services/koc-marketing` |
| 5 | Running an X Spaces AMA that people actually join | crypto AMA | Informational | Top | `/services/community-management` |
| 6 | Disclosure rules for paid crypto posts on X | crypto influencer disclosure | Informational | Top | `/services/kol-marketing` |
| **Token launch** |||||
| 7 | How to market a token launch: a 12-week plan | token launch marketing strategy | Informational/commercial | Middle | `/services/token-launch-marketing` |
| 8 | IDO marketing: what launchpads expect from projects | IDO marketing | Informational | Middle | `/services/token-launch-marketing` |
| 9 | How to choose a launchpad for your IDO | best IDO launchpad | Commercial | Middle | `/services/token-launch-marketing` |
| 10 | Pre-TGE checklist: 30 things to have ready | TGE checklist | Informational | Bottom | `/services/token-launch-marketing` |
| 11 | Airdrops, quests and farmers: designing campaigns that reward real users | crypto airdrop campaign | Informational | Top | `/services/digital-marketing` |
| 12 | What happens after listing: keeping momentum post-TGE | post TGE marketing | Informational | Middle | `/services/token-launch-marketing` |
| **Web3 growth** |||||
| 13 | How to promote a crypto project in 2027 | how to promote a crypto project | Informational | Top | `/services` |
| 14 | Crypto community management: the weekly playbook | crypto community management | Informational | Middle | `/services/community-management` |
| 15 | Building an ambassador programme that lasts | crypto ambassador program | Informational | Middle | `/services/community-management` |
| 16 | Galxe quests vs Zealy vs native campaigns | Galxe quest campaign | Commercial | Middle | `/services/digital-marketing` |
| 17 | Web3 go-to-market strategy for first-time founders | Web3 go-to-market strategy | Informational | Top | `/services/web3-consulting` |
| 18 | From airdrop hunters to agency: what we learned on the other side | (brand / E-E-A-T) | Brand | Top | `/about`, `/journey` |
| **Development** |||||
| 19 | Smart contract development cost: what drives the price | smart contract development cost | Commercial | Bottom | `/services/blockchain-development` |
| 20 | How to build a Chrome extension: Manifest V3 in practice | how to build a Chrome extension | Informational | Top | `/services/chrome-extension-development` |
| 21 | On-device AI in Chrome extensions: what we learned building XAICG | on-device AI Chrome extension | Informational | Top | `/services/chrome-extension-development`, `/products/xaicg` |
| 22 | Privacy-first extensions: keeping user data on the device | privacy-first Chrome extension | Informational | Top | `/services/chrome-extension-development` |
| 23 | Getting a Chrome extension approved on the Web Store | Chrome Web Store review | Informational | Middle | `/services/chrome-extension-development` |
| 24 | Hiring a blockchain development company in Bangladesh | blockchain development company in Bangladesh | Commercial | Bottom | `/services/blockchain-development` |

Suggested order: 1, 2, 7 first (they feed the three most commercial pages), then one post per week alternating clusters.

### Outline A — "KOC vs KOL in crypto marketing: which does your project need?"

- **Primary:** KOC vs KOL · **Secondary:** KOL KOC marketing, key opinion consumer, crypto influencer marketing · **Words:** 1,800–2,200 · **Author:** Head of Growth & Strategy
- **Quick answer (top):** A KOL is an established voice with reach; a KOC is a real user with a small, trusting audience. KOLs build awareness fast; KOCs build credibility and conversions. Most launches need both, in that order.
- H2 What is a KOL? (definition, typical formats: threads, Spaces, video)
- H2 What is a KOC? (definition, why trust is higher, typical formats: reviews, how-tos, replies)
- H2 KOC vs KOL at a glance (table: reach, trust, cost model, speed, best stage, risks)
- H2 When to use KOLs (announcement, listing, big news)
- H2 When to use KOCs (onboarding, product education, exchange features, sustained activity)
- H2 Using both: a simple launch sequence (link to Outline B)
- H2 How to measure each (reach vs sign-ups/volume; UTM, referral codes)
- H2 Common mistakes (buying reach, no disclosure, one-off posts)
- H2 FAQ (4–5 questions → FAQPage)
- CTA → `/services/koc-marketing` and `/services/kol-marketing`

### Outline B — "How to market a token launch: a 12-week plan"

- **Primary:** token launch marketing strategy · **Secondary:** IDO marketing, launchpad marketing, how to promote a crypto project · **Words:** 2,500–3,000 · **Author:** Founder & CEO
- **Quick answer:** Start 12 weeks before TGE: weeks 1–4 positioning and community foundations, weeks 5–8 awareness with KOLs and quests, weeks 9–11 conversion with KOCs and launchpad activity, week 12 TGE and listing, then a post-launch plan.
- H2 Before week 1: what you need ready (narrative, tokenomics summary, site, docs, socials)
- H2 Weeks 1–4: foundations (community channels, moderation, content calendar, ambassador seeds)
- H2 Weeks 5–8: awareness (KOL wave, X Spaces/AMAs, quests)
- H2 Weeks 9–11: conversion (KOC wave, launchpad/IDO coordination, whitelist hygiene)
- H2 Week 12: TGE and listing (exchange announcements, live coverage, support)
- H2 After TGE: the first 30 days
- H2 Budget split: how to think about it (no figures unless sourced)
- H2 Checklist (downloadable later as a lead magnet)
- CTA → `/services/token-launch-marketing`

### Outline C — "What is KOC marketing? A plain guide for Web3 projects"

- **Primary:** what is KOC marketing · **Secondary:** KOC marketing, key opinion consumer marketing, KOC marketing strategy · **Words:** 1,400–1,800 · **Author:** Head of Marketing & BD
- **Quick answer:** KOC marketing is word-of-mouth at scale: real users try a product and share honest experiences with their own (usually small) audiences. In crypto it works especially well for exchanges, wallets and apps where trust decides whether people sign up.
- H2 Where the term comes from (KOL → KOC)
- H2 Why it works in crypto (trust, scams, social proof)
- H2 What a KOC campaign looks like (brief → selection → posts → follow-ups)
- H2 Examples of formats (first-trade walkthroughs, feature threads, honest reviews)
- H2 How to find good KOCs
- H2 Measuring a KOC campaign
- H2 FAQ
- CTA → `/services/koc-marketing`

---

## 7. Case-study framework

**Template** (`/case-studies/{partner}-{campaign}`), 800–1,400 words:

1. Title: "{Partner}: {campaign type} for {goal}" (e.g. "LBank: KOC campaign for a new futures feature")
2. Summary box: partner, role (from `partnerships.ts`), period, services used, channels
3. The brief (what the partner wanted, in their terms)
4. What we did (steps, formats, number of creators — only if recorded)
5. Results (only figures the partner has approved, with the source: partner dashboard, X analytics, launchpad page)
6. What we learned (useful to readers, builds expertise)
7. Quote (optional, with written permission)
8. Related service + CTA

**Turning 243 partnerships into 6–10 case studies without overstating:**

| Step | What to do |
|---|---|
| 1. Shortlist | Pick 10–12 where we have the most material and the strongest brands: e.g. LBank (Strategic Partnership), Bybit/Gate/Bitget Wallet (KOC Partner), KuCoin/OKX (KOL Partner), Seedify (Core Contributor since 2021), a launchpad (TrustFi or DAO Maker), Galxe (quests), Base or Solana (ecosystem campaigns) |
| 2. Collect | For each: dates, brief or campaign page, our deliverables, screenshots of posts, any numbers the partner published or shared (reach, sign-ups, volume, whitelist entries), invoices only to confirm dates (not shown) |
| 3. Permission | Short email/Telegram to the partner contact: what we'd like to publish, the exact numbers and quote, and a draft for approval. Publish only on written approval. Keep the approval message. |
| 4. Without permission | Publish a "campaign note" instead: partner name and role (already public on our site), what type of work it was, no numbers, no quote. Or anonymise ("a top-10 centralised exchange"). |
| 5. Wording rules | "We ran…", "the campaign reached…" only with a source; never "guaranteed", "#1", "10x" unless verified; show the period the numbers cover |
| 6. Publish | One case study every 2 weeks from week 5; link from the relevant service page and from the partner's tile on /partnerships |

---

## 8. Internal linking plan

```
Home ──► /services (hub) ──► /services/{8 pages} ──► /case-studies/{…}
  │            ▲                     ▲   │                  │
  │            └──── /blog/{…} ──────┘   └──► /contact ◄────┘
  ├──► /partnerships ──► (role groups) ──► matching /services/{…}
  ├──► /products ──► /products/{9} ──► product sites (external)
  └──► /about ──► /journey, /team ──► /team/{5} ◄── blog author boxes
```

| Rule | Detail |
|---|---|
| Anchor text | Descriptive and varied: "crypto KOC marketing", "our KOC campaigns", "KOC marketing services" — never "click here"; exact-match at most once per page |
| Service pages | Each links up (hub), across (2–3 siblings), down (case studies, posts) and to contact |
| Blog | Every post: 1 link to its money page in the first 150 words, 1–2 to related posts, author box to team profile |
| Partners | Proposed "by role" groups on /partnerships link to the matching service page (KOC partners → KOC marketing, launchpads → token launch marketing) |
| Header | Services becomes a dropdown listing the 8 service pages (like Company today) |
| Footer | "Services" column with the 8 pages; "Resources" column with Blog and Case studies; LinkedIn (done) + company X and Telegram [needs owner input] |
| Products ↔ product sites | Product page → product site (done: "Product Page" button). Product site → `https://www.uniquelabs.org/products/{slug}` and the home page in its footer: "A product of Unique Labs" (anchor: "Unique Labs") — to add on growxapp.org, unfollowx.com, pdf.uniquelabs.org and check the others |
| Products → services | /products and each product page link to `/services/chrome-extension-development` ("we build extensions for clients too") |

---

## 9. E-E-A-T and brand disambiguation

**Entity line** (use it word for word everywhere): *Unique Labs — Web3 growth and software company based in Bangladesh, founded in 2019. KOC and KOL campaigns, consultancy, digital marketing and blockchain development.*

| Area | Action | Status |
|---|---|---|
| Titles and schema | Brand + category in home/about titles; Organization with founders, 2019, Bangladesh, `sameAs` | **Done** |
| About page | "Based in Bangladesh" (done). Add: city and time zone, languages, how the team works, a dated photo of the team, links to LinkedIn/X | Partly done |
| Team profiles | For each person add: 80–150-word bio, focus areas (`expertise`), 2–3 highlights with dates (e.g. "Seedify ambassador team, 2022"), LinkedIn URL, articles authored. The site already shows `shortBio`, `bio`, `responsibilities`, `expertise` and `links.linkedin` when filled in `src/content/team.ts` | To do **[needs owner input]** |
| Author pages | Team profiles double as author pages: blog posts link to them; profiles list "Articles by…" | With the blog |
| Consistent profiles | LinkedIn company page, company X, Telegram channel, Crunchbase, Clutch/GoodFirms: same name, logo, entity line, website `https://www.uniquelabs.org` | To do |
| Product sites | Footer "A product of Unique Labs" with link (see §8) — tells Google the products belong to this entity | To do |
| Knowledge Panel | 1) Consistent `sameAs` profiles (above). 2) Crunchbase + Wikidata item (Wikidata only if notable sources exist — do not create one with self-published sources only). 3) Google Business Profile if you have a staffed address (§11). 4) Once a panel appears, claim it via "Claim this knowledge panel" with the Google account that owns GSC. | To do |
| Reviews | Ask partners for reviews on Clutch/GoodFirms after case-study approval | To do |

---

## 10. Off-page and backlink strategy

Value is relative (High/Medium/Low); no link counts are promised.

| Priority | Tactic | Effort | Expected value | Notes |
|---|---|---|---|---|
| 1 | Product sites link to www.uniquelabs.org (footer + about block) | S | High | 9 owned sites; anchor "Unique Labs" and "Web3 growth and software company" |
| 2 | Chrome Web Store listings: developer website = www.uniquelabs.org; description ends "A product of Unique Labs (uniquelabs.org)" | S | Medium | Store links are nofollow but strengthen the entity |
| 3 | LinkedIn + company X + Telegram profiles optimised with entity line and link | S | Medium | Brand SERP and Knowledge Panel |
| 4 | Agency directories: Clutch, GoodFirms, DesignRush, Sortlist, TopDevelopers; crypto agency lists (e.g. "best crypto marketing agencies" roundups — request inclusion) | M | High | Profiles rank for "Web3 marketing agency" themselves; get 2–3 partner reviews |
| 5 | Partner pages: ask exchanges/launchpads with "partners" or "ambassadors" pages to list Unique Labs with a link | M | High | Start with Tier 1 where the relationship is strongest (LBank, Seedify, Bitget) |
| 6 | Case studies co-published or shared by partners | M | High | After permission (§7) |
| 7 | Product Hunt launches, one per extension (XAICG, Rowlio, FrameShot, Unique PDF first) | M | Medium | Each launch page links to the product site; product sites link to uniquelabs.org |
| 8 | PR on crypto media: founder story ("from airdrop hunters to agency"), data posts from own campaigns | M–L | Medium–High | CoinTelegraph/Decrypt press releases are paid and mostly nofollow — prefer earned stories and guest columns |
| 9 | Founder podcasts, AMAs and X Spaces as guests | M | Medium | Ask hosts for a show-notes link |
| 10 | Bangladesh business directories and tech communities (BASIS member directory if eligible, local startup lists) | S–M | Low–Medium | Only with a consistent NAP (§11) |
| 11 | Guest posts on Web3 marketing blogs | M | Medium | Topic = blog clusters; one link to a service page |

Avoid: paid link packages, PBNs, sitewide footer links from unrelated sites, and mass directory submissions.

---

## 11. Local SEO (Bangladesh)

- **Google Business Profile: yes.** There is now a published office (Dhaka). Create the profile with exactly the NAP below, category "Marketing agency" (secondary: "Software company"), the website `https://www.uniquelabs.org`, and verify it at that address.
- **NAP format** (use exactly the same everywhere once confirmed):

  ```
  Unique Labs
  #942, Shakila Tower, Ashkona (Uchartek Water Pump Road), Dakshinkhan, Dhaka 1230, Bangladesh
  contact@uniquelabs.org
  [Phone with +880 prefix, if you want one published]
  https://www.uniquelabs.org
  ```

- **Location page** (only if local clients matter): `/bangladesh` — H1 "Web3 marketing and blockchain development in Bangladesh"; sections: who we are locally, services for Bangladeshi companies, the Dhaka office, how to meet, FAQ. Otherwise keep location to About/Contact (done) and the schema (done).
- **Local citations:** GBP, Bing Places, Apple Business Connect, BASIS (if eligible), Bangladesh startup directories, LinkedIn location field.

---

## 12. Measurement setup

| Step | How |
|---|---|
| GSC | Add a **Domain property** for `uniquelabs.org` (DNS TXT record at your registrar) — covers www, apex and all product subdomains. Alternatively the HTML-tag method: paste the code into `src/content/site.ts` → `seo.googleSiteVerification` and push. Submit `https://www.uniquelabs.org/sitemap.xml`. URL-inspect and "Request indexing" for `/`, `/services`, `/about`, `/partnerships`, `/products` and the product pages. |
| Bing Webmaster Tools | "Import from GSC" (fastest), or paste the code into `seo.bingSiteVerification`. Submit the sitemap. |
| GA4 | Not installed — the privacy policy currently says "no analytics". Options: (a) privacy-friendly analytics without cookies (Vercel Web Analytics or Plausible) and update the policy; (b) GA4 with a consent banner. Recommendation: (a). **[needs owner decision]** |
| Events | `contact_email_click` (any `mailto:`), `telegram_click` (any `t.me/` link; param: admin), `product_page_click` (param: product), `store_click` (param: product), `partner_click`, later `form_submit` if a form is added |
| Keyword tracking | Track weekly in GSC (and Ahrefs/Semrush if available): crypto KOC marketing agency · KOC marketing · KOC vs KOL · Web3 KOL marketing agency · crypto KOL marketing agency · Web3 marketing agency · crypto marketing agency · token launch marketing · IDO marketing agency · launchpad marketing agency · crypto community management services · Web3 consultancy · blockchain development company · smart contract development services · Chrome extension development company · digital marketing agency Bangladesh · blockchain development company in Bangladesh · Unique Labs Web3 · Unique Labs Bangladesh |
| Looker Studio | Sources: GSC (site + URL impression tables), GA4/analytics. Pages: Overview (clicks, impressions, CTR, avg position; brand vs non-brand split by regex `unique ?labs`), Pages (top landing pages, service pages trend), Queries (tracked list, top-10 count), Leads (email + Telegram clicks by page), Indexing (manual monthly: pages indexed from GSC Pages report), Links (referring domains from Ahrefs/Semrush or GSC Links). |

---

## 13. 90-day roadmap

Owner roles: **Dev** (site changes — Claude/maintainer), **Owner** (facts, approvals), **Marketing** (content, outreach), **Partnerships** (partner permissions).

| Weeks | Deliverables | Owner | KPI |
|---|---|---|---|
| 1 | GSC + Bing verified, sitemap submitted, core URLs requested; owner answers §14 | Owner + Dev | All 24 sitemap URLs "Discovered"; ≥ 10 indexed (**estimate**) |
| 1–2 | Technical + metadata + schema (**done**); company X/Telegram in `sameAs`; product-site footer links | Dev | Rich Results Test passes for Organization, SoftwareApplication, Breadcrumb |
| 2 | Directory profiles: Clutch, GoodFirms, DesignRush, LinkedIn optimised, Crunchbase | Marketing | 5 profiles live |
| 3–4 | Service pages 1–3: KOC, KOL, token launch (+ FAQPage, Service schema, header dropdown) | Dev + Marketing + Owner | Pages indexed within 7 days of publishing |
| 5–6 | Service pages 4–8; /services hub updated; first case study published | Dev + Partnerships | 8 service pages indexed; first non-brand impressions on service queries |
| 5–12 | Blog: 1 post/week (posts 1, 2, 7 first), each linked from a service page | Marketing | 8 posts by week 12 |
| 6–12 | Case studies every 2 weeks (target 4 by week 12); partner backlink requests | Partnerships | 3–5 new referring domains (**estimate**) |
| 8–12 | Product Hunt launch (1–2 products), podcast/AMA guest spots (2) | Marketing | Product Hunt page live; 2 episodes |
| 12 | Review: GSC 3-month comparison, refresh titles with low CTR, plan next quarter | Dev + Owner | See targets below |

**Targets at day 90** (all **estimates**; baseline = GSC "Performance" for the first full week after verification, and "Pages → Indexed" on that date):

| KPI | Target range (estimate) |
|---|---|
| Pages indexed | 35–45 (24 today + 8 service + 8 posts + 4 case studies) |
| Impressions / month | 3,000–15,000 |
| Clicks / month | 80–400 |
| Non-brand queries with impressions | 150–600 |
| Keywords in top 10 | 5–20 (mostly long-tail and brand + service) |
| Referring domains | +8–20 |
| Leads (email + Telegram clicks) | Baseline in month 1, then +50–150 % (**estimate**) |

---

## 14. Open questions for the owner

1. **Search Console / Bing:** can you add the DNS TXT record for a Domain property, or send the HTML-tag codes so I add them to `src/content/site.ts`?
2. ~~Address~~ — answered: Dhaka office, now on the site and in the schema.
3. **Company social profiles:** company X account, Telegram channel/group, any YouTube/Medium? (Only LinkedIn is on the site now.)
4. ~~Services~~ — answered: yes, all eight. Pages are live.
5. ~~Pricing~~ — answered: priced per project (shown on every service page).
6. **Process:** how does a typical KOC/KOL campaign run for you (steps, timeline, how many creators, reporting)? This is the core of each service page.
7. **Blockchain development:** which chains and languages (EVM/Solidity, Solana/Rust, TON…)? Any delivered projects you can name? Do you arrange audits?
8. **Case studies:** results exist but are not public. Which partners would agree to a case study without numbers, or with numbers they approve? Until then, service pages say results are discussed privately.
9. **Team bios:** 80–150 words each, LinkedIn URLs, and 2–3 dated highlights per person.
10. **Analytics:** OK to add cookie-free analytics (Vercel Web Analytics or Plausible) and update the privacy policy?
11. **Blog authors:** who writes or approves posts, and in what language/voice?
12. **Product sites:** may I add a "A product of Unique Labs" footer link to each product repository (UnfollowX, GrowX, Unique PDF and the others)?
13. **Home H1:** keep "Build, launch and grow." or add a visible keyword line such as "Web3 marketing, KOC and blockchain development"?
