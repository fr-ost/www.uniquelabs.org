# SEO program — www.uniquelabs.org (v2)

Version 2, 23 Nov 2026. Rewritten against the owner's re-crawl of 23 Nov (8:30 AM Dhaka) and the live code in this repository.

How to read this document:

- **Done** = implemented and on `main`. Round 1: commit `1517eb0` (titles, schema, technical fixes) and `2227b2b` (eight service pages, Dhaka address). Round 2: commit `8ab2c44` (home LCP, marquee links, visible location, deeper service pages).
- No search volumes, traffic, difficulty or backlink numbers are invented. Where a number is needed it is labelled **estimate**, or the tool to pull it from is named (Google Search Console = GSC, Ahrefs or Semrush, Google Keyword Planner).
- The repository rule "never invent facts" (`CLAUDE.md`) applies. Anything that needs a fact only the company has is marked **[needs owner input]** and listed in section 14.
- Owner answers already received (22 Nov): all eight services are sold; every service is **priced per project** (no public price ranges); campaign **results exist but are not published**; office: #942, Shakila Tower, Ashkona (Uchartek Water Pump Road), Dakshinkhan, Dhaka 1230, Bangladesh.

**What changed since the 23 Nov crawl (round 2, `8ab2c44`):**

| Crawl finding | Status now |
|---|---|
| Home mobile LCP 3.1 s | Two below-the-fold preloads removed (a product banner with an 11-size `srcset`, five partner logos) and the LCP element (hero label) no longer fades in. Throttled phone test, cold cache: first paint ~2.8 s → ~1.3 s, LCP ~3.4 s → ~1.6 s (**our test, not Lighthouse** — re-run Lighthouse to confirm). |
| Marquee renders 43 decorative duplicate logos | The duplicate copy is now added in the browser **without links** (plain elements, lazy images, `aria-hidden`). Server HTML has each partner once; the rendered DOM has each partner *link* once. The decorative images remain (needed for the seamless loop). |
| No visible location on home/services | "Based in Dhaka, Bangladesh" in the home introduction, "From our office in Dhaka, Bangladesh" on /services, and the full address in the footer of every page. |
| Service pages 660–1,084 words | Each page gained two general sections and two FAQs (main-content word counts now ~770–1,250; 6–8 FAQs each). Reaching 1,500+ needs process and case material — §5. |
| 2 dead X links on /partnerships | Removed from the code on 22 Nov (`1517eb0`); the current build contains neither `x.com/ToncashNetwork` nor `x.com/zaddrnet`. If a crawler still reports them, it is reading a cached copy — re-crawl after the next deploy. |

---

## 1. Executive summary

1. **Indexing is still the blocker.** The site does not appear for `site:uniquelabs.org`. Nothing below pays off until Google and Bing have the 33 URLs. Week 1: verify a Domain property in GSC (DNS TXT) and Bing, submit `/sitemap.xml`, URL-inspect and request indexing for the home page, `/services`, the 8 service pages and `/about`. Highest impact, lowest effort.
2. **On-page foundations are done.** Keyword titles (≤ 60 chars) and full meta descriptions on every page, eight service pages with Service + FAQPage schema, Organization + ProfessionalService with the Dhaka address, clean sitemap with `lastmod`, noindexed empty `/projects`. Lighthouse SEO 100.
3. **Brand disambiguation is the second lever.** "Unique Labs" is shared with unrelated companies. Add the company X, Telegram, Chrome Web Store publisher page and Crunchbase to `sameAs`, use one entity line everywhere, and get the 5 product sites without a link to link back (§9–10).
4. **Service-page depth is the main ranking lever once indexed.** Competitors rank with 1,400–2,900-word pages. Ours are ~770–1,250. The missing pieces are facts only the company has: **process**, **named campaign examples** (results can stay private) and **delivery details** (§5). General guidance has already been added.
5. **Case studies without numbers are still valuable.** Results are private, so publish "campaign notes": partner, role, period, what was done, formats, lessons — no metrics unless a partner approves (§7). 6 by week 12.
6. **A focused blog feeds the service pages.** 24 posts in 6 months across KOC/KOL, token launch, Web3 growth and development; each links to one service page (§6). Start with "KOC vs KOL", "What is KOC marketing?" and "How to market a token launch".
7. **Owned links are free and fast.** 9 product sites and their Chrome Web Store listings; 5 sites still have no link to www.uniquelabs.org. One afternoon (§10).
8. **Local is a quick win now there is an office.** Google Business Profile for the Dhaka office, consistent NAP, Bangladesh directories (§11).
9. **People signals are thin.** Five team profiles are ~135 words. Real bios, expertise, highlights and LinkedIn turn them into author pages that support E-E-A-T (§9).
10. **Order of impact:** indexing → entity (`sameAs`, product-site links) → service-page depth → GBP/local → case studies → blog → directories and PR.

---

## 2. Technical fix list

