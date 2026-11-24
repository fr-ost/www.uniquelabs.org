<div align="center">

<img width="100%" alt="Unique Labs — the official website, www.uniquelabs.org" src="https://capsule-render.vercel.app/api?type=waving&amp;color=0:6C2BD9,50:FF2E93,100:FFB703&amp;height=210&amp;section=header&amp;text=Unique%20Labs&amp;fontSize=56&amp;fontColor=ffffff&amp;fontAlignY=30&amp;animation=fadeIn&amp;desc=Official%20website%20%C2%B7%20www.uniquelabs.org&amp;descAlignY=62&amp;descAlign=50&amp;descSize=18"/>

<picture>
  <source media="(prefers-color-scheme: dark)" srcset="https://readme-typing-svg.demolab.com?font=Fira+Code&amp;weight=600&amp;size=22&amp;duration=3600&amp;pause=700&amp;color=FFB703&amp;center=true&amp;vCenter=true&amp;width=780&amp;height=48&amp;lines=Official+website+of+Unique+Labs;Static+Next.js+16+%C2%B7+React+19+%C2%B7+TypeScript;Content+in+files+%C2%B7+no+database%2C+no+API;Live+at+www.uniquelabs.org" />
  <source media="(prefers-color-scheme: light)" srcset="https://readme-typing-svg.demolab.com?font=Fira+Code&amp;weight=600&amp;size=22&amp;duration=3600&amp;pause=700&amp;color=6C2BD9&amp;center=true&amp;vCenter=true&amp;width=780&amp;height=48&amp;lines=Official+website+of+Unique+Labs;Static+Next.js+16+%C2%B7+React+19+%C2%B7+TypeScript;Content+in+files+%C2%B7+no+database%2C+no+API;Live+at+www.uniquelabs.org" />
  <img width="780" alt="Official website of Unique Labs. Static Next.js 16, React 19 and TypeScript. Content in files, no database, no API. Live at www.uniquelabs.org." src="https://readme-typing-svg.demolab.com?font=Fira+Code&amp;weight=600&amp;size=22&amp;duration=3600&amp;pause=700&amp;color=6C2BD9&amp;center=true&amp;vCenter=true&amp;width=780&amp;height=48&amp;lines=Official+website+of+Unique+Labs;Static+Next.js+16+%C2%B7+React+19+%C2%B7+TypeScript;Content+in+files+%C2%B7+no+database%2C+no+API;Live+at+www.uniquelabs.org" />
</picture>

