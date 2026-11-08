# Architecture

A statically generated Next.js 16 (App Router) site. All content comes from
TypeScript files in `src/content`; there is no database, admin or API.

## Data flow

```
src/content/*.ts  ──▶  src/lib/content/public.ts  ──▶  pages (src/app/(site))
  (authoring format,      (validate → DTOs,             generated at build time;
   typed by schema.ts)     cross-links, sorting)         [slug] pages via
                                                          generateStaticParams
```

- `schema.ts` documents every field. `validate.ts` checks slugs, references,
  dates, URLs and colours; `public.ts` throws at build time if anything is
  wrong, and the unit tests also check that every image exists in `/public`.
- `public.ts` exposes the same async getters the pages use (`getProducts`,
  `getProject`, `getTeam`, `getDepartments`, …) and builds the relationships:
  product ↔ projects, partnerships, milestones and focus areas; projects ↔
  partners; departments ↔ leads and members.
- Detail pages use `generateStaticParams` with `dynamicParams = false`, so
  unknown slugs are real 404s.

## Routes

| Area | Routes |
| --- | --- |
| Pages | `/`, `/about`, `/products`, `/products/[slug]`, `/projects`, `/projects/[slug]`, `/partnerships`, `/partnerships/[slug]`, `/what-we-do`, `/team`, `/team/[slug]`, `/journey`, `/contact`, `/privacy`, `/terms` |
| SEO | `/sitemap.xml`, `/robots.txt`, `/manifest.webmanifest`, `/og/[...key]`, `/icon.svg`, `/apple-icon.png` |
| Redirects | `/collaborations/*` → `/partnerships/*` (permanent); retired `/admin`, `/intelligence` → `/` |

## Security

- No user input, forms, cookies, database or third-party scripts.
- Static security headers (`next.config.ts`): CSP (`default-src 'self'`,
  `frame-ancestors 'none'`, `object-src 'none'`), HSTS, nosniff, frame
  denial, referrer and permissions policies.
- Markdown is rendered without raw HTML and with URL allow-listing; JSON-LD
  is escaped; external links use `rel="noopener noreferrer"`.

## Design system

- **Palette**: near-black ink, warm paper surfaces, one signal accent
  (`#ff6b35`) plus gradient glows; quiet status colours.
- **Type**: Sora (display), Inter (text), JetBrains Mono (labels), self-hosted.
- **Identity**: a geometric “U” whose right arm releases a signal-coloured dot.
- **Motion**: CSS entrance animations, scroll reveals that never hide content
  without JavaScript, pointer glows on fine pointers only; everything respects
  `prefers-reduced-motion`.