| # | Issue | Priority | Fix | Effort | Status |
|---|---|---|---|---|---|
| 1 | Not visible in Google/Bing | Critical | GSC Domain property (DNS TXT) + Bing import; submit sitemap; request indexing of 11 core URLs; check "Pages" report for exclusions | S | **To do** (needs DNS access or verification codes) |
| 2 | Brand ambiguity | Critical | Entity line in titles/schema (done); `sameAs` with company X, Telegram, Chrome Web Store publisher, Crunchbase, Clutch; product-site links | M | Partly done |
| 3 | Service pages thinner than competitors | High | Upgrade briefs §5: process, campaign notes, delivery details, more FAQs | M–L | Partly done (general sections + FAQs added) |
| 4 | No blog / case studies | High | `/blog` + `/case-studies` routes and content (§4, §6, §7) | L | To do |
| 5 | `sameAs` = LinkedIn only | Medium | Add profiles to `company.socials` in `src/content/company.ts` → flows to schema and footer | S | To do **[needs owner input]** |
| 6 | Team profiles ~135 words | Medium | Bios, expertise, highlights, LinkedIn in `src/content/team.ts` (§9) | M | To do **[needs owner input]** |
| 7 | 5 product sites don't link back | Medium | Footer "A product of Unique Labs" link on growxapp.org, unfollowx.com, pdf, twofold, scorex sites | S | To do (product repos; owner approval) |
| 8 | Home mobile LCP 3.1 s | Low | Remove below-the-fold preloads; no fade on LCP element | S | **Done** (`8ab2c44`) |
| 9 | Marquee duplicates | Low | Copy added client-side without links, lazy images | S | **Done** (`8ab2c44`) |
| 10 | No visible location on home/services | Medium | Intro copy, /services hero, footer address | S | **Done** (`8ab2c44`) |
| 11 | Dead X links | Low | Removed in code | S | **Done** (`1517eb0`) — re-crawl |
| 12 | Titles/metas | High | Keyword titles ≤ 60, metas 120–160 | S | **Done** |
| 13 | Schema | High | Organization + ProfessionalService, WebSite, Service, FAQPage, ItemList, BreadcrumbList, SoftwareApplication, Person | S | **Done** |
| 14 | robots `Host`, sitemap `lastmod`, favicon, `/projects` noindex, `?status=` | Low | — | S | **Done** |
| 15 | /partnerships page weight (~700 KB) | Low | Optional: Tier 2 as a lighter list; logos on expand | M | Optional |
| 16 | Header has no service links | Medium | Services dropdown listing the 8 pages (like Company) | S | To do |
| 17 | No FAQ/HowTo on blog (future) | Low | FAQPage on posts with visible Q&A | S | With the blog |

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

**Service page** (done; `src/app/(site)/services/[slug]/page.tsx`, content in `src/content/service-pages.ts`):

```ts
// src/app/(site)/services/[slug]/page.tsx
export const dynamicParams = false;

export async function generateStaticParams() {
  return (await getServicePages()).map((page) => ({ slug: page.slug }));
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const page = await getServicePage(slug);
  if (!page) return { title: "Service not found", robots: { index: false } };
  return pageMetadata({
    title: page.seoTitle, // "Crypto KOC Marketing Agency" (+ " — Unique Labs"); validator: ≤ 46 chars
    description: page.seoDescription, // validator: 120–155 chars
    path: `/services/${page.slug}`,
    imageAlt: page.name,
  });
}
// …and in the page: <JsonLdScript data={[servicePageJsonLd(page), faqJsonLd(page.faqs)]} />
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

**Organization** — as rendered on the home and About pages today (the full street address makes it a ProfessionalService too):

```json
{
  "@context": "https://schema.org",
  "@type": ["Organization", "ProfessionalService"],
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
  "sameAs": [
    "https://www.linkedin.com/company/u-l",
    "https://x.com/[company handle — needs owner input]",
    "https://t.me/[company channel — needs owner input]",
    "https://chromewebstore.google.com/[publisher page — needs owner input]",
    "https://www.crunchbase.com/organization/[slug — once created]"
  ],
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "#942, Shakila Tower, Ashkona (Uchartek Water Pump Road), Dakshinkhan",
    "addressLocality": "Dhaka",
    "postalCode": "1230",
    "addressCountry": "BD"
  },
  "areaServed": "Worldwide",
  "contactPoint": [{ "@type": "ContactPoint", "contactType": "customer support", "email": "contact@uniquelabs.org", "availableLanguage": ["English"] }],
  "knowsAbout": ["KOC marketing", "Consultancy", "Digital marketing", "Blockchain development", "Software development", "AI & experimentation"]
}
```

Live today: everything above except the bracketed `sameAs` entries (only LinkedIn is live). Add each profile to `company.socials` in `src/content/company.ts` and it appears in `sameAs` and the footer. Add `geo` (latitude/longitude of the office) and `telephone` once the owner confirms them.

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
| Marquee duplication | **Done.** `Marquee` renders each item once on the server; `MarqueeClone` (`src/components/motion/marquee-clone.tsx`) adds the decorative copy in the browser: `aria-hidden`, links turned into plain elements, images `alt=""` and lazy. Both copies sit in one animated strip so they can never drift. |
| Home LCP | **Done.** No `priority` on the home product banner (far below the fold), partner logos in the hero not preloaded, and no fade-in on the hero label (the LCP element). |
| Partner logo weight | **Done.** `PartnerLogo` (`src/components/ui/partner-logo.tsx`) serves the 128 px WebP logos with a plain `<img loading="lazy">`: no `srcset`, which was ~330 KB of the Partnerships HTML. |
| Partnerships page | Remaining weight is mostly the React payload for 243 tiles. Next step if needed: render Tier 2 as a lighter list (name + role, no logo) and load logos on expand. |
| Unused JS (~30 KiB) | Earlier work already removed `motion` and `lenis`. Remaining: check `npx next build --profile` output; most is the framework runtime. Low priority. |
| Render-blocking CSS | One small Tailwind CSS file. Acceptable: Lighthouse performance is 93–99. Optional experiment: `experimental: { inlineCss: true }` in `next.config.ts`, which inlines it into the HTML — measure LCP and HTML size before keeping it. |

```tsx
// src/components/motion/marquee.tsx (excerpt)
<div className="marquee" data-reverse={reverse ? "" : undefined} style={style}>
  <div className="marquee__strip">
    <ul className="marquee__track" aria-label={label}>{items.map((item) => <li key={getKey(item)}>{renderItem(item)}</li>)}</ul>
    <MarqueeClone /> {/* replaced in the browser by an aria-hidden copy of the track, without links */}
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

