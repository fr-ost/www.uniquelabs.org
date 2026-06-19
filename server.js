/* =========================================================================
   AI Comment Generator for X - License Backend  v3.0.0
   Author: Shahriar Ahmed  -  TG: https://t.me/igfrostt
   -------------------------------------------------------------------------
   Server-backed license keys with full live control (no offline keygen):

     KEYS        each key is a row you fully control from the dashboard:
                 revoke, pause, set a daily reply limit, set a device limit,
                 set an expiry date, set a per-key model, add a note. Changes
                 take effect within seconds on every device.
     DEVICES     a key binds to devices (default 1). You can see each device,
                 its handle / IP / last-seen, block a single device, or unbind.
     CHECK-IN    the extension calls /api/v1/license/checkin to unlock; the
                 server replies ok or a reason (invalid / revoked / expired /
                 device_revoked / device_limit / paused / maintenance).
     ENFORCEMENT the REAL gate is /api/v1/generate: it re-validates the key +
                 device + daily limit on every single generation and calls
                 OpenAI with the server's own key. Nobody can skip the UI lock.
     MODEL       locked server-side (FORCE_MODEL env), users can never change it.
     CONTROL     global kill switch, maintenance mode, announcement banner, and
                 "please update" banner, all from the dashboard.
     TELEMETRY   anonymous global counters (unchanged) -> Usage tab.

   Env vars (see .env.example):
     DATABASE_URL           Postgres (Railway provides it).
     OPENAI_API_KEY         your OpenAI key. Required for generation.
     DASHBOARD_KEY          admin key: protects the dashboard + admin APIs.
     FORCE_MODEL            locked model for every generation (default gpt-4.1-nano).
     MAX_OUTPUT_TOKENS      optional, default 200 (server hard cap).
     NEW_KEY_DAILY_LIMIT    default daily limit for newly created keys (default 50).
     NEW_KEY_DEVICE_LIMIT   default device limit for newly created keys (default 1).
     INGEST_KEY             optional telemetry write key.
     PORT                   set by Railway.
   ========================================================================= */

const path = require("path");
const crypto = require("crypto");
const express = require("express");
const { Pool } = require("pg");
const geoip = require("geoip-lite");

const PORT             = process.env.PORT || 3000;
const DATABASE_URL     = process.env.DATABASE_URL || "";
const OPENAI_API_KEY   = process.env.OPENAI_API_KEY || "";
const DASHBOARD_KEY    = process.env.DASHBOARD_KEY || "";
const INGEST_KEY       = process.env.INGEST_KEY || "";
const MAX_OUTPUT_TOKENS = Math.max(40, Number(process.env.MAX_OUTPUT_TOKENS) || 200);
const FORCE_MODEL      = (process.env.FORCE_MODEL || "gpt-4.1-nano").trim();
const NEW_KEY_DAILY_LIMIT  = Number.isFinite(Number(process.env.NEW_KEY_DAILY_LIMIT)) ? Math.floor(Number(process.env.NEW_KEY_DAILY_LIMIT)) : 50;
const NEW_KEY_DEVICE_LIMIT = Number.isFinite(Number(process.env.NEW_KEY_DEVICE_LIMIT)) ? Math.floor(Number(process.env.NEW_KEY_DEVICE_LIMIT)) : 1;

const OPENAI_ENDPOINT = "https://api.openai.com/v1/chat/completions";

// Generation is fully locked server-side. Clients cannot influence any of this.
// The prompt-size cap must be comfortably larger than the extension's own
// prompt (style rules + task + anti-repeat history + the tweet), which runs to
// several thousand characters. Both are env-tunable so you never need a code
// change to adjust them - set them in Railway > Variables and restart.
const GEN_MAX_MESSAGES    = Math.max(2, Number(process.env.GEN_MAX_MESSAGES) || 8);
const GEN_MAX_TOTAL_CHARS = Math.max(2000, Number(process.env.GEN_MAX_TOTAL_CHARS) || 16000);
const GEN_RATE_PER_MIN    = Math.max(1, Number(process.env.GEN_RATE_PER_MIN) || 15); // per-key burst guard

if (!DATABASE_URL) { console.error("FATAL: DATABASE_URL not set."); process.exit(1); }
if (!OPENAI_API_KEY) console.warn("WARNING: OPENAI_API_KEY not set - generation will fail until you add it.");

const pool = new Pool({
  connectionString: DATABASE_URL,
  ssl: /localhost|127\.0\.0\.1/.test(DATABASE_URL) ? false : { rejectUnauthorized: false },
  max: 8
});
const q = (text, params) => pool.query(text, params);

