# Architecture

A single Next.js 16 application (App Router) backed by PostgreSQL. Public
pages, the admin dashboard, APIs and background import jobs all run in one
Node.js process — deployable anywhere a Node server and a PostgreSQL database
can run.

## Request flow

```
browser ──▶ proxy.ts ──────────────▶ route (RSC page / server action / API)
            • apex→www 308 redirect    • public pages: cached DTO queries
            • per-request CSP nonce    • admin: requireAdmin() on every page/action
            • optimistic /admin gate   • APIs: requireApiAdmin() + Origin/CSRF checks
```

- **Public pages** (`src/app/(site)`) render on request (`force-dynamic`) from
  the Next.js data cache (`unstable_cache` with tags). The build never touches
  the database; every admin mutation calls `updateTag("public")`, so edits
  appear immediately (with a 10-minute time-based safety net for multi-instance
  setups). Development reads are uncached.
- **Nonce CSP** on every page: `script-src 'self' 'nonce-…' 'strict-dynamic'`,
  `frame-ancestors 'none'`, `object-src 'none'`, `form-action 'self'`.
  Static security headers (HSTS in production, nosniff, frame denial,
  referrer and permissions policies) come from `next.config.ts`.
- **Missing records return real 404s.** The public layout intentionally has no
  `loading.tsx`, because streaming would commit a 200 status before
  `notFound()` runs. Navigation feedback uses `useLinkStatus` instead.

## Routes

| Area | Routes |
| --- | --- |
| Public | `/`, `/about`, `/products`, `/products/[slug]`, `/what-we-do`, `/intelligence`, `/intelligence/[coin]`, `/collaborations`, `/collaborations/[slug]`, `/team`, `/team/[slug]`, `/journey`, `/contact`, `/privacy`, `/terms` |
| SEO | `/sitemap.xml`, `/robots.txt`, `/manifest.webmanifest`, `/og/[...key]`, `/icon.svg`, `/apple-icon.png` |
| Media | `/media/[id]/[name]` (immutable, unguessable ids, sandboxed SVG) |
| Admin | `/admin/login`, `/admin/setup`, `/admin/*` (dashboard + 13 modules) |
| APIs | `/api/admin/media`, `/api/admin/imports[...]`, `/api/admin/preview[/exit]`, `/api/health`, `/api/market/snapshot`, `/api/market/logo/[id]` |

## Data model (PostgreSQL via Prisma)

- **Singletons**: `CompanyProfile` (identity, hero, About copy, contact
  details — all optional facts hidden until set) and `SiteSettings` (SEO,
  indexing, legal pages, contact-form switch). CHECK constraints keep them
  singletons.
- **Content**: `Product` (+ `ProductFeature`, `ProductImage`, `ProductLink`,
  `Category`), `Collaboration` (+ `CollaborationPartner` → `Partner`),
  `TeamMember` (+ `TeamGroup`), `CompanyMilestone`, `Capability`, `Principle`,
  `SocialLink`. Every primary entity has an id, slug, timestamps, a
  publication `status` (`DRAFT` / `PUBLISHED` / `ARCHIVED`) and sort order.
- **Publication gate**: products, collaborations and milestones have
  `verifiedAt`. A CHECK constraint makes `status = 'PUBLISHED'` impossible
  without it — imported or unverified records cannot become public by accident,
  even through a bug in application code.
- **Placeholders**: `isPlaceholder` marks development sample content. Public
  queries exclude it whenever `NODE_ENV=production` (unless explicitly allowed
  on a localhost URL).
- **Imports**: `ImportJob` (status, progress, stats, warnings, checksums of
  uploaded files — never the files), `ImportCandidate` (kind, fingerprint,
  classification, confidence, verification, extracted data, reasons, review
  decision) and `SourceEvidence` (private provenance: source id, title, URL,
  short excerpt, timestamp). Candidates are unique per `(kind, fingerprint)`;
  evidence is unique per `(candidate, sourceType, sourceId)`.
- **Security**: `AdminUser` (Argon2id hash, role, lockout counters),
  `AdminSession` (SHA-256 of the token only), `AuditLog`, `RateLimitBucket`.
- **Media**: `MediaAsset` (metadata, SHA-256 dedupe) and `MediaBlob` (bytes,
  when stored in the database).
- **Intelligence**: `IntelligenceSettings` (singleton: visibility, asset limit,
  refresh interval, watchlist), `Airdrop` and `TokenUnlock` (curated, with the
  same publish-requires-verification CHECK constraint). Market figures are
  never stored — they live in the in-process cache.

## Public data layer