Titles and descriptions are the **live values** unless marked "proposed". " — Unique Labs" is added by the title template where shown. Word counts are main-content targets.

| URL | Primary keyword | Title (≤ 60) | Meta description (140–155) | H1 | H2 outline | Words | Internal links to add |
|---|---|---|---|---|---|---|---|
| `/` | Web3 marketing agency | Unique Labs: Web3 Marketing, KOC & Blockchain Development | Unique Labs is a Web3 growth agency from Bangladesh: KOC and KOL campaigns, consultancy, digital marketing and blockchain development since 2019. | Build, launch and grow. (keep; proposed visible sub-line "Web3 marketing, KOC and blockchain development from Dhaka") | Introduction · What we do (cards → 8 service pages, done) · Trusted across Web3 · Products · Principles · Story · People | 1,300–1,600 | Body-copy links in the introduction to `/services/koc-marketing`, `/services/token-launch-marketing`; latest 3 blog posts once live |
| `/services` | Web3 marketing services | Web3 Marketing, KOC & Blockchain Services — Unique Labs | Unique Labs services: crypto KOC and KOL campaigns, Web3 consultancy, digital marketing, blockchain development and Chrome extension builds. | Web3 marketing and development services. | All services (8 cards, done) · What we do (6 blocks, each links to its page, done) · How we help · Products | 1,000–1,300 | Case studies hub; `/partnerships` |
| `/services/koc-marketing` | crypto KOC marketing agency | Crypto KOC Marketing Agency — Unique Labs | Crypto KOC marketing by Unique Labs: real users and creators recommend your exchange or token, planned and run end to end. KOC partner of Bybit and Gate. | Crypto KOC marketing that people trust. | See §5.1 | 1,600–2,200 | §5.1 |
| `/services/kol-marketing` | Web3 KOL marketing agency | Web3 & Crypto KOL Marketing Agency — Unique Labs | Web3 KOL marketing from Unique Labs: crypto influencer campaigns on X and Telegram, from KOL selection to briefs and timing. KOL partner of KuCoin and OKX. | Web3 KOL marketing. | §5.2 | 1,600–2,200 | §5.2 |
| `/services/token-launch-marketing` | token launch marketing | Token Launch & IDO Marketing Agency — Unique Labs | Token launch and IDO marketing by Unique Labs: KOC and KOL campaigns, launchpad coordination and community growth before and after your TGE. | Token launch marketing, from announcement to TGE. | §5.3 | 1,800–2,500 | §5.3 |
| `/services/web3-consulting` | Web3 consultancy | Web3 Consultancy & Go-to-Market Strategy — Unique Labs | Web3 consultancy from Unique Labs: positioning, go-to-market and growth plans for token projects and exchanges, from a team with 240+ Web3 partners. | Web3 consultancy for founders and growth teams. | §5.4 | 1,500–1,900 | §5.4 |
| `/services/digital-marketing` | Web3 digital marketing agency | Digital Marketing for Web3 Projects & Brands — Unique Labs | Digital marketing by Unique Labs: social media, content, community and campaigns on X, Telegram and beyond, for Web3 projects and brands that want to grow. | Digital marketing for Web3 projects and brands. | §5.5 | 1,500–1,900 | §5.5 |
| `/services/community-management` | crypto community management services | Crypto Community Management Services — Unique Labs | Crypto community management by Unique Labs: Telegram and X communities, ambassador programmes and AMAs, run by a team that grew up in Web3 communities. | Community management for crypto projects. | §5.6 | 1,500–1,900 | §5.6 |
| `/services/blockchain-development` | blockchain development company | Blockchain & Smart Contract Development — Unique Labs | Blockchain development by Unique Labs: smart contracts, decentralised applications and the websites and tools around them, for Web3 projects worldwide. | Blockchain and smart contract development. | §5.7 | 1,500–2,000 | §5.7 |
| `/services/chrome-extension-development` | Chrome extension development company | Chrome Extension Development Company — Unique Labs | Chrome extension development by the team behind nine of its own extensions, including Unique PDF, FrameShot and XAICG. Manifest V3, privacy-first. | Chrome extension development. | §5.8 | 1,500–2,000 | §5.8 |
| `/products` | free Chrome extensions | Free Chrome Extensions for X, PDF & More — Unique Labs | Chrome extensions built in-house by Unique Labs: UnfollowX Pro, GrowX, Unique PDF, FrameShot, Twofold, Rowlio, ScoreX, XAICG and UniqueFarm. | Chrome extensions, built in-house. | Product grid · Proposed: "We build extensions for clients too" block | 700–900 | `/services/chrome-extension-development` (proposed block) |
| `/products/unfollowx-pro` | mass unfollow X free | UnfollowX Pro: Free Mass Unfollow Tool for X — Unique Labs | UnfollowX Pro is a free Chrome extension that shows who doesn't follow you back on X (Twitter) and unfollows them at a safe pace. No limits, no sign-up. | UnfollowX Pro | About · Features · Screenshots · Links | 600–900 | `/services/chrome-extension-development` ("built by our extension team") |
| `/products/growx` | X growth tool Chrome | GrowX: X (Twitter) Growth Tool for Chrome — Unique Labs | GrowX is an all-in-one X (Twitter) growth extension for Chrome: smart auto follow, a post scheduler, an on-device AI writer and an unfollower tracker. | GrowX | as above | 600–900 | as above |
| `/products/unique-pdf` | free PDF editor Chrome extension | Unique PDF: Free PDF Editor Chrome Extension — Unique Labs | Unique PDF puts 20 free PDF tools in Chrome: merge, split, compress, edit, sign and protect, plus AI chat with any PDF. Files never leave your browser. | Unique PDF | as above | 600–900 | as above |
| `/products/frameshot` | free screen recorder Chrome extension | FrameShot: Free Screen Recorder for Chrome — Unique Labs | FrameShot is a free Chrome screen recorder and full-page screenshot tool. Record with sound and camera, annotate and blur. No watermark, stays on device. | FrameShot | as above | 600–900 | as above |
| `/products/twofold` | Chrome 2FA authenticator | Twofold: Free 2FA Authenticator for Chrome — Unique Labs | Twofold is a free 2FA authenticator for Chrome: one-click codes, phishing-aware autofill, passkeys, QR scanning and encrypted sync. No ads, works offline. | Twofold | as above | 600–900 | as above |
| `/products/rowlio` | web scraper Chrome extension free | Rowlio: Free Web Scraper Chrome Extension — Unique Labs | Rowlio is a free web scraper for Chrome. Extract tables, listings, links, images and contacts into clean rows, then export to CSV, Excel or JSON locally. | Rowlio | as above | 600–900 | as above |
| `/products/scorex` | influencer score X | ScoreX: Grow Your Influencer Score on X — Unique Labs | ScoreX is a Chrome extension that replies to the smart accounts you pick on X, in your own voice, to grow your influencer score. Invite-only early access. | ScoreX | as above | 600–900 | as above, plus `/services/kol-marketing` |
| `/products/xaicg` | AI reply generator for X | XAICG: Free AI Reply Generator for X (Twitter) — Unique Labs | XAICG is a free, unlimited AI reply generator for X (Twitter). Replies, questions, posts and threads in your voice, written privately on your own computer. | XAICG | as above | 700–1,000 | as above |
| `/products/uniquefarm` | (brand only) | UniqueFarm: X Engagement Side Panel (Private) — Unique Labs | UniqueFarm is a private Chrome side panel for X that drafts replies in your voice with human timing and a review hold. No external licences are sold yet. | UniqueFarm | as above | 500–800 | as above |
| `/partnerships` | Web3 partners / crypto exchange partners | 243 Web3 Partners: Exchanges & Launchpads — Unique Labs | 243 exchanges, launchpads, ecosystems and Web3 projects Unique Labs has worked with as ambassadors, KOC and KOL partners and campaign partners. | Web3 partners: exchanges, launchpads and chains. | Tier 1 · Tier 2 · Proposed "By role" groups linking to service pages | 1,400–1,600 | Each role group → its service page |
| `/projects` | — (noindex) | Case studies and projects — Unique Labs | (unchanged) | Our work. | Becomes `/case-studies` (§4) | — | — |
| `/about` | Unique Labs Web3 Bangladesh | About Unique Labs: Web3 Growth Company Since 2019 | Unique Labs is a Web3 growth and software company from Bangladesh. Founded in 2019 by friends who hunted airdrops, now a partner to 240+ Web3 projects. | From a group of friends to a Web3 growth partner. | Who we are · Why we exist · Mission & vision · Philosophy · Approach · Direction · The people · Proposed "Our office" (Dhaka, map link, how to meet) | 1,000–1,300 | `/services` (each), `/journey`, `/team` |
| `/journey` | Unique Labs history | Our Story: From Airdrop Hunters to Web3 Agency — Unique Labs | How Unique Labs grew from a group of friends hunting airdrops in Bangladesh in 2019 into a Web3 growth and software company, year by year. | The Unique Labs story. | One entry per year 2019–2026 | 600–900 | Year entries → matching service pages |
| `/team` | Unique Labs team | Our Team: Web3 Growth & Marketing Leaders — Unique Labs | Meet the Unique Labs leadership team: the founders and heads of growth, partnerships and marketing behind our Web3 campaigns and products. | The people behind Unique Labs. | Leadership · Proposed "How we work together" | 400–600 | Profiles; `/about` |
| `/team/{5 people}` | person name | "{Name}, {Role} of Unique Labs" | "{Name} is {Role} at Unique Labs, a Web3 growth and software company from Bangladesh. Profile, role and links to X and Telegram." | {Name} | Role · Focus areas · Highlights · Articles | 300–500 each | Authored posts; services they lead |
| `/contact` | contact Unique Labs | Contact Us: Web3 Marketing & KOC Enquiries — Unique Labs | Contact Unique Labs at contact@uniquelabs.org or message our admins on Telegram about KOC campaigns, Web3 marketing or blockchain development. | Contact Unique Labs. | Email · Telegram admins · Location (done) · Proposed "What to include in your brief" | 300–450 | Service pages |
| `/privacy`, `/terms` | — | (live) | (live, 138–150 chars) | (unchanged) | — | — | — |