const MODEL_PRICING = {
  "gpt-4o": { in: 2.50, out: 10.00 }, "gpt-4o-mini": { in: 0.15, out: 0.60 },
  "gpt-4.1": { in: 2.00, out: 8.00 }, "gpt-4.1-mini": { in: 0.40, out: 1.60 },
  "gpt-4.1-nano": { in: 0.10, out: 0.40 }, "gpt-3.5-turbo": { in: 0.50, out: 1.50 },
  "gpt-5": { in: 1.25, out: 10.00 }, "gpt-5-mini": { in: 0.25, out: 2.00 },
  "gpt-5-nano": { in: 0.05, out: 0.40 }, "o4-mini": { in: 1.10, out: 4.40 }, "o3-mini": { in: 1.10, out: 4.40 }
};
function costFor(model, tin, tout) {
  const p = MODEL_PRICING[model] || MODEL_PRICING["gpt-4o"];
  return (Number(tin || 0) / 1e6) * p.in + (Number(tout || 0) / 1e6) * p.out;
}

/* ----------------------------- schema + seed ----------------------------- */
async function initSchema() {
  await q(`
    CREATE TABLE IF NOT EXISTS licenses (
      key          TEXT PRIMARY KEY,
      status       TEXT NOT NULL DEFAULT 'active',  -- active | paused | revoked
      label        TEXT,                            -- admin note (customer name etc.)
      daily_limit  INTEGER NOT NULL DEFAULT 50,     -- replies/day per key (-1 unlimited)
      device_limit INTEGER NOT NULL DEFAULT 1,      -- max bound devices
      model        TEXT,                            -- optional per-key model override
      expires_at   TIMESTAMPTZ,                     -- NULL = never expires
      usage_date   DATE,
      usage_count  INTEGER NOT NULL DEFAULT 0,
      tokens_in    BIGINT NOT NULL DEFAULT 0,
      tokens_out   BIGINT NOT NULL DEFAULT 0,
      created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
      last_seen_at TIMESTAMPTZ
    );
    CREATE TABLE IF NOT EXISTS license_devices (
      id         BIGSERIAL PRIMARY KEY,
      key        TEXT NOT NULL REFERENCES licenses(key) ON DELETE CASCADE,
      device_id  TEXT NOT NULL,
      handle     TEXT,
      ip         TEXT,
      version    TEXT,
      revoked    BOOLEAN NOT NULL DEFAULT false,
      first_seen TIMESTAMPTZ NOT NULL DEFAULT now(),
      last_seen  TIMESTAMPTZ NOT NULL DEFAULT now(),
      UNIQUE (key, device_id)
    );
    CREATE INDEX IF NOT EXISTS ld_key_idx ON license_devices (key);
    CREATE TABLE IF NOT EXISTS app_config (
      id INTEGER PRIMARY KEY DEFAULT 1,
      killed BOOLEAN NOT NULL DEFAULT false,
      maintenance BOOLEAN NOT NULL DEFAULT false,
      maintenance_msg TEXT,
      announce TEXT,
      announce_link TEXT,
      min_version TEXT,
      update_msg TEXT,
      update_link TEXT
    );
    INSERT INTO app_config (id) VALUES (1) ON CONFLICT (id) DO NOTHING;
    CREATE TABLE IF NOT EXISTS events (
      id BIGSERIAL PRIMARY KEY, client_id TEXT NOT NULL, ts TIMESTAMPTZ NOT NULL DEFAULT now(),
      event_type TEXT NOT NULL, source TEXT, button TEXT, model TEXT,
      tokens_in INTEGER NOT NULL DEFAULT 0, tokens_out INTEGER NOT NULL DEFAULT 0,
      country TEXT, os TEXT, browser TEXT, ext_version TEXT
    );
    CREATE INDEX IF NOT EXISTS events_ts_idx ON events (ts);
  `);
  console.log("schema ready");
}

/* ----------------------------- helpers ----------------------------- */
const todayStr = () => new Date().toISOString().slice(0, 10);
const normKey = (k) => String(k || "").trim().toUpperCase();
function clampStr(v, max) { return v == null ? null : String(v).slice(0, max); }
function clampInt(v) { const n = Math.floor(Number(v)); return Number.isFinite(n) ? Math.max(0, Math.min(1_000_000, n)) : 0; }

function genKey() {
  const part = () => crypto.randomBytes(2).toString("hex").toUpperCase(); // 4 hex chars
  return `XCG-${part()}-${part()}-${part()}-${part()}`;
}
function daysLeftOf(expires_at) {
  if (!expires_at) return null;
  const ms = new Date(expires_at).getTime() - Date.now();
  return Math.ceil(ms / 86400000);
}
async function getConfig() {
  const r = await q(`SELECT * FROM app_config WHERE id=1`);
  return r.rows[0] || {};
}

