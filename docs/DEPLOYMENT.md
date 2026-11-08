# Deployment

The site is static: no database, no secrets, no server to maintain.

## Vercel (recommended)

1. Import the repository in Vercel. Leave the build settings on their
   defaults: `vercel.json` pins the framework to **Next.js**, overriding the
   project's Framework Preset. (The existing Vercel project was created when
   this repository held an older Express app, so its saved preset is
   Express; without the pin, Vercel builds the site and then fails with
   "No entrypoint found" while looking for `server.js`.)
2. Deploy. **No environment variables are required.** (Optional:
   `SITE_URL=https://www.uniquelabs.org` — this is already the default.)
3. *Settings → Domains*: add `www.uniquelabs.org` and `uniquelabs.org`, and
   choose to redirect the apex to `www`. Create the DNS records Vercel shows
   at your registrar.

Every push to `main` deploys production; other branches get preview URLs,
which are automatically excluded from search engines (`noindex` and a
disallow-all `robots.txt`).

If the project still has variables from the old setup (`DATABASE_URL`,
`APP_SECRET`, `ADMIN_SETUP_TOKEN`, `CMC_API_KEY`, …), they are no longer used
and can be deleted, along with any connected database.

## Other hosts

Any Node.js host works:

```bash
npm ci
npm run build
npm start            # serves on port 3000 (PORT=… to change)
```

Put a TLS-terminating proxy (nginx, Caddy, your platform's edge) in front and
redirect `uniquelabs.org` to `https://www.uniquelabs.org` there.

## Checklist before launch

- [ ] Contact emails and social profiles in `src/content/company.ts`
- [ ] Products, projects, partnerships, team and journey filled in
- [ ] Privacy policy and terms reviewed (`src/content/site.ts`)
- [ ] Domain and HTTPS working; `https://uniquelabs.org` redirects to `www`