---

## 4. Site architecture

The eight service URLs are confirmed — keep them; they map one-to-one to the keyword clusters and are already linked from `/services`, the home page and the footer.

```
www.uniquelabs.org/
├── /                                         home
├── /services                                 hub ✔
│   ├── /services/koc-marketing               ✔
│   ├── /services/kol-marketing               ✔
│   ├── /services/token-launch-marketing      ✔
│   ├── /services/web3-consulting             ✔
│   ├── /services/digital-marketing           ✔
│   ├── /services/community-management        ✔
│   ├── /services/blockchain-development      ✔
│   └── /services/chrome-extension-development ✔
├── /case-studies                             new hub (308 /projects → /case-studies when the first one ships)
│   └── /case-studies/{partner}-{campaign}    e.g. /case-studies/lbank-koc-campaign
├── /blog                                     new hub
│   ├── /blog/category/koc-kol
│   ├── /blog/category/token-launch
│   ├── /blog/category/web3-growth
│   ├── /blog/category/development
│   └── /blog/{slug}
├── /partnerships                             ✔ (proposed role groups)
├── /products + 9 product pages               ✔
├── /about  /journey  /team (+5)  /contact    ✔
└── /privacy  /terms                          ✔
```

| Decision | Recommendation |
|---|---|
| Category pages | Index them only once each has 4+ posts; until then `noindex, follow` |
| Blog URLs | Flat `/blog/{slug}` (no dates) so posts can be refreshed |
| Case studies | Own section, not inside `/blog`; link from the matching service page and the partner's tile |
| Location section | Not a separate page yet. The office is on Contact, About, the footer and in schema (done). Build `/bangladesh` only if local clients become a goal (§11) |
| Header | Add a Services dropdown (8 links), like the Company menu |
| Content model | Add `src/content/posts.ts` and `src/content/case-studies.ts` with the same validation approach as `service-pages.ts` |

