# AI Comment Generator for X - License Backend

Server-backed license keys with full live control, plus the OpenAI proxy, an
admin dashboard, and anonymous usage telemetry. There are **no user accounts and
no payment processor** here - you hand out keys yourself and control each one
from the dashboard.

## What it does

- **License keys** - each key is a row you control live: revoke, pause, set a
  daily reply limit, a device limit, an expiry date, a per-key model, and a note.
  Changes take effect within seconds on every device.
- **Device binding** - a key binds to devices (default 1). You can see each
  device (handle, IP, last-seen), block a single device, or unbind it.
- **Real enforcement at generation time** - the extension never holds the OpenAI
  key. Every reply is proxied through `POST /api/v1/generate`, which re-validates
  the key + device + daily limit on each call and then calls OpenAI with your
  server key. There is no UI lock to bypass - the server is the gate.
- **Model lock** - `FORCE_MODEL` (env) fixes the model for every generation. Users
  cannot change it; even a per-key model is overridden by `FORCE_MODEL` when set.
- **Global controls** - kill switch (pause every key at once), maintenance mode,
  a scrolling announcement banner, and a "please update" banner.
- **Dashboard** at `/` with three tabs: Usage (anonymous telemetry), Licenses
  (create / manage keys + devices), Settings (the global controls above).
- **Telemetry** - anonymous global counters only (comment counts, tokens, country
  via GeoIP then the IP is discarded, OS/browser, model split, 30-day chart).

## 1. Deploy on Railway

1. Push this `xcg-backend` folder to a GitHub repo.
2. On [railway.app](https://railway.app): New Project -> Deploy from GitHub repo.
3. Add a **PostgreSQL** plugin (Railway sets `DATABASE_URL` automatically).
4. Add these variables (service -> Variables):
   - `OPENAI_API_KEY` (required) - your OpenAI secret key, the only place it lives.
   - `DASHBOARD_KEY` (required) - a long random string; protects the dashboard
     and every admin endpoint.
   - `FORCE_MODEL` (default `gpt-4.1-nano`) - the locked model for all generations.
   - `NEW_KEY_DAILY_LIMIT` (default 50), `NEW_KEY_DEVICE_LIMIT` (default 1) -
     defaults applied when you create a key without specifying them.
   - `MAX_OUTPUT_TOKENS` (optional, default 200).
   - `GEN_MAX_TOTAL_CHARS` (optional, default 16000) - max prompt size. Raise it
     if you ever see "That post is too long to process".
   - `INGEST_KEY` (optional) - deterrent key for the telemetry endpoint.
5. Deploy. The server creates all tables on boot. Open the Railway URL and append
   `/healthz` to confirm it returns `{"ok":true}`.

## 2. Point the extension at the backend

1. In the extension's `background.js`, set `BACKEND_URL` to your Railway URL
   (no trailing slash), e.g. `https://xcg-backend-production.up.railway.app`.
2. In `manifest.json`, replace the `YOUR-BACKEND.up.railway.app` entry in
   `host_permissions` with the same host.
3. Reload the extension at `chrome://extensions`.

## 3. Using the dashboard

Open the Railway URL, paste your `DASHBOARD_KEY`.

- **Licenses tab**
  - *Create a key*: set a label, daily limit (`-1` = unlimited), device limit,
    optional expiry in days, or paste your own custom key. The new key is shown
    with a copy button - send it to the customer.
  - *Table*: every key with its status, today's usage, and controls. Inline
    inputs change the daily/device limit or set expiry to now + N days; **Save**
    applies. **Reset** clears today's usage. **Pause** is a temporary off,
    **Revoke** turns it off, **Delete** removes it (and its devices). Click the
    device count to expand the device list and **Block** / **Unbind** a device.
- **Settings tab** - kill switch, maintenance mode + message, announcement banner
  + link, and minimum version + update message + link.

A key is what the customer types into the extension's Settings page once.

## API reference (for your own testing)

All admin/stats endpoints require the `x-dashboard-key` header (or `?key=`).

| Method | Path | Auth | Notes |
|---|---|---|---|
| POST | `/api/v1/license/checkin` | - | `{key,device,handle,version}` -> `{ok,reason,daysLeft,...}` |
| POST | `/api/v1/license/heartbeat` | - | marks a device online |
| POST | `/api/v1/generate` | key+device in body | the real gate; proxies OpenAI |
| GET  | `/api/v1/admin/licenses` | admin | list keys (`?search=`) |
| POST | `/api/v1/admin/licenses` | admin | create `{key?,label,daily_limit,device_limit,days,model}` |
| POST | `/api/v1/admin/licenses/:key` | admin | update status/limits/days/model/resetUsage |
| POST | `/api/v1/admin/licenses/:key/delete` | admin | delete a key |
| GET  | `/api/v1/admin/licenses/:key/devices` | admin | list bound devices |
| POST | `/api/v1/admin/licenses/:key/devices/:deviceId` | admin | `{revoked}` block/unblock, `{remove}` unbind |
| GET/POST | `/api/v1/admin/config` | admin | global kill / maintenance / announce / update |
| GET  | `/api/v1/stats` | admin | telemetry + license counts (dashboard) |
| POST | `/api/v1/track` | optional ingest key | anonymous telemetry ingest |
| GET  | `/healthz` | - | health check |

### Check-in reasons

`invalid`, `revoked`, `expired`, `device_revoked`, `device_limit`, `paused`,
`killed` (global kill switch), plus a soft `maintenance` flag. The extension maps
each to a friendly message, re-checks every ~2 minutes, and keeps working offline
for up to 7 days after the last good check-in (hard rejections clear the key
immediately).

### Why the proxy design

Because the OpenAI key lives only on the server and every generation re-validates
the license, a leaked extension reveals nothing exploitable: a holder cannot steal
the key, exceed their daily limit, change the model, or share one key beyond its
device limit. The dashboard is the single source of truth.

## Local run (optional)

```bash
npm install
# set DATABASE_URL, OPENAI_API_KEY, DASHBOARD_KEY, FORCE_MODEL in your shell or a .env
npm start
```

(c) Shahriar Ahmed - Telegram @igfrostt
