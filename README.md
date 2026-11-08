# Unique Labs — www.uniquelabs.org

The official website of **Unique Labs**: a fast, editorial company site with a
private admin dashboard, a database-driven CMS, and evidence-based import tools
that discover launched products in a Claude conversation export and
collaborations in an X/Twitter archive — without ever publishing anything you
haven't verified and approved.

> “We don't build technology just to add another product to the internet.
> We build tools that make the internet more useful.”

## Highlights

- **Public website**: Home, About, Products (with SEO product pages), What We
  Do, Market Intelligence, Collaborations (with detail pages), Our Team (with
  profiles), Our Journey (interactive timeline), Contact, Privacy Policy and
  Terms of Use — with top navigation, aurora hero, live market widgets and
  motion that respects reduced-motion settings.
- **Market Intelligence** (`/intelligence`): live crypto prices, market caps,
  volume, supply, global metrics, Fear & Greed, Altcoin Season, CMC100, top
  movers, a searchable market table, coin pages, airdrops and token unlocks —
  CoinMarketCap data fetched and cached server-side (works keyless; set
  `CMC_API_KEY` for production).
- **Admin dashboard** at `/admin`: company information, products, Claude
  history import, collaborations & partners, X archive import, team, timeline,
  What We Do, Market Intelligence (settings, data status, curated airdrops and
  token unlocks), contact info & inbox, media library, SEO & legal, import
  history, audit log, account security and admin users — navigated from a top
  bar. Drafts, previews, publish /
  unpublish / archive, reordering and confirmation dialogs throughout.
- **Import engine**: streaming, memory-bounded parsers for the official Claude
  export and the X archive; evidence-based classification (an idea is never
  mistaken for a launch, a mention is never mistaken for a partnership);
  idempotent re-imports; private provenance for every candidate.
- **Honesty by construction**: nothing is invented. The database itself
  refuses to publish an unverified product, collaboration or milestone, sample
  content can never reach production, and empty sections simply don't render.
- **Security**: Argon2id, DB-backed sessions in `__Host-` HttpOnly SameSite
  cookies, login lockout and rate limits, nonce-based CSP on every page,
  CSRF-checked APIs, hardened uploads (byte-level type detection, EXIF
  stripping, sandboxed SVG), audit log, keyed IP hashing.
- **SEO**: per-page metadata and canonical URLs, Open Graph/X cards with
  generated branded images, dynamic `sitemap.xml` and `robots.txt`,
  Organization / WebSite / SoftwareApplication / Person / BreadcrumbList
  structured data, apex→www redirect.

## Tech stack

| Layer | Choice |
| --- | --- |
| Framework | Next.js 16 (App Router, React 19.3, Server Actions, Turbopack) |
| Language | TypeScript 6 (strict, `noUncheckedIndexedAccess`) |
| Styling | Tailwind CSS 4, self-hosted Sora / Inter / JetBrains Mono |
| Motion | Motion (LazyMotion) + CSS; respects `prefers-reduced-motion` |
| Data | PostgreSQL + Prisma 7 (driver adapter `@prisma/adapter-pg`) |
| Auth | `@node-rs/argon2`, database sessions |
| Media | `sharp` (WebP re-encoding), stored in PostgreSQL or on a volume |
| Imports | `yauzl` (safe ZIP), custom streaming JSON array parser |
| Market data | CoinMarketCap API (server-side client, in-process cache) |
| Tests | Vitest (unit + integration on PostgreSQL), Playwright (e2e) |

**Why PostgreSQL?** The previous deployment of this repository ran on Railway,
whose containers have ephemeral disks. SQLite would lose data on every deploy
there, so PostgreSQL is used everywhere (see `docs/DEPLOYMENT.md`).

## Quick start (local development)

Requirements: Node.js 22.12+ (24 LTS also supported) and Docker (for
PostgreSQL), or any PostgreSQL 14+.

```bash
cp .env.example .env               # then set APP_SECRET (any 32+ chars locally)
docker compose up -d db            # PostgreSQL on localhost:5432 (+ a test database)
npm install                        # also generates the Prisma client
npm run db:migrate                 # apply migrations
npm run db:seed                    # baseline content from the brief (idempotent)
npm run admin:create               # create your owner account (prompts)
npm run dev                        # http://localhost:3000 — admin at /admin
```

Market Intelligence works without configuration (CoinMarketCap's keyless API).
Offline, run `node tests/support/cmc-mock-server.mjs` and start the dev server
with `CMC_API_BASE_URL=http://127.0.0.1:4010` (see `docs/INTELLIGENCE.md`).

Optional: `npm run db:seed:demo` adds clearly-labelled **sample** products,
collaborations, team members and milestones for design work. They are tagged
`isPlaceholder`, marked “Sample” in the UI, refused by the script outside
localhost, and filtered out of every public query in production. Remove them
with `npm run db:seed:demo -- --clear`.

## Scripts

| Script | Purpose |
| --- | --- |
| `npm run dev` | Development server |
| `npm run build` / `npm start` | Production build (standalone) / start it |
| `npm run lint` / `npm run typecheck` | ESLint / TypeScript |
| `npm test` | Unit + integration tests (needs the test database) |
| `npm run test:e2e` | Playwright end-to-end tests |
| `npm run db:migrate` / `db:deploy` | Create+apply migrations (dev) / apply (prod) |
| `npm run db:seed` | Idempotent baseline content |
| `npm run admin:create` | Create an admin (hidden password prompt) |
| `npm run admin:reset-password` | Reset a password and sign out all sessions |

## Project structure

```
prisma/              schema, migrations (incl. CHECK constraints), seeds
scripts/             admin CLI, standalone post-build
src/app/(site)/      public pages            src/app/admin/   admin dashboard
src/app/api/         admin APIs (uploads, imports, media, preview), health
src/app/og/          branded Open Graph images
src/components/      brand, site chrome, cards, sections, admin UI kit
src/lib/content/     public queries → safe DTOs, caching, defaults, bootstrap
src/lib/importers/   core (zip, streaming JSON, text), claude/, x/, pipeline
src/lib/market/      CoinMarketCap client, normalisers, cache, service
src/lib/auth/        passwords, sessions, guards, API protection
src/server/actions/  server actions for every admin module
tests/               unit/, integration/, e2e/, fixtures/, support/ (CMC mock)
docs/                architecture, deployment, admin guide, imports
```

## Documentation

- [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) — architecture, data model, design system, security model
- [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) — Railway / Docker / VPS, environment, domain, backups
- [docs/ADMIN.md](docs/ADMIN.md) — first admin account and day-to-day content management
- [docs/IMPORTS.md](docs/IMPORTS.md) — Claude export & X archive imports, classification rules, privacy
- [docs/INTELLIGENCE.md](docs/INTELLIGENCE.md) — market data sources, API key, caching & credits, curation

## Testing

```bash
npm test                 # 120+ unit & integration tests (PostgreSQL test database)
npm run test:e2e         # Playwright, desktop + mobile; starts the CMC mock and `npm run dev` if needed
```

Integration tests use `TEST_DATABASE_URL` (default: the `uniquelabs_test`
database created by `docker compose`). They refuse to run against a database
whose URL does not contain `test`.

## Content policy

This codebase deliberately contains **no invented facts** about Unique Labs —
no founding dates, locations, people, customers, numbers, partners or
products. Copy that ships with the site comes from the owner's brief and is
editable in the admin. Everything else stays hidden until you add and verify it.

© Unique Labs. All rights reserved.