// Core validation shared by checkin + generate.
// Returns { ok:true, license, deviceRow, daysLeft } or { ok:false, reason }.
// When bind=true and the device is unknown, it is bound if under the limit.
async function validateLicense(rawKey, deviceId, ctx = {}) {
  const key = normKey(rawKey);
  const device = String(deviceId || "").trim();
  if (!key) return { ok: false, reason: "invalid" };

  const lr = await q(`SELECT * FROM licenses WHERE key=$1`, [key]);
  const lic = lr.rows[0];
  if (!lic) return { ok: false, reason: "invalid" };
  if (lic.status === "revoked") return { ok: false, reason: "revoked" };
  if (lic.status === "paused")  return { ok: false, reason: "paused" };
  if (lic.expires_at && new Date(lic.expires_at) < new Date()) return { ok: false, reason: "expired" };

  // touch last_seen for the key
  await q(`UPDATE licenses SET last_seen_at=now() WHERE key=$1`, [key]);

  if (!device) return { ok: false, reason: "invalid" };

  const dr = await q(`SELECT * FROM license_devices WHERE key=$1 AND device_id=$2`, [key, device]);
  let deviceRow = dr.rows[0];

  if (deviceRow) {
    if (deviceRow.revoked) return { ok: false, reason: "device_revoked" };
    await q(`UPDATE license_devices SET last_seen=now(),
               handle=COALESCE($3,handle), ip=COALESCE($4,ip), version=COALESCE($5,version)
             WHERE key=$1 AND device_id=$2`,
      [key, device, clampStr(ctx.handle, 40), clampStr(ctx.ip, 64), clampStr(ctx.version, 24)]);
  } else {
    // unknown device -> bind if room
    const cnt = await q(`SELECT count(*)::int AS n FROM license_devices WHERE key=$1 AND revoked=false`, [key]);
    const used = cnt.rows[0].n;
    const limit = Number(lic.device_limit);
    if (limit >= 0 && used >= limit) return { ok: false, reason: "device_limit" };
    if (ctx.bind) {
      await q(`INSERT INTO license_devices (key, device_id, handle, ip, version)
               VALUES ($1,$2,$3,$4,$5)
               ON CONFLICT (key, device_id) DO UPDATE SET last_seen=now()`,
        [key, device, clampStr(ctx.handle, 40), clampStr(ctx.ip, 64), clampStr(ctx.version, 24)]);
      deviceRow = (await q(`SELECT * FROM license_devices WHERE key=$1 AND device_id=$2`, [key, device])).rows[0];
    } else {
      return { ok: false, reason: "device_limit" };
    }
  }
  return { ok: true, license: lic, deviceRow, daysLeft: daysLeftOf(lic.expires_at) };
}

function adminAuthed(req) {
  if (!DASHBOARD_KEY) return true;
  return (req.get("x-dashboard-key") === DASHBOARD_KEY) || (req.query.key === DASHBOARD_KEY);
}
function clientIp(req) {
  const xf = (req.get("x-forwarded-for") || "").split(",")[0].trim();
  return xf || req.ip || null;
}

/* ----------------------------- app ----------------------------- */
const app = express();
app.set("trust proxy", true);
app.use(express.json({ limit: "512kb" }));
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type,x-ingest-key,x-dashboard-key");
  if (req.method === "OPTIONS") return res.sendStatus(204);
  next();
});

// simple per-IP rate limit (telemetry + checkin floods)
const RL_WINDOW_MS = 60 * 1000, RL_MAX = 240;
const rl = new Map();
function rateLimited(ip, weight = 1) {
  const now = Date.now(); const e = rl.get(ip);
  if (!e || now > e.resetAt) { rl.set(ip, { count: weight, resetAt: now + RL_WINDOW_MS }); return false; }
  e.count += weight; return e.count > RL_MAX;
}
setInterval(() => { const now = Date.now(); for (const [k, v] of rl) if (now > v.resetAt) rl.delete(k); }, RL_WINDOW_MS).unref();

// per-key generation burst guard
const genRl = new Map();
function genRateLimited(key) {
  const now = Date.now(); const e = genRl.get(key);
  if (!e || now > e.resetAt) { genRl.set(key, { count: 1, resetAt: now + 60000 }); return false; }
  e.count += 1; return e.count > GEN_RATE_PER_MIN;
}
setInterval(() => { const now = Date.now(); for (const [k, v] of genRl) if (now > v.resetAt) genRl.delete(k); }, 60000).unref();

