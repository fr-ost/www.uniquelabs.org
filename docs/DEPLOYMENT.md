# Deployment guide

The app is a standard Node.js server (Next.js standalone output) plus a
PostgreSQL database. It needs **no database access at build time**.

## Choosing the database

| Hosting | Persistent local disk? | Use |
| --- | --- | --- |
| Railway, Render, Fly.io, Heroku-style containers | No (ephemeral) | **PostgreSQL** (managed) |
| Vercel / serverless | No | PostgreSQL (Neon, Supabase, …) — see Option D |
| VPS with a persistent disk | Yes | PostgreSQL (recommended for backups) |

This project uses PostgreSQL in all environments. The previous deployment of
this repository ran on Railway with PostgreSQL, so that's the recommended path.

## Environment variables

See [`.env.example`](../.env.example) for the full list. In production you must set:

| Variable | Value |
| --- | --- |
| `DATABASE_URL` | PostgreSQL connection string |
| `SITE_URL` | `https://www.uniquelabs.org` (no trailing slash) |
| `APP_SECRET` | 32+ random characters: `node -e "console.log(require('crypto').randomBytes(48).toString('base64url'))"` |
| `ADMIN_SETUP_TOKEN` | Only for the first admin (see below), then remove |
| `TRUSTED_PROXY_COUNT` | `1` behind Railway/Render/Fly/nginx |
| `CMC_API_KEY` | Recommended: free CoinMarketCap key for Market Intelligence (works keyless without it, with shared rate limits) |

The server validates its environment at start-up and refuses to boot in
production with a missing or placeholder `APP_SECRET`.

## Option A — Railway (recommended)

1. Create a project and add a **PostgreSQL** service.
2. Add a service from this GitHub repository. Railway detects the
   `Dockerfile` and builds the production image (Node 22 by default — pass
   `NODE_VERSION=24` as a build argument to use Node 24 LTS).