---

## 5. Content upgrade briefs (the 8 service pages)

Every page already has: quick answer, "who it's for", 4–6 sections, partners by role (live from `partnerships.ts`), "Priced per project", "Results, privately", 6–8 FAQs with FAQPage schema, related services, Service + BreadcrumbList schema. To reach competitor depth (1,500+ words), each brief lists what to **add**. Items marked **[owner]** need facts from the company.

Common additions for all eight:

| Block | Content | Source |
|---|---|---|
| "How we work" (H2) | 4–6 steps of the real engagement: first call, scoping, plan, execution, reporting, wrap-up; typical timelines | **[owner]** |
| "Campaign notes" (H2) | 2–3 named examples: partner, role, period, what we did, formats — **no metrics** unless approved | **[owner]** + `partnerships.ts` |
| "What you receive" (H3) | Deliverables (plan, briefs, schedule, report) | **[owner]** |
| Comparison table | e.g. KOC vs KOL, in-house vs agency, Telegram vs Discord | General knowledge |
| 2 more FAQs | Buyer questions (contracts, NDAs, start time, languages) | **[owner]** |
| Links from blog | 2–3 posts per page (§6) | Content plan |

### 5.1 `/services/koc-marketing`

| Field | Brief |
|---|---|
| Now | ~1,250 words; 8 FAQs; sections: what is KOC · KOC or KOL · what we do · why us · measuring · common mistakes |
| Intent | Commercial (primary), informational (secondary) |
| Primary / secondary | crypto KOC marketing agency / KOC marketing; KOL KOC marketing; key opinion consumer marketing; KOC marketing strategy; KOC vs KOL |
| Title / meta / H1 | Keep (live) |
| Quick answer | Keep (live, 58 words) |
| Outline (add **bold**) | What is KOC marketing? · KOC or KOL (+ **comparison table**: reach, trust, cost model, best stage) · What we do · **How a KOC campaign runs (H3 per step) [owner]** · **Campaign notes: e.g. Gate, Bybit, Bitget Wallet (KOC Partner); Binance (KOC Campaigns) [owner]** · Measuring · Common mistakes · Why us · Partners · Pricing · FAQ |
| Proof | KOC Partner: Gate, Bybit, Bitget Wallet (Tier 1), SuperEx, OKX Wallet, Binance Wallet, BloFin, IXFI; KOC Campaigns: Binance; KOC Campaign (30): Altura, AITECH, Falcon Finance, Hinkal… |
| FAQs to add | How many KOCs are in a typical campaign? **[owner]** · Which languages and regions can your KOCs cover? **[owner]** |
| CTA / schema | "Plan a KOC campaign" → `/contact` / Service, FAQPage, BreadcrumbList (live) |
| Links | From blog posts 1, 2, 4; to case studies once live |
| Target | 1,800–2,200 words |