/* ======================= LICENSE: check-in ======================= */
app.post("/api/v1/license/checkin", async (req, res) => {
  if (rateLimited(clientIp(req), 1)) return res.status(429).json({ ok: false, reason: "auth" });
  const b = req.body || {};
  try {
    const cfg = await getConfig();
    if (cfg.killed) return res.json({ ok: false, reason: "killed" });

    const r = await validateLicense(b.key, b.device, {
      bind: true, handle: b.handle, version: b.version, ip: clientIp(req)
    });

    // maintenance: still "ok" so the client shows a soft maintenance lock
    if (cfg.maintenance) {
      return res.json({ ok: true, maintenance: true, maintenanceMsg: cfg.maintenance_msg || "" });
    }
    if (!r.ok) return res.json({ ok: false, reason: r.reason });

    const lim = Number(r.license.daily_limit);
    const usedToday = (String(r.license.usage_date).slice(0, 10) === todayStr()) ? Number(r.license.usage_count) : 0;
    res.json({
      ok: true,
      daysLeft: r.daysLeft,
      label: r.license.label || null,
      dailyLimit: lim,
      deviceLimit: Number(r.license.device_limit),
      used: usedToday,
      remaining: lim < 0 ? null : Math.max(0, lim - usedToday),
      unlimited: lim < 0,
      announce: cfg.announce || "",
      announceLink: cfg.announce_link || "",
      minVersion: cfg.min_version || "",
      updateMsg: cfg.update_msg || "",
      updateLink: cfg.update_link || ""
    });
  } catch (e) { console.error("checkin:", e.message); res.json({ ok: false, reason: "auth" }); }
});

/* ======================= LICENSE: heartbeat ======================= */
app.post("/api/v1/license/heartbeat", async (req, res) => {
  const b = req.body || {};
  try {
    const key = normKey(b.key), device = String(b.device || "").trim();
    if (key && device) {
      await q(`UPDATE license_devices SET last_seen=now(),
                 handle=COALESCE($3,handle), ip=COALESCE($4,ip)
               WHERE key=$1 AND device_id=$2 AND revoked=false`,
        [key, device, clampStr(b.handle, 40), clampStr(clientIp(req), 64)]);
    }
  } catch (_) {}
  res.json({ ok: true });
});