3. Set variables on the web service: `DATABASE_URL` (reference the Postgres
   service's variable), `SITE_URL`, `APP_SECRET`, `TRUSTED_PROXY_COUNT=1`,
   `CMC_API_KEY` (recommended) and temporarily `ADMIN_SETUP_TOKEN`.
4. Deploy. The container applies pending migrations (`prisma migrate deploy`)
   before starting, then creates the baseline content on first boot.
5. Open `https://<your-service>/admin/setup`, enter the setup token and create
   the owner account. Remove `ADMIN_SETUP_TOKEN` and redeploy.
6. Health check path: `/api/health`.

Without Docker, Railway's Node builder also works: build command
`npm run build`, start command `npm run db:deploy && npm start`.

## Option B — Docker anywhere

```bash
docker build -t uniquelabs-web .
docker run -d --name uniquelabs -p 3000:3000 \
  -e DATABASE_URL="postgresql://…" \
  -e SITE_URL="https://www.uniquelabs.org" \
  -e APP_SECRET="…" \
  -e TRUSTED_PROXY_COUNT=1 \
  uniquelabs-web
```

- The image runs as a non-root user, applies migrations on start
  (`RUN_MIGRATIONS=false` to disable — e.g. when running several replicas, run
  `npx prisma migrate deploy` once from CI instead), and exposes a healthcheck.
- To store media on disk instead of in PostgreSQL, set
  `MEDIA_STORAGE=filesystem`, `MEDIA_DIR=/app/storage/media` and mount a
  persistent volume at `/app/storage`.
- `docker compose --profile app up --build` runs the app plus a local
  PostgreSQL for a production-like local test.

## Option C — VPS (systemd + nginx)

```bash
git clone … && cd www.uniquelabs.org
npm ci
npm run build              # creates .next/standalone (assets copied automatically)
npm run db:deploy          # apply migrations
npm start                  # or a systemd unit running `node .next/standalone/server.js`
```

Put nginx (or Caddy) in front for TLS, set `TRUSTED_PROXY_COUNT=1`, and allow
large request bodies on the import endpoint if you import big archives:

```nginx
location /api/admin/imports/ {
    client_max_body_size 2048m;
    proxy_request_buffering off;
    proxy_pass http://127.0.0.1:3000;
}
```

## Outbound network

The server calls `pro-api.coinmarketcap.com` (market data) and
`s2.coinmarketcap.com` (coin logos, proxied to visitors). If your host
restricts egress, allow both. Browsers never contact them.

## Option D — Vercel

The site, admin and Market Intelligence run on Vercel. Vercel limits request
bodies to 4.5 MB and its serverless instances don't share files, so **large
Claude/X archive imports should be run from a local copy** connected to the
production database (see below). Media uploads default to 4 MB on Vercel.
Vercel's free Hobby plan is for personal, non-commercial use — check whether
your use needs Pro.

1. **Database.** Project → *Storage* → create a **Neon** (Postgres) database
   and connect it to the project for Production and Preview. This adds
   `DATABASE_URL` (pooled — used by the app) and `DATABASE_URL_UNPOOLED`
   (direct — used for migrations). Another provider works too: set
   `DATABASE_URL` to its pooled connection string and `DIRECT_DATABASE_URL`
   to the direct one. If your integration only created `POSTGRES_*`
   variables, add `DATABASE_URL` with the value of `POSTGRES_URL`.
2. **Environment variables** (*Settings → Environment Variables*, tick
   Production and Preview):
   - `APP_SECRET` — 32+ random characters
     (`node -e "console.log(require('crypto').randomBytes(48).toString('base64url'))"`)
   - `SITE_URL` — `https://www.uniquelabs.org`
   - `ADMIN_SETUP_TOKEN` — 24+ random characters (temporary, step 4)
   - `TRUSTED_PROXY_COUNT` — `1`
   - `CMC_API_KEY` — recommended (Market Intelligence)
3. **Deploy.** Leave *Build Command* on its default: Vercel then runs
   `npm run vercel-build` (`scripts/vercel-build.mjs`), which checks the
   settings above, applies database migrations on **production** deployments
   (previews skip them unless `RUN_MIGRATIONS=true`) and builds the app.
   Redeploy from *Deployments* (or push a commit) after adding variables.
4. **First admin.** Open `/admin/setup` on the deployment, enter the setup
   token, your name, email and a strong password. Then delete
   `ADMIN_SETUP_TOKEN` from the environment variables and redeploy.
5. **Domains.** *Settings → Domains*: add `www.uniquelabs.org` and
   `uniquelabs.org`, choose to redirect the apex to `www`, and create the DNS
   records Vercel shows at your registrar. Preview URLs (`*.vercel.app`) are
   served with `noindex` automatically.
6. **Check.** `/api/health` returns `{"ok":true,"database":"up"}`, `/intelligence` shows
   prices, and Admin → Intelligence lists every dataset as “OK”.

**Importing large archives on Vercel:** clone the repository, `npm install`,
create `.env` with the production `DATABASE_URL` (the direct/unpooled one is
fine), run `npm run dev`, sign in at `http://localhost:3000/admin` with your
owner account and import there. The candidates are written to the production
database and appear in the live admin for review.

## Domain configuration (www vs apex)

The canonical host is `www.uniquelabs.org`.

1. Point `www.uniquelabs.org` at the app (CNAME to your host).
2. Point the apex `uniquelabs.org` at the same app (ALIAS/ANAME/flattened
   CNAME, or your host's apex instructions) and attach both domains.
3. With `SITE_URL=https://www.uniquelabs.org`, the app permanently redirects
   (308) any request for `uniquelabs.org` to `https://www.uniquelabs.org`,
   preserving path and query. Canonical tags, the sitemap and Open Graph URLs
   always use the www host, and non-canonical hosts (e.g. `*.up.railway.app`)
   are served with `noindex` and a disallow-all `robots.txt`.
4. Enforce HTTPS at the edge (most hosts do automatically). HSTS is sent in
   production when `SITE_URL` is https.

## Database migrations

- Development: `npm run db:migrate` (creates and applies migrations).
- Production: `npm run db:deploy` (applies pending migrations only; the Docker
  entrypoint does this automatically).
- The initial migration adds CHECK constraints (publication gates,
  singletons). Keep them when writing future migrations.

## Admin initialisation

Never deploy with a default password. Choose one:

- **Setup token (no shell needed):** set `ADMIN_SETUP_TOKEN`, open
  `/admin/setup` once, create the owner account, then remove the variable. The
  page disables itself as soon as any admin exists.
- **CLI:** `npm run admin:create` on the server (Railway: `railway run npm run
  admin:create`). The password is prompted without echo.

See [ADMIN.md](ADMIN.md).

## Backups and recovery

Everything that matters lives in PostgreSQL (content, media in the default
`database` storage mode, candidates, evidence, audit log).

- **Managed backups:** enable your provider's automated backups / point-in-time
  recovery (Railway, Neon, Supabase, RDS all offer this).
- **Manual backup:** `pg_dump --format=custom "$DATABASE_URL" > uniquelabs-$(date +%F).dump`
- **Restore:** `pg_restore --clean --if-exists --no-owner -d "$DATABASE_URL" uniquelabs-YYYY-MM-DD.dump`
- If you use `MEDIA_STORAGE=filesystem`, back up the media volume as well.
- Test a restore into a staging database at least once.
- Raw import archives are deleted after processing — keep your original
  Claude/X downloads somewhere safe if you want to re-import later.

## Operations checklist

- [ ] `APP_SECRET` is long and random; `ADMIN_SETUP_TOKEN` removed after setup
- [ ] `SITE_URL` is `https://www.uniquelabs.org`; both domains attached
- [ ] Database backups enabled and a restore tested
- [ ] `/api/health` monitored
- [ ] Review the privacy policy and terms (Admin → SEO & legal) before launch
- [ ] Publish the suggested focus areas you agree with (Admin → What We Do)
- [ ] Add a contact email and social profiles (Admin → Contact information)
- [ ] Set `CMC_API_KEY` and check Admin → Intelligence shows every dataset “OK”
- [ ] Remove any development sample content (`npm run db:seed:demo -- --clear`)

## Scaling notes

The public data cache is in-process. With several replicas, an edit is
immediately visible on the replica that handled it and on the others within
10 minutes (time-based revalidation). Import jobs run in the process that
received them; run imports from a single instance (or add a job queue) if you
scale out. Rate limits and sessions are stored in PostgreSQL and work across
replicas.
