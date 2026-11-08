# Unique Labs website — notes for Claude

The official company website (www.uniquelabs.org): a static Next.js 16 site.
There is **no admin, no database and no API**. The owner asks Claude to make
changes; almost all changes are edits to the content files.

## Where things are

- `src/content/*.ts` — **all website content** (company, structure & team,
  products, projects, partnerships, milestones, focus areas, principles,
  SEO & legal). Schema with field docs: `src/content/schema.ts`.
  Guide: `docs/CONTENT.md`.
- `public/images/…` — images referenced from content as `/images/…`.
- `src/lib/content/public.ts` — turns content into page data (DTOs) and runs
  the content validator (`src/lib/content/validate.ts`) at build time.
- `src/app/(site)/…` — pages; `src/components/…` — UI.

## Rules

1. **Never invent facts.** No made-up products, clients, partners, people,
   dates, numbers, quotes or outcomes. Use only what the owner provides; ask
   when something is missing. Don't add placeholder or sample entries.
2. Keep slugs lowercase-with-dashes and unique; reference products,
   partners, departments and team members by slug.
3. Add images to `public/images/<section>/…` with meaningful `alt` text.
4. After editing, run `npm run lint`, `npm run typecheck`, `npm test` and
   `npm run build` — the build and tests fail with a readable list if content
   is broken.
5. Deployment: pushing to `main` deploys to Vercel. No environment variables
   are required. Keep `vercel.json` (`"framework": "nextjs"`): the Vercel
   project's saved preset is Express from an older app in this repo.

## Commands

```bash
npm run dev          # http://localhost:3000
npm test             # content validation + adapter unit tests
npm run test:e2e     # Playwright (desktop + mobile)
npm run build
```