### 5.2 `/services/kol-marketing`

| Field | Brief |
|---|---|
| Now | ~1,060 words; 8 FAQs |
| Primary / secondary | Web3 KOL marketing agency / crypto KOL marketing agency; crypto influencer marketing agency; Web3 KOL list |
| Outline (add **bold**) | What KOL marketing does · Choosing KOLs · Formats · What we do · **KOL tiers explained (table: nano/micro/mid/top — general)** · **How a KOL campaign runs [owner]** · **Campaign notes: KuCoin, OKX, Cheelee (KOL Partner) [owner]** · Measuring · Red flags · Partners · Pricing · FAQ |
| Proof | KOL Partner: KuCoin, OKX, Cheelee, Kraken, Trust Wallet, CoinGecko, Grvt, LCX; KOL Campaign (31): Unicity, Alva AI, Edu3Labs, World of Dypians; Creator Campaigns: Kaito AI, Zora |
| FAQs to add | Do you have a KOL list or network we can see? **[owner]** · Which regions do your KOLs cover? **[owner]** |
| Target | 1,700–2,200 |

### 5.3 `/services/token-launch-marketing`

| Field | Brief |
|---|---|
| Now | ~1,060 words; 8 FAQs; includes a 12-week table |
| Primary / secondary | token launch marketing / token launch marketing strategy; IDO marketing agency; launchpad marketing agency; how to promote a crypto project |
| Outline (add **bold**) | Phases · Where we help · 12-week timeline · Common mistakes · Launchpads we have worked with · **Before TGE checklist (H3 list, general)** · **Campaign notes: a launchpad (TrustFi/SeaFi/DAO Maker) and CoinList token-sale campaigns [owner]** · **How an engagement starts and how far ahead to book [owner]** · Partners · Pricing · FAQ |
| Proof | Launchpad Partner (7), IDO Partner (5), Token Sale Campaigns: CoinList, Core Contributor: Seedify, Launch Support: Elixir Games, Storm Warfare |
| FAQs to add | How far before TGE should we contact you? **[owner]** · Do you work on multiple chains? (general yes/no **[owner]**) |
| Target | 2,000–2,500 |

### 5.4 `/services/web3-consulting`

| Field | Brief |
|---|---|
| Now | ~910 words; 6 FAQs |
| Primary / secondary | Web3 consultancy / blockchain consulting services; Web3 go-to-market strategy; crypto marketing consultant |
| Outline (add **bold**) | When to bring in a consultant · What we advise on · From plan to execution · Our perspective · Questions we help answer · Signs your GTM needs work · **Engagement formats (one-off workshop, launch plan, ongoing advisory) [owner]** · **What you receive (plan document, channel plan, calendar) [owner]** · **Campaign note: LBank strategic partnership [owner]** · FAQ |
| FAQs to add | Do you sign NDAs? **[owner]** · How long is a typical engagement? **[owner]** |
| Target | 1,500–1,900 |