The official website of **[Unique Labs](https://www.uniquelabs.org)**: a fast, static company site covering the company and its structure, services, products, projects, partnerships, team and journey.

> “We don't build technology just to add another product to the internet.
> We build tools that make the internet more useful.”

<br/>

<a href="https://www.uniquelabs.org"><img alt="Live site: www.uniquelabs.org" src="https://img.shields.io/badge/www.uniquelabs.org-6C2BD9?style=for-the-badge"/></a>
<a href="https://github.com/fr-ost/www.uniquelabs.org/actions/workflows/ci.yml"><img alt="GitHub Actions CI" src="https://img.shields.io/github/actions/workflow/status/fr-ost/www.uniquelabs.org/ci.yml?branch=main&amp;style=for-the-badge&amp;logo=githubactions&amp;logoColor=white&amp;label=CI"/></a>
<img alt="Node.js 22.12 or newer" src="https://img.shields.io/badge/Node.js_22.12+-FFB703?style=for-the-badge&amp;logo=nodedotjs&amp;logoColor=1A1024"/>
<img alt="Static site, deployed on Vercel" src="https://img.shields.io/badge/Vercel-FF2E93?style=for-the-badge&amp;logo=vercel&amp;logoColor=white"/>

<br/>

[Live site](https://www.uniquelabs.org) · [Content guide](docs/CONTENT.md) · [Deployment](docs/DEPLOYMENT.md) · [Architecture](docs/ARCHITECTURE.md)

</div>

## ✨ Overview

[www.uniquelabs.org](https://www.uniquelabs.org) is generated entirely at build time from TypeScript files in this repository. Edit a content file (or ask Claude to), commit, and the site rebuilds. There is **no admin, no database and no API**, so the site stays fast, cheap to host, and has almost nothing to attack.

The site only shows what the content files contain. Empty collections render a quiet empty state — case studies “on their way”, a journey with nothing published yet — instead of placeholder entries.

## 🚀 Key features

| | |
| --- | --- |
| **Content in files** | Company, structure and team, services, products, projects, partnerships, milestones, principles, SEO and legal all live in `src/content/*.ts`. Field docs: `src/content/schema.ts`. Guide: **[docs/CONTENT.md](docs/CONTENT.md)**. |
| **Safe edits** | Content is type-checked and validated on every build and in the tests. Duplicate slugs, broken references, bad dates or URLs, and missing images fail loudly instead of shipping a broken page. |
| **Static by default** | Pages, the sitemap, `robots.txt`, the web manifest and social share images are produced at build time. Detail pages use `generateStaticParams` with `dynamicParams = false`, so unknown slugs are real 404s. |
| **Motion, quietly** | CSS only (`transform` / `opacity`). Animations respect `prefers-reduced-motion`. |
| **Tight surface** | No user input, forms, cookies, database or third-party scripts. `next.config.ts` sets a Content-Security-Policy, HSTS in production, `nosniff`, frame denial, and referrer and permissions policies. Markdown is rendered without raw HTML; links are limited to `http`, `https`, `mailto` and same-site paths. |

## 📄 Pages

| Page | Route |
| --- | --- |
| Home | `/` |
| About, including company structure | `/about` |
| Products | `/products`, `/products/[slug]` |
| Projects and case studies | `/projects`, `/projects/[slug]` |
| Partnerships | `/partnerships`, `/partnerships/[slug]` |
| Services | `/services`, `/services/[slug]` |
| Team and profiles | `/team`, `/team/[slug]` |
| Journey | `/journey` |
| Contact | `/contact` |
| Privacy · Terms | `/privacy`, `/terms` |

<details>
<summary>SEO routes and redirects</summary>

<br/>

| Kind | What |
| --- | --- |
| SEO | `/sitemap.xml`, `/robots.txt`, `/manifest.webmanifest`, `/og/[...key]`, `/icon.svg`, `/apple-icon.png` |
| Permanent | `/collaborations/*` → `/partnerships/*`, `/what-we-do` → `/services`, `/products/xaigc` → `/products/xaicg` |
| Retired | `/admin/*` and `/intelligence/*` → `/` |

Preview deployments are excluded from search engines (`noindex` and a disallow-all `robots.txt`). Production is indexed.

</details>

## 🛠️ Tech stack

<div align="center">

<img alt="Next.js 16" src="https://img.shields.io/badge/Next.js_16-6C2BD9?style=for-the-badge&amp;logo=nextdotjs&amp;logoColor=white"/>
<img alt="React 19" src="https://img.shields.io/badge/React_19-FF2E93?style=for-the-badge&amp;logo=react&amp;logoColor=white"/>
<img alt="TypeScript" src="https://img.shields.io/badge/TypeScript_6-3178C6?style=for-the-badge&amp;logo=typescript&amp;logoColor=white"/>
<img alt="Tailwind CSS 4" src="https://img.shields.io/badge/Tailwind_CSS_4-06B6D4?style=for-the-badge&amp;logo=tailwindcss&amp;logoColor=white"/>

<br/>

<img alt="Vitest" src="https://img.shields.io/badge/Vitest-6C2BD9?style=for-the-badge&amp;logo=vitest&amp;logoColor=white"/>
<img alt="Playwright" src="https://img.shields.io/badge/Playwright-FF2E93?style=for-the-badge&amp;logo=playwright&amp;logoColor=white"/>
<img alt="ESLint" src="https://img.shields.io/badge/ESLint-4B32C3?style=for-the-badge&amp;logo=eslint&amp;logoColor=white"/>
<img alt="Vercel" src="https://img.shields.io/badge/Vercel-FFB703?style=for-the-badge&amp;logo=vercel&amp;logoColor=1A1024"/>

</div>

| Layer | Choice |
| --- | --- |
| Framework | Next.js 16 (App Router, static generation), React 19 |
| Language | TypeScript 6 (strict) |
| Styling | Tailwind CSS 4, self-hosted Sora / Inter / JetBrains Mono |
| Content Markdown | `react-markdown` and `remark-gfm` |
| Icons | `lucide-react` |
| Motion | CSS only (`transform` / `opacity`), respects `prefers-reduced-motion` |
| Tests | Vitest (content validation and adapters), Playwright (desktop + mobile) |
| CI | GitHub Actions: lint, typecheck, unit tests, production build, then Playwright |
| Hosting | Vercel. `vercel.json` pins the framework to Next.js |

## 🚀 Getting started

**Requirements:** Node.js 22.12+.

```bash
git clone https://github.com/fr-ost/www.uniquelabs.org.git
cd www.uniquelabs.org
npm install
npm run dev          # http://localhost:3000
```

| Script | Purpose |
| --- | --- |
| `npm run dev` | Development server |
| `npm run build` / `npm start` | Production build / serve it |
| `npm run lint` / `npm run typecheck` | ESLint / TypeScript |
| `npm test` | Content validation and adapter tests |
| `npm run test:e2e` | Playwright end-to-end tests (desktop Chrome and Pixel 7) |

`npm run test:e2e` starts `npm run dev` when nothing is already listening on port 3000. Set `E2E_BASE_URL` to test a server you started yourself (CI builds, then runs Playwright against `npm start`).

## ⚙️ Configuration

No environment variables are required. The public site URL defaults to `https://www.uniquelabs.org`.

| Variable | Required | Default | Purpose |
| --- | --- | --- | --- |
| `SITE_URL` | No | `https://www.uniquelabs.org` | Canonical links, the sitemap, and social share images. Trailing slashes are stripped. |
| `NEXT_PUBLIC_SITE_URL` | No | — | Used only when `SITE_URL` is unset. Same purpose. |
| `PORT` | No | `3000` | Port for `npm start` on a host other than Vercel. |
| `VERCEL_ENV` | Set by Vercel | — | `production` may be indexed. `preview` and `development` get `noindex` and a disallow-all `robots.txt`. When the variable is unset (local), the code treats the site as indexable. |
| `E2E_BASE_URL` | No | `http://localhost:3000` | Playwright base URL. When set, Playwright does not start the dev server. |
| `NEXT_TELEMETRY_DISABLED` | No | — | Set to `1` in CI. |

<details>
<summary>Variables left over from the old Express app</summary>

<br/>

If the Vercel project still has `DATABASE_URL`, `APP_SECRET`, `ADMIN_SETUP_TOKEN`, `CMC_API_KEY`, or similar, they are **no longer read**. They can be deleted, along with any connected database. See [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md).

</details>

## ✏️ Usage

All copy, people, products, projects, partners and legal text live in **`src/content/`**. Change a file, commit, and Vercel deploys the push to `main`.

| File | What it controls |
| --- | --- |
| `company.ts` | Name, hero, about copy, contact, address, social profiles |
| `team.ts` | Departments and team members |
| `capabilities.ts` | Services shown on Home and `/services` |
| `service-pages.ts` | Service detail pages (`/services/[slug]`) |
| `products.ts` | Product categories and products |
| `projects.ts` | Projects and case studies |
| `partnerships.ts` | Partners and partnerships |
| `milestones.ts` | The journey timeline |
| `principles.ts` | Philosophy principles |
| `site.ts` | Search settings, privacy policy, terms of use |

Images go in `public/images/…` and are referenced as `/images/…`, with `alt` text. Slugs are lowercase-with-dashes and unique. Products, partners, departments and team members are referenced by slug.

```bash
npm run dev        # preview at http://localhost:3000
npm test           # slugs, links, dates, images
npm run build      # fails with a readable list if content is broken
```

Descriptions accept Markdown. Raw HTML is not rendered. Links are limited to `http`, `https`, `mailto` and same-site paths. Images inside Markdown are ignored — put them in the image fields instead. The commented template at the top of each content file is the copy-paste starting point; the full editing guide is **[docs/CONTENT.md](docs/CONTENT.md)**.

## 🗂️ Project structure

```
src/content/            all website content (edit these)
src/lib/content/        content → page data, validation
src/app/(site)/         pages
src/app/og/             generated social share images
src/components/         UI
public/images/          images used by the content
tests/                  unit/ (content) and e2e/
docs/                   CONTENT.md, DEPLOYMENT.md, ARCHITECTURE.md, seo/
.github/workflows/      CI: lint, typecheck, test, build, Playwright
```

## ☁️ Deployment

Push to `main` — Vercel builds and deploys automatically. No environment variables or database are needed. See **[docs/DEPLOYMENT.md](docs/DEPLOYMENT.md)**.

`vercel.json` sets `"framework": "nextjs"`. The Vercel project's saved preset is still Express, from an older app in this repo. Without that pin, Vercel builds the site and then fails with "No entrypoint found" while looking for `server.js`.

<details>
<summary>Any other Node.js host</summary>

<br/>

```bash
npm ci
npm run build
npm start            # serves on port 3000 (PORT=… to change)
```

Put a TLS-terminating proxy (nginx, Caddy, or the platform's edge) in front, and redirect `uniquelabs.org` to `https://www.uniquelabs.org` there.

Every push to `main` deploys production. Other branches get preview URLs, which are excluded from search engines.

</details>

## 💜 Credits

Built for **[Unique Labs](https://www.uniquelabs.org)**.

**[Shahriar Ahmed](https://github.com/fr-ost)** — Co-Founder & COO, Unique Labs.

The SEO program (what is done, what is planned, and the open questions) lives in [docs/seo/SEO-PROGRAM.md](docs/seo/SEO-PROGRAM.md).

<div align="center">

© Unique Labs. All rights reserved.

<img width="100%" alt="Footer wave" src="https://capsule-render.vercel.app/api?type=waving&amp;color=0:FFB703,50:FF2E93,100:6C2BD9&amp;height=110&amp;section=footer"/>

</div>