`src/lib/content/queries.ts` selects only public fields and maps rows to DTOs
(`src/lib/content/types.ts`); private fields such as `verifiedAt` or evidence
never reach a page. `src/lib/content/public.ts` wraps them with caching and the
admin-only draft preview (Draft Mode **and** a valid admin session).

## Market data layer

`src/lib/market/`: `cmc.ts` (server-only CoinMarketCap client: keyed Pro API or
keyless public API, timeouts, 429 retry, plan-error detection), `normalize.ts`
(pure, defensive mapping of v1/v3 responses to DTOs), `cache.ts` (TTL +
stale-while-revalidate + single-flight + backoff + last-good fallback),
`service.ts` (datasets, TTLs from the admin's refresh interval, curated events,
admin status) and `format.ts` (deterministic number formatting — Intl's compact
notation differs between ICU builds and broke hydration). Pages render the
snapshot on the server and `LiveMarketProvider` polls `/api/market/snapshot`
while the tab is visible. See [INTELLIGENCE.md](INTELLIGENCE.md).

## Admin architecture

- Pages are server components that load data with Prisma and pass plain values
  to client form components (`src/components/admin/forms/*`).
- Mutations are server actions (`src/server/actions/*`). Each one calls
  `requireAdmin()`, validates `FormData` with Zod (`src/lib/validation/*`),
  writes in a transaction, records an audit entry and refreshes caches.
- `AdminForm` submits without React's automatic form reset so typed values
  survive validation errors. Destructive actions go through `ConfirmAction`.
- Uploads (media, imports) use raw-body `PUT` requests to route handlers so
  large files stream to disk/processing without buffering, and so XHR can
  report progress.

## Import architecture

```
upload (streamed, size-limited, hashed) ──▶ ImportJob (QUEUED) ──▶ after(): runImportJob
  ──▶ importer.run()  [pure: parse → normalise → extract → classify → group]
  ──▶ persist (dedupe by evidence, then fingerprint; never resurrect reviewed)
  ──▶ report (stats, warnings) ──▶ temp files deleted ──▶ review queue
```

Importers implement a small interface (`src/lib/importers/core/types.ts`) and
are registered in `src/lib/importers/registry.ts`; the upload API, job runner,
persistence and review UI are shared. See [IMPORTS.md](IMPORTS.md).

## Design system

- **Palette**: near-black ink (`#0d0d10`), warm paper surfaces (`#f4f2ec`) for
  editorial sections, one signal accent (`#ff6b35`), quiet status colours.
- **Type**: Sora (display, tight tracking), Inter (text), JetBrains Mono
  (labels); self-hosted with `next/font/local`, fluid `clamp()` scales.
- **Identity**: the mark is a geometric “U” whose right arm releases a single
  signal-coloured dot — “the unique one”. The hero illustration, contour lines,
  favicon and OG images are all built from that geometry.
- **Layout**: asymmetric 12-column grid (label column + content), bento grids,
  hairline dividers, editorial index numbers.
- **Motion**: CSS entrance animations for the hero (no JS needed for LCP),
  an IntersectionObserver reveal that never hides content from no-JS users,
  pointer parallax and glows on fine pointers only, Motion for the mobile menu
  and timeline progress. Everything respects `prefers-reduced-motion`.

## Security model (summary)

| Concern | Implementation |
| --- | --- |
| Passwords | Argon2id (19 MiB, t=2, p=1); policy: 12+ chars, deny-list, no name/email |
| Sessions | 256-bit random token, SHA-256 at rest, `__Host-` HttpOnly Secure SameSite=Strict cookie, idle + absolute expiry, invalidated on password change |
| Brute force | DB-backed rate limits per IP and per account, progressive lockout, timing-equalised unknown accounts |
| Authorization | `requireAdmin()` first in every admin page (layouts render in parallel with pages, so a layout check alone is not enough — a regression test enforces this) and every action; owner-only areas; proxy is only an optimistic gate |
| CSRF | Server Actions' Origin check; admin APIs require same Origin + custom header; SameSite=Strict |
| XSS | React escaping, Markdown without raw HTML and with URL allow-listing, nonce CSP, JSON-LD escaping |
| Uploads | Byte-level type detection, sharp re-encode (strips EXIF/GPS), SVG deny-list + sandbox CSP, size limits, unguessable ids |
| Archives | No extraction to disk, name validation, entry/size/ratio limits, JS never evaluated |
| Privacy | Keyed IP hashes only, imported excerpts private, raw uploads deleted, no third-party scripts or AI APIs; market data and coin logos are fetched server-side |
| Audit | Append-only log of sign-ins, edits, publication changes, imports and reviews |
