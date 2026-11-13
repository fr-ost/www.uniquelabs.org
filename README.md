# Unique Labs — www.uniquelabs.org

The official website of **Unique Labs**: a fast, static company site covering
the company and its structure, products, projects, partnerships, team and
journey.

> “We don't build technology just to add another product to the internet.
> We build tools that make the internet more useful.”

## How it works

- **Content lives in files** — `src/content/*.ts` (company, structure & team,
  products, projects, partnerships, milestones, focus areas, principles, SEO
  and legal). Edit a file (or ask Claude to), commit, and the site rebuilds.
  See **[docs/CONTENT.md](docs/CONTENT.md)**.
- **No admin, database or API.** Every page is generated at build time, so the
  site is fast, cheap to host and has almost nothing to attack.
- **Safe edits.** Content is type-checked and validated on every build and in
  the tests: duplicate slugs, broken references, bad dates or URLs and missing
  images fail loudly instead of shipping a broken page.
- **Honest by default.** The site only shows what the content files contain;
  empty sections show a tasteful “on the way” state.

## Pages

Home · About (incl. company structure) · Products (+ product pages) ·
Projects (+ case studies) · Partnerships (+ detail pages) · Services ·
Team (+ profiles) · Journey · Contact · Privacy · Terms

## Tech stack

| Layer | Choice |
| --- | --- |
| Framework | Next.js 16 (App Router, static generation), React 19 |
| Language | TypeScript 6 (strict) |
| Styling | Tailwind CSS 4, self-hosted Sora / Inter / JetBrains Mono |
| Motion | CSS only (transform / opacity), respects `prefers-reduced-motion` |
| Tests | Vitest (content validation), Playwright (desktop + mobile) |

## Local development

Requirements: Node.js 22.12+.

```bash
npm install
npm run dev          # http://localhost:3000
```

| Script | Purpose |
| --- | --- |
| `npm run dev` | Development server |
| `npm run build` / `npm start` | Production build / serve it |
| `npm run lint` / `npm run typecheck` | ESLint / TypeScript |
| `npm test` | Content validation and adapter tests |
| `npm run test:e2e` | Playwright end-to-end tests |

## Deployment

Push to `main` — Vercel builds and deploys automatically. No environment
variables or database are needed. See [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md).

## Project structure

```
src/content/         ← all website content (edit these)
public/images/       ← images used by the content
src/app/(site)/      pages            src/components/   UI
src/lib/content/     content → page data, validation
src/app/og/          generated social share images
tests/               unit/ (content), e2e/
docs/                CONTENT.md, DEPLOYMENT.md, ARCHITECTURE.md
```

© Unique Labs. All rights reserved.
