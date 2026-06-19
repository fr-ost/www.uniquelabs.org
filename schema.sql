-- =========================================================================
-- AI Comment Generator for X - License Backend schema
-- The server runs all of this automatically on boot. Reference only.
-- No OpenAI key and no personal accounts live here.
-- =========================================================================

-- ---- Licenses (you control every field live from the dashboard) ----
CREATE TABLE IF NOT EXISTS licenses (
  key          TEXT PRIMARY KEY,                -- e.g. XCG-AB12-CD34-EF56-7890
  status       TEXT NOT NULL DEFAULT 'active',  -- active | paused | revoked
  label        TEXT,                            -- admin note (customer name etc.)
  daily_limit  INTEGER NOT NULL DEFAULT 50,     -- replies/day per key (-1 = unlimited)
  device_limit INTEGER NOT NULL DEFAULT 1,      -- max bound devices
  model        TEXT,                            -- optional per-key model (FORCE_MODEL still wins)
  expires_at   TIMESTAMPTZ,                     -- NULL = never expires
  usage_date   DATE,
  usage_count  INTEGER NOT NULL DEFAULT 0,
  tokens_in    BIGINT NOT NULL DEFAULT 0,
  tokens_out   BIGINT NOT NULL DEFAULT 0,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_seen_at TIMESTAMPTZ
);

-- ---- Devices bound to each key ----
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

-- ---- Global controls (single row) ----
CREATE TABLE IF NOT EXISTS app_config (
  id INTEGER PRIMARY KEY DEFAULT 1,
  killed BOOLEAN NOT NULL DEFAULT false,        -- pause EVERY key at once
  maintenance BOOLEAN NOT NULL DEFAULT false,
  maintenance_msg TEXT,
  announce TEXT, announce_link TEXT,            -- scrolling banner in the panel
  min_version TEXT, update_msg TEXT, update_link TEXT
);
INSERT INTO app_config (id) VALUES (1) ON CONFLICT (id) DO NOTHING;

-- ---- Anonymous telemetry (unchanged) ----
CREATE TABLE IF NOT EXISTS events (
  id BIGSERIAL PRIMARY KEY, client_id TEXT NOT NULL, ts TIMESTAMPTZ NOT NULL DEFAULT now(),
  event_type TEXT NOT NULL, source TEXT, button TEXT, model TEXT,
  tokens_in INTEGER NOT NULL DEFAULT 0, tokens_out INTEGER NOT NULL DEFAULT 0,
  country TEXT, os TEXT, browser TEXT, ext_version TEXT
);
CREATE INDEX IF NOT EXISTS events_ts_idx ON events (ts);