### 5.5 `/services/digital-marketing`

| Field | Brief |
|---|---|
| Now | ~810 words; 6 FAQs |
| Primary / secondary | Web3 digital marketing agency / crypto marketing agency; Web3 growth agency; crypto social media marketing; digital marketing agency Bangladesh |
| Outline (add **bold**) | What we cover · Quest and engagement campaigns · Working with KOCs and KOLs · Planning content · Measuring · **Channels in depth (X, Telegram, others) [owner: which channels you actually run]** · **For brands outside Web3 (what changes) [owner]** · **Campaign notes: Galxe quests; BitMEX trading campaign [owner]** · FAQ |
| Proof | Quest Campaign Partner: Galxe; Engagement Campaign: Aptos, MetaMask, Aleo, Litecoin; Growth Campaign (28); Trading Campaign Partner: BitMEX; Campaign Partner: WEEX, AscendEX |
| FAQs to add | Do you create graphics and video? **[owner]** · Do you work with Bangladeshi brands? **[owner]** |
| Target | 1,500–1,900 |

### 5.6 `/services/community-management`

| Field | Brief |
|---|---|
| Now | ~810 words; 7 FAQs |
| Primary / secondary | crypto community management services / Telegram community management; crypto ambassador program; Discord community management Web3 |
| Outline (add **bold**) | What it covers · Ambassador programmes · Why it matters at launch · Moderation basics · Measuring health · **Telegram vs Discord (table, general)** · **Coverage and time zones (Dhaka base, hours covered) [owner]** · **Campaign notes: Nodepay community campaign; Seedify ambassador team 2022 [owner]** · FAQ |
| FAQs to add | What hours do you cover? **[owner]** · Which languages do your moderators speak? **[owner]** |
| Target | 1,500–1,900 |

### 5.7 `/services/blockchain-development`

| Field | Brief |
|---|---|
| Now | ~765 words; 6 FAQs; no images |
| Primary / secondary | blockchain development company / smart contract development services; smart contract development cost; Web3 development agency; blockchain development company in Bangladesh |
| Outline (add **bold**) | What we build · Cost drivers · Development and launch together · Security basics · Questions before a build · **Chains and stack (EVM/Solidity, Solana/Rust, TON… ) [owner]** · **Audits: who you work with [owner]** · **Examples of delivered work (even internal) [owner]** · **Bangladesh-based team, global clients** (fact: office) · FAQ |
| Images | A simple architecture diagram (contracts ↔ dApp ↔ site) as SVG — general, no client data |
| FAQs to add | Which chains do you develop on? **[owner]** · Do you maintain contracts after launch? **[owner]** |
| Target | 1,500–2,000 |

### 5.8 `/services/chrome-extension-development`

| Field | Brief |
|---|---|
| Now | ~1,190 words; 7 FAQs; product cards |
| Primary / secondary | Chrome extension development company / Chrome extension development services; browser extension development company; Manifest V3 migration |
| Outline (add **bold**) | Extensions we have built · How we build · What we deliver · What an extension can do · Permissions and privacy · **Manifest V3 migration (general explainer)** · **On-device AI in extensions (XAICG as example — fact)** · **How a project runs and typical timelines [owner]** · FAQ |
| FAQs to add | Do you maintain extensions after launch? **[owner]** · Can you take over an existing extension? **[owner]** |
| Target | 1,600–2,000 |

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
| Header | Services becomes a dropdown listing the 8 service pages (like Company today) — to do |
| Footer | "Services" column with the 8 pages (**done**); address (**done**); "Resources" column with Blog and Case studies (with the blog); LinkedIn (done) + company X and Telegram [needs owner input] |
| Products ↔ product sites | Product page → product site (done: "Product Page" button). Product site → `https://www.uniquelabs.org/products/{slug}` and the home page in its footer: "A product of Unique Labs" (anchor: "Unique Labs") — missing on growxapp.org, unfollowx.com, pdf.uniquelabs.org, twofold.uniquelabs.org and scorex.uniquelabs.org (23 Nov crawl) |
| Home body copy | Link "KOC and consultancy services" in the home introduction to `/services/koc-marketing` and "blockchain development" to `/services/blockchain-development` (needs Markdown support in the intro, S) |
| Products → services | /products and each product page link to `/services/chrome-extension-development` ("we build extensions for clients too") |

---

## 9. E-E-A-T and brand disambiguation

**Entity line** (use it word for word everywhere): *Unique Labs — Web3 growth and software company based in Bangladesh, founded in 2019. KOC and KOL campaigns, consultancy, digital marketing and blockchain development.*

