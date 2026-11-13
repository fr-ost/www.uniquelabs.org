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
| Pages | `/`, `/about`, `/products`, `/products/[slug]`, `/projects`, `/projects/[slug]`, `/partnerships`, `/partnerships/[slug]`, `/services`, `/team`, `/team/[slug]`, `/journey`, `/contact`, `/privacy`, `/terms` |
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
- **Motion** (`src/components/motion/`, keyframes in `globals.css`): CSS
  entrance animations and a short per-page fade (`(site)/template.tsx`);
  scroll reveals that never hide content from no-JS visitors or crawlers; a
  reading-progress hairline and the journey line (CSS scroll-driven); count-up
  numbers that are always counted from the content files; CSS marquees; a
  pointer spotlight and card glow.
  Everything is switched off or simplified for `prefers-reduced-motion`.
- **Motion performance rules** (keep these when adding effects):
  - Scrolling is the browser's own — no scroll library and no `scroll`
    listeners. Use `IntersectionObserver` or CSS scroll-driven animations.
  - Animate only `transform` and `opacity`. No animated `filter: blur`,
    `box-shadow`, `background-position` or layout properties.
  - No `backdrop-filter` except the one on the site header, and no
    `mix-blend-mode` over moving content.
  - Pointer effects move a fixed-size element with `transform` once per frame
    (see `pointer-glow.tsx`, `spotlight.tsx`); never repaint a gradient or set
    a CSS variable on a container while the pointer moves.
  - Endless animations inside an SVG repaint it every frame — use an HTML
    element instead (see the orbit in `hero-visual.tsx`).
  - Sections with looping decoration include `<PauseOffscreen />`, which
    pauses it while the section is off screen.
  - No animation libraries: there is no `motion` or `lenis` dependency.
