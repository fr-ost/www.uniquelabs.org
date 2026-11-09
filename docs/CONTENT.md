# Editing the website content

All content lives in **`src/content/`** as plain TypeScript files. There is no
admin panel and no database: change a file, commit, and the site rebuilds
(Vercel deploys every push to `main` automatically).

You can edit the files yourself or ask Claude, e.g. *"Add our new Chrome
extension TabNest to the products — here's the description and store link."*

| File | What it controls | Pages |
| --- | --- | --- |
| `company.ts` | Name, hero, introduction, About copy (who we are, mission, vision…), structure intro, closing statement, contact emails, address, social profiles | Home, About, Contact, footer |
| `team.ts` | **Company structure** (`departments`) and **team members** | About, Team, team profiles |
| `products.ts` | Product categories and **products** | Products, product pages, Home |
| `projects.ts` | **Projects / case studies** | Projects, project pages, Home |
| `partnerships.ts` | **Partners** and **partnerships** | Partnerships, partnership pages, Home |
| `milestones.ts` | The company **journey** (timeline) | Journey, Home |
| `capabilities.ts` | **Services** (KOC, consultancy, digital marketing, blockchain development, software, AI) | Services, Home |
| `principles.ts` | The philosophy principles | Home, About |
| `site.ts` | Search-engine settings, privacy policy, terms of use | All pages, Privacy, Terms |

Every file starts with a commented **template** you can copy.

## Ground rules

- **Only publish facts that are true and public.** Dates, numbers, people,
  partners and outcomes appear exactly as written. If something isn't
  verified yet, leave it out.
- Add people only with their consent.
- Link partnerships and milestones to a public **source** where possible.

## Adding things

### A product

1. Put images in `public/images/products/<slug>/` (logo, cover, screenshots).
2. Add an entry to `products` in `src/content/products.ts`:

```ts
{
  slug: "tabnest",                         // → /products/tabnest
  name: "TabNest",
  tagline: "Calm, organised browsing.",
  summary: "Groups open tabs into tidy sessions you can pick up later.",
  description: "Longer **Markdown** text…",
  category: "browser-extensions",          // a slug from `categories`
  platforms: ["CHROME_EXTENSION"],
  stage: "AVAILABLE",                      // AVAILABLE · BETA · COMING_SOON · DISCONTINUED
  pricing: "FREE",
  released: "2025-06",                     // "2025", "2025-06" or "2025-06-14"
  cta: { label: "Add to Chrome", url: "https://chromewebstore.google.com/detail/…" },
  logo: { src: "/images/products/tabnest/logo.png", alt: "TabNest logo", width: 256, height: 256 },
  cover: { src: "/images/products/tabnest/cover.png", alt: "TabNest in action" },
  features: [{ title: "Works offline", description: "…" }],
  links: [{ kind: "PRIVACY_POLICY", url: "https://…" }],
  featured: true,                          // show on the home page
},
```

### A project (case study)

Add to `projects` in `src/content/projects.ts` — `slug`, `title`, `summary`,
`status` (`IN_PROGRESS` · `COMPLETED` · `ONGOING` · `CONCEPT`) are required.
Optional: `description` and `outcome` (Markdown), `client`, `date`,
`services`, `cover`, `images`, `links`, related `products` and `partners`
(slugs), `featured`.

### Partners (Tier 1 / Tier 2)

Each entry in `partners` can have a `tier` (1 or 2), a `role` (e.g. "Ambassador",
"KOC Partner", "Launchpad Partner"), the X username in `x` (without "@") and a
logo in `public/images/partners/`. Tier 1 partners appear on the home page and
at the top of the Partnerships page; Tier 2 below. Order in the file is the
order on the site.

### A partnership

1. Add the partner to `partners` (with a logo in `public/images/partners/`).
2. Add the partnership to `partnerships`, listing the partner slugs and a
   `source` link to the public announcement.

### Company structure and team

1. Add departments (teams, studios, divisions) to `departments` in
   `src/content/team.ts` — name, description, focus areas and the `lead`
   (a team member's slug). The **How we're organised** section appears on the
   About and Team pages as soon as there is one department.
2. Add people to `team` with their `department`. `leadership: true` lists
   them under Leadership; `former: true` under former team members;
   `profilePage: false` skips their profile page.

### A milestone

Add to `milestones` in `src/content/milestones.ts` with a `title`, `date` and
ideally a `source`. The timeline sorts itself; `featured: true` shows it on
the home page.

### Contact details and social profiles

In `src/content/company.ts` set `contact.emails` (general, business,
partnerships, press) and add `socials`, e.g.
`{ platform: "X", url: "https://x.com/uniquelabs" }`.

## Images

- Store images under `public/images/…` and reference them as
  `/images/…`. Use PNG, JPG, WebP, AVIF or SVG.
- Give `width` and `height` (pixels) for logos; covers and screenshots fill
  their frames and don't need them.
- Always add `alt` text describing the image.

## Checking your changes

```bash
npm run dev        # preview at http://localhost:3000
npm test           # validates all content (slugs, links, dates, images…)
npm run build      # the build fails with a clear list if content is broken
```

Mistakes such as a duplicate slug, a link to a product that doesn't exist, a
malformed date or URL, or a missing image are reported by name — fix the file
it points to and run the command again.