| Area | Action | Status |
|---|---|---|
| Titles and schema | Brand + category in home/about titles; Organization + ProfessionalService with founders, 2019, Dhaka address, `sameAs` (LinkedIn only so far) | **Done** (expand `sameAs`) |
| About page | "Based in Dhaka, Bangladesh" and the office address (done). Add: time zone and languages, how the team works, a dated team photo, an "Our office" block with a map link | Partly done |
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
| 1 | Product sites link to www.uniquelabs.org (footer + about block) | S | High | 5 of the product sites still have no link (growxapp.org, unfollowx.com, pdf, twofold, scorex); anchor "Unique Labs" |
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

Starts the week of 24 Nov 2026. Roles: **Dev** (site changes — Claude/maintainer), **Owner** (facts, approvals, accounts), **Marketing** (content, outreach), **Partnerships** (partner permissions).

| Weeks | Deliverables | Owner | KPI |
|---|---|---|---|
| 1 | GSC Domain property + Bing verified; sitemap submitted; indexing requested for 11 core URLs; Lighthouse re-run on home | Owner + Dev | All 33 sitemap URLs "Discovered"; ≥ 15 indexed by end of week 2 (**estimate**) |
| 1–2 | `sameAs` (X, Telegram, Chrome Web Store publisher, Crunchbase); header Services dropdown; product-site footer links on 5 sites; GBP created | Owner + Dev | Rich Results Test passes; GBP verification postcard requested |
| 2 | Directory profiles: Clutch, GoodFirms, DesignRush, Crunchbase; LinkedIn page completed | Marketing | 4–5 profiles live |
| 3–4 | Upgrade service pages 5.1–5.3 (KOC, KOL, token launch) with process, campaign notes, deliverables | Owner + Dev | 3 pages ≥ 1,600 words; indexed |
| 3–6 | Upgrade 5.4–5.8; team bios (5 profiles to 300+ words) | Owner + Dev | All 8 service pages ≥ 1,500 words |
| 5–6 | `/blog` and `/case-studies` routes; first 2 posts ("KOC vs KOL", "What is KOC marketing?"); first campaign note | Dev + Marketing + Partnerships | Posts indexed within 7 days |
| 6–12 | 1 post per week; 1 campaign note every 2 weeks; partner link requests; Product Hunt (1–2 extensions); 2 podcast/AMA guest spots | Marketing + Partnerships | 8 posts, 4 campaign notes by week 12 |
| 12 | Review in GSC (3-month view): titles with low CTR, queries ranking 8–20 → refresh pages; plan next quarter | Dev + Owner | Targets below |

**Day-90 targets** (all **estimates**). Baseline: GSC "Performance → Search results" for the first full 7 days after verification (impressions, clicks, queries), and "Indexing → Pages" (indexed count) on the day of verification. Referring domains: Ahrefs/Semrush or GSC "Links" on the same day.

| KPI | Target range (estimate) |
|---|---|
| Pages indexed | 45–55 (33 now + 8 posts + 4 case studies + categories when indexable) |
| Impressions / month | 3,000–15,000 |
| Clicks / month | 80–400 |
| Non-brand queries with impressions | 150–600 |
| Keywords in top 10 | 5–20 (long-tail, brand + service, Bangladesh queries first) |
| Referring domains | +10–25 (product sites, directories, partners) |
| Leads (email + Telegram clicks) | Baseline in month 1, then +50–150 % |

---

## 14. Open questions for the owner

Answered already: services (all eight), pricing (per project), results (private), office address (Dhaka).

1. **Search Console / Bing** — can you add a DNS TXT record for `uniquelabs.org` (Domain property), or send the HTML-tag verification codes so I add them to `src/content/site.ts`? This is the single most important item.
2. **Company profiles** — URLs of the company X account, Telegram channel/group, Chrome Web Store publisher page (the developer page listing all extensions), Crunchbase, and any YouTube/Medium.
3. **How you work** — for KOC/KOL/launch campaigns: the steps from first call to final report, typical timelines, how many creators a campaign usually involves, and what the client receives. This is what takes the service pages to competitor depth.
4. **Campaign notes** — which partners may be named with a short description of the work (no numbers)? For which, if any, may we show approved numbers?
5. **Blockchain development** — chains and languages you work with; audit partners; any delivered work that can be named or described.
6. **Coverage** — languages your team and KOCs/moderators work in; hours/time zones covered for community management.
7. **Team** — 80–150-word bio, LinkedIn URL and 2–3 dated highlights for each of the five leaders.
8. **Product sites** — may I add "A product of Unique Labs" footer links in the product repositories (growxapp.org, unfollowx.com, pdf, twofold, scorex)?
9. **Analytics** — OK to add cookie-free analytics (Vercel Web Analytics or Plausible) and update the privacy policy?
10. **Google Business Profile** — who will verify it at the Dhaka office (postcard or video), and is there a phone number to publish?
11. **Blog** — who writes or approves posts, and under whose name?
12. **Home H1** — keep "Build, launch and grow." or add the visible sub-line "Web3 marketing, KOC and blockchain development from Dhaka"?