/* ======================= GENERATE (license-gated OpenAI proxy) ======================= */
app.post("/api/v1/generate", async (req, res) => {
  if (!OPENAI_API_KEY) return res.status(503).json({ ok: false, error: "server_no_api_key" });
  const b = req.body || {};
  const key = normKey(b.key), device = String(b.device || "").trim();

  try {
    const cfg = await getConfig();
    if (cfg.killed) return res.status(403).json({ ok: false, error: "killed" });
    if (cfg.maintenance) return res.status(503).json({ ok: false, error: "maintenance" });

    // burst guard per key
    if (genRateLimited(key || clientIp(req))) return res.status(429).json({ ok: false, error: "too_fast" });

    // validate license + device (bind if first time and under limit)
    const v = await validateLicense(key, device, { bind: true, handle: b.handle, ip: clientIp(req), version: b.version });
    if (!v.ok) return res.status(403).json({ ok: false, error: v.reason });
    const lic = v.license;

    // validate the prompt strictly; ignore every other client field
    const messages = Array.isArray(b.messages) ? b.messages.slice(0, GEN_MAX_MESSAGES) : null;
    if (!messages || !messages.length) return res.status(400).json({ ok: false, error: "no_messages" });
    let totalChars = 0;
    for (const mm of messages) {
      if (!mm || typeof mm.content !== "string") return res.status(400).json({ ok: false, error: "bad_messages" });
      if (!["system", "user", "assistant"].includes(mm.role)) return res.status(400).json({ ok: false, error: "bad_messages" });
      totalChars += mm.content.length;
    }
    if (totalChars > GEN_MAX_TOTAL_CHARS) return res.status(413).json({ ok: false, error: "input_too_large" });

    const limit = Number(lic.daily_limit);
    const model = FORCE_MODEL || lic.model || "gpt-4.1-nano";
    const today = todayStr();

    // reset daily window if the date rolled over, then atomically claim a slot
    await q(`UPDATE licenses SET usage_count=0, usage_date=$2 WHERE key=$1 AND (usage_date IS DISTINCT FROM $2)`, [key, today]);
    const claim = await q(
      `UPDATE licenses SET usage_count = usage_count + 1, last_seen_at = now()
       WHERE key=$1 AND status='active' AND ($2 < 0 OR usage_count < $2)
       RETURNING usage_count`, [key, limit]);
    if (!claim.rowCount) return res.status(429).json({ ok: false, error: "daily_limit_reached", limit });
    const used = Number(claim.rows[0].usage_count);

    // Build the OpenAI payload. Model + token cap + sampling fixed server-side.
    const isReasoning = /^(o\d|gpt-5)/i.test(model);
    const payload = { model, messages };
    if (isReasoning) {
      payload.max_completion_tokens = MAX_OUTPUT_TOKENS;
    } else {
      payload.max_tokens = MAX_OUTPUT_TOKENS;
      payload.temperature = 0.95;
      payload.presence_penalty = 0.6;
      payload.frequency_penalty = 0.5;
    }

    let out, usage;
    try {
      const r = await fetch(OPENAI_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${OPENAI_API_KEY}` },
        body: JSON.stringify(payload)
      });
      const raw = await r.text();
      if (!r.ok) throw new Error("openai_" + r.status + ":" + raw.slice(0, 200));
      const data = JSON.parse(raw);
      out = data && data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content;
      usage = data && data.usage;
      if (!out || !out.trim()) throw new Error("openai_empty");
    } catch (err) {
      await q(`UPDATE licenses SET usage_count = GREATEST(0, usage_count - 1) WHERE key=$1`, [key]);
      console.error("openai:", err.message);
      return res.status(502).json({ ok: false, error: "generation_failed" });
    }

    const tin = Math.max(0, Number(usage && usage.prompt_tokens || 0));
    const tout = Math.max(0, Number(usage && usage.completion_tokens || 0));
    await q(`UPDATE licenses SET tokens_in = tokens_in + $2, tokens_out = tokens_out + $3 WHERE key=$1`, [key, tin, tout]);

    const remaining = limit < 0 ? null : Math.max(0, limit - used);
    res.json({
      ok: true, output: out.trim(), model,
      used, limit, remaining, unlimited: limit < 0,
      tokenUsage: { prompt_tokens: tin, completion_tokens: tout, total_tokens: tin + tout }
    });
  } catch (e) {
    console.error("generate:", e.message);
    res.status(500).json({ ok: false, error: "server_error" });
  }
});

/* ======================= ADMIN: licenses ======================= */
function licenseView(l, deviceCount) {
  const today = todayStr();
  const used = (String(l.usage_date).slice(0, 10) === today) ? Number(l.usage_count) : 0;
  return {
    key: l.key, status: l.status, label: l.label || "",
    dailyLimit: Number(l.daily_limit), deviceLimit: Number(l.device_limit),
    model: l.model || "", expiresAt: l.expires_at,
    daysLeft: daysLeftOf(l.expires_at),
    used, remaining: Number(l.daily_limit) < 0 ? null : Math.max(0, Number(l.daily_limit) - used),
    tokensIn: Number(l.tokens_in), tokensOut: Number(l.tokens_out),
    devices: deviceCount, createdAt: l.created_at, lastSeenAt: l.last_seen_at
  };
}

app.get("/api/v1/admin/licenses", async (req, res) => {
  if (!adminAuthed(req)) return res.status(401).json({ ok: false, error: "bad_admin_key" });
  const search = String(req.query.search || "").trim().toUpperCase();
  const limit = Math.min(1000, Math.max(1, Number(req.query.limit) || 500));
  try {
    const rows = search
      ? (await q(`SELECT * FROM licenses WHERE upper(key) LIKE $1 OR upper(COALESCE(label,'')) LIKE $1 ORDER BY created_at DESC LIMIT $2`, ["%" + search + "%", limit])).rows
      : (await q(`SELECT * FROM licenses ORDER BY created_at DESC LIMIT $1`, [limit])).rows;
    const counts = (await q(`SELECT key, count(*) FILTER (WHERE revoked=false)::int AS n FROM license_devices GROUP BY key`)).rows;
    const cmap = {}; counts.forEach((c) => cmap[c.key] = c.n);
    res.json({ ok: true, licenses: rows.map((l) => licenseView(l, cmap[l.key] || 0)) });
  } catch (e) { console.error("admin list:", e.message); res.status(500).json({ ok: false, error: "server_error" }); }
});

app.get("/api/v1/admin/licenses/:key/devices", async (req, res) => {
  if (!adminAuthed(req)) return res.status(401).json({ ok: false, error: "bad_admin_key" });
  const key = normKey(req.params.key);
  try {
    const rows = (await q(`SELECT * FROM license_devices WHERE key=$1 ORDER BY last_seen DESC`, [key])).rows;
    res.json({ ok: true, devices: rows.map((d) => ({
      id: d.id, deviceId: d.device_id, handle: d.handle || "", ip: d.ip || "", version: d.version || "",
      revoked: d.revoked, firstSeen: d.first_seen, lastSeen: d.last_seen
    })) });
  } catch (e) { console.error("admin devices:", e.message); res.status(500).json({ ok: false, error: "server_error" }); }
});

// Create a key. Body: { key?, label?, daily_limit?, device_limit?, model?, days? }
app.post("/api/v1/admin/licenses", async (req, res) => {
  if (!adminAuthed(req)) return res.status(401).json({ ok: false, error: "bad_admin_key" });
  const b = req.body || {};
  try {
    let key = b.key ? normKey(b.key) : genKey();
    const exists = await q(`SELECT 1 FROM licenses WHERE key=$1`, [key]);
    if (exists.rowCount) return res.status(409).json({ ok: false, error: "key_exists" });
    const daily = Number.isFinite(Number(b.daily_limit)) ? Math.floor(Number(b.daily_limit)) : NEW_KEY_DAILY_LIMIT;
    const devs  = Number.isFinite(Number(b.device_limit)) ? Math.floor(Number(b.device_limit)) : NEW_KEY_DEVICE_LIMIT;
    const days  = Number(b.days);
    const expires = (Number.isFinite(days) && days > 0) ? new Date(Date.now() + days * 86400000) : null;
    await q(`INSERT INTO licenses (key,label,daily_limit,device_limit,model,expires_at,usage_date)
             VALUES ($1,$2,$3,$4,$5,$6,$7)`,
      [key, clampStr(b.label, 80), daily, devs, clampStr(b.model, 60) || null, expires, todayStr()]);
    res.json({ ok: true, key });
  } catch (e) { console.error("admin create:", e.message); res.status(500).json({ ok: false, error: "server_error" }); }
});

// Update a key. Body may include: status, label, daily_limit, device_limit, model,
// days (sets expiry now+days; 0/empty clears expiry), resetUsage.
app.post("/api/v1/admin/licenses/:key", async (req, res) => {
  if (!adminAuthed(req)) return res.status(401).json({ ok: false, error: "bad_admin_key" });
  const key = normKey(req.params.key);
  const b = req.body || {};
  try {
    const cur = (await q(`SELECT * FROM licenses WHERE key=$1`, [key])).rows[0];
    if (!cur) return res.status(404).json({ ok: false, error: "unknown_key" });
    if (b.status !== undefined && ["active", "paused", "revoked"].includes(b.status)) {
      await q(`UPDATE licenses SET status=$2 WHERE key=$1`, [key, b.status]);
    }
    if (b.label !== undefined) await q(`UPDATE licenses SET label=$2 WHERE key=$1`, [key, clampStr(b.label, 80)]);
    if (b.daily_limit !== undefined && Number.isFinite(Number(b.daily_limit)))
      await q(`UPDATE licenses SET daily_limit=$2 WHERE key=$1`, [key, Math.floor(Number(b.daily_limit))]);
    if (b.device_limit !== undefined && Number.isFinite(Number(b.device_limit)))
      await q(`UPDATE licenses SET device_limit=$2 WHERE key=$1`, [key, Math.floor(Number(b.device_limit))]);
    if (b.model !== undefined) await q(`UPDATE licenses SET model=$2 WHERE key=$1`, [key, clampStr(b.model, 60) || null]);
    if (b.days !== undefined) {
      const days = Number(b.days);
      const expires = (Number.isFinite(days) && days > 0) ? new Date(Date.now() + days * 86400000) : null;
      await q(`UPDATE licenses SET expires_at=$2 WHERE key=$1`, [key, expires]);
    }
    if (b.resetUsage) await q(`UPDATE licenses SET usage_count=0, usage_date=$2 WHERE key=$1`, [key, todayStr()]);
    res.json({ ok: true });
  } catch (e) { console.error("admin update:", e.message); res.status(500).json({ ok: false, error: "server_error" }); }
});

// Delete a key entirely (and its devices via cascade).
app.post("/api/v1/admin/licenses/:key/delete", async (req, res) => {
  if (!adminAuthed(req)) return res.status(401).json({ ok: false, error: "bad_admin_key" });
  try { await q(`DELETE FROM licenses WHERE key=$1`, [normKey(req.params.key)]); res.json({ ok: true }); }
  catch (e) { console.error("admin del:", e.message); res.status(500).json({ ok: false, error: "server_error" }); }
});

// Block / unblock a single device, or remove (unbind) it.
app.post("/api/v1/admin/licenses/:key/devices/:deviceId", async (req, res) => {
  if (!adminAuthed(req)) return res.status(401).json({ ok: false, error: "bad_admin_key" });
  const key = normKey(req.params.key), device = String(req.params.deviceId || "");
  const b = req.body || {};
  try {
    if (b.remove) {
      await q(`DELETE FROM license_devices WHERE key=$1 AND device_id=$2`, [key, device]);
    } else {
      await q(`UPDATE license_devices SET revoked=$3 WHERE key=$1 AND device_id=$2`, [key, device, b.revoked !== false]);
    }
    res.json({ ok: true });
  } catch (e) { console.error("admin device:", e.message); res.status(500).json({ ok: false, error: "server_error" }); }
});

/* ======================= ADMIN: global config ======================= */
app.get("/api/v1/admin/config", async (req, res) => {
  if (!adminAuthed(req)) return res.status(401).json({ ok: false, error: "bad_admin_key" });
  const c = await getConfig();
  res.json({ ok: true, config: {
    killed: !!c.killed, maintenance: !!c.maintenance, maintenanceMsg: c.maintenance_msg || "",
    announce: c.announce || "", announceLink: c.announce_link || "",
    minVersion: c.min_version || "", updateMsg: c.update_msg || "", updateLink: c.update_link || ""
  } });
});
app.post("/api/v1/admin/config", async (req, res) => {
  if (!adminAuthed(req)) return res.status(401).json({ ok: false, error: "bad_admin_key" });
  const b = req.body || {};
  try {
    await q(`UPDATE app_config SET
       killed=$1, maintenance=$2, maintenance_msg=$3, announce=$4, announce_link=$5,
       min_version=$6, update_msg=$7, update_link=$8 WHERE id=1`,
      [!!b.killed, !!b.maintenance, clampStr(b.maintenanceMsg, 200), clampStr(b.announce, 240),
       clampStr(b.announceLink, 200), clampStr(b.minVersion, 24), clampStr(b.updateMsg, 200), clampStr(b.updateLink, 200)]);
    res.json({ ok: true });
  } catch (e) { console.error("admin config:", e.message); res.status(500).json({ ok: false, error: "server_error" }); }
});

/* ======================= STATS (telemetry dashboard) ======================= */
app.get("/api/v1/stats", async (req, res) => {
  if (!adminAuthed(req)) return res.status(401).json({ ok: false, error: "bad_dashboard_key" });
  const C = `event_type = 'comment_generated'`;
  try {
    const [totals, today, byCountry, byModel, bySource, byButton, byOS, byBrowser, series, recent, lic] = await Promise.all([
      q(`SELECT count(*)::bigint comments, COALESCE(sum(tokens_in),0)::bigint tin, COALESCE(sum(tokens_out),0)::bigint tout, count(DISTINCT client_id)::bigint installs, count(DISTINCT country)::bigint countries FROM events WHERE ${C}`),
      q(`SELECT count(*)::bigint comments, COALESCE(sum(tokens_in+tokens_out),0)::bigint tokens FROM events WHERE ${C} AND ts >= date_trunc('day', now())`),
      q(`SELECT COALESCE(country,'??') country, count(*)::bigint comments, COALESCE(sum(tokens_in+tokens_out),0)::bigint tokens FROM events WHERE ${C} GROUP BY country ORDER BY comments DESC LIMIT 100`),
      q(`SELECT COALESCE(model,'unknown') model, count(*)::bigint comments, COALESCE(sum(tokens_in),0)::bigint tin, COALESCE(sum(tokens_out),0)::bigint tout FROM events WHERE ${C} GROUP BY model ORDER BY comments DESC`),
      q(`SELECT COALESCE(source,'unknown') source, count(*)::bigint comments FROM events WHERE ${C} GROUP BY source`),
      q(`SELECT COALESCE(NULLIF(button,''),'n/a') button, count(*)::bigint comments FROM events WHERE ${C} GROUP BY button`),
      q(`SELECT COALESCE(NULLIF(os,''),'unknown') os, count(*)::bigint comments FROM events WHERE ${C} GROUP BY os ORDER BY comments DESC`),
      q(`SELECT COALESCE(NULLIF(browser,''),'unknown') browser, count(*)::bigint comments FROM events WHERE ${C} GROUP BY browser ORDER BY comments DESC`),
      q(`SELECT to_char(date_trunc('day', ts),'YYYY-MM-DD') day, count(*)::bigint comments, COALESCE(sum(tokens_in+tokens_out),0)::bigint tokens FROM events WHERE ${C} AND ts >= now() - interval '30 days' GROUP BY 1 ORDER BY 1`),
      q(`SELECT to_char(ts,'YYYY-MM-DD"T"HH24:MI:SS"Z"') ts, COALESCE(country,'??') country, COALESCE(model,'unknown') model, COALESCE(source,'unknown') source, COALESCE(NULLIF(button,''),'n/a') button, COALESCE(NULLIF(os,''),'unknown') os, COALESCE(NULLIF(browser,''),'unknown') browser, tokens_in, tokens_out FROM events WHERE ${C} ORDER BY ts DESC LIMIT 20`),
      q(`SELECT count(*)::bigint total,
                count(*) FILTER (WHERE status='active')::bigint active,
                count(*) FILTER (WHERE status='revoked')::bigint revoked,
                count(*) FILTER (WHERE status='paused')::bigint paused,
                count(*) FILTER (WHERE expires_at IS NOT NULL AND expires_at < now())::bigint expired
         FROM licenses`)
    ]);
    const t = totals.rows[0]; const tin = Number(t.tin), tout = Number(t.tout);
    let totalCost = 0;
    const models = byModel.rows.map((r) => { const cost = costFor(r.model, Number(r.tin), Number(r.tout)); totalCost += cost; return { model: r.model, comments: Number(r.comments), tokensIn: Number(r.tin), tokensOut: Number(r.tout), cost }; });
    const L = lic.rows[0];
    res.json({
      ok: true, generatedAt: new Date().toISOString(),
      totals: { comments: Number(t.comments), tokensIn: tin, tokensOut: tout, tokensTotal: tin + tout, installs: Number(t.installs), countries: Number(t.countries), cost: totalCost },
      licenses: { total: Number(L.total), active: Number(L.active), revoked: Number(L.revoked), paused: Number(L.paused), expired: Number(L.expired) },
      today: { comments: Number(today.rows[0].comments), tokens: Number(today.rows[0].tokens) },
      byCountry: byCountry.rows.map((r) => ({ country: r.country, comments: Number(r.comments), tokens: Number(r.tokens) })),
      byModel: models,
      bySource: bySource.rows.map((r) => ({ source: r.source, comments: Number(r.comments) })),
      byButton: byButton.rows.map((r) => ({ button: r.button, comments: Number(r.comments) })),
      byOS: byOS.rows.map((r) => ({ os: r.os, comments: Number(r.comments) })),
      byBrowser: byBrowser.rows.map((r) => ({ browser: r.browser, comments: Number(r.comments) })),
      series: series.rows.map((r) => ({ day: r.day, comments: Number(r.comments), tokens: Number(r.tokens) })),
      recent: recent.rows.map((r) => ({ ts: r.ts, country: r.country, model: r.model, source: r.source, button: r.button, os: r.os, browser: r.browser, tokensIn: Number(r.tokens_in), tokensOut: Number(r.tokens_out) }))
    });
  } catch (e) { console.error("stats:", e.message); res.status(500).json({ ok: false, error: "server_error" }); }
});

/* ======================= TELEMETRY INGEST ======================= */
app.post("/api/v1/track", async (req, res) => {
  if (INGEST_KEY && req.get("x-ingest-key") !== INGEST_KEY) return res.status(401).json({ ok: false, error: "bad_ingest_key" });
  if (rateLimited(clientIp(req))) return res.status(429).json({ ok: false, error: "rate_limited" });
  const body = req.body || {};
  const clientId = clampStr(body.clientId, 64);
  const extVersion = clampStr(body.extVersion, 24);
  const os = clampStr(body.os, 24);
  const browser = clampStr(body.browser, 24);
  const events = Array.isArray(body.events) ? body.events.slice(0, 100) : [];
  if (!clientId || !events.length) return res.status(400).json({ ok: false, error: "empty" });
  let country = null;
  try { const g = geoip.lookup(clientIp(req)); if (g && g.country) country = g.country; } catch (_) {}
  const cols = ["client_id", "event_type", "source", "button", "model", "tokens_in", "tokens_out", "country", "os", "browser", "ext_version"];
  const values = []; const tuples = []; let i = 1;
  for (const ev of events) {
    if (!ev || typeof ev !== "object") continue;
    tuples.push(`($${i++},$${i++},$${i++},$${i++},$${i++},$${i++},$${i++},$${i++},$${i++},$${i++},$${i++})`);
    values.push(clientId, clampStr(ev.type, 40) || "comment_generated", clampStr(ev.source, 20), clampStr(ev.button, 20), clampStr(ev.model, 60), clampInt(ev.tokensIn), clampInt(ev.tokensOut), country, os, browser, extVersion);
  }
  if (!tuples.length) return res.status(400).json({ ok: false, error: "no_valid_events" });
  try { await q(`INSERT INTO events (${cols.join(",")}) VALUES ${tuples.join(",")}`, values); res.json({ ok: true, accepted: tuples.length }); }
  catch (e) { console.error("track:", e.message); res.status(500).json({ ok: false, error: "db_error" }); }
});

app.get("/healthz", (req, res) => res.json({ ok: true }));
app.get("/api/v1/config", (req, res) => res.json({ ok: true, dashboardKeyRequired: !!DASHBOARD_KEY }));
app.use(express.static(path.join(__dirname, "public")));

initSchema()
  .then(() => app.listen(PORT, () => console.log(`license backend listening on :${PORT}`)))
  .catch((e) => { console.error("schema init failed:", e.message); process.exit(1); });
