#!/usr/bin/env node
/**
 * Build entry point on Vercel (`npm run vercel-build` takes precedence over
 * `build` there).
 *
 * 1. Production deployments: checks the required settings, then applies
 *    pending database migrations so the schema always matches the code.
 *    Preview deployments skip migrations unless RUN_MIGRATIONS=true (so a
 *    preview branch can't change the production database by accident).
 * 2. Builds the Next.js app.
 */
import { spawnSync } from "node:child_process";

function run(command, args) {
  const result = spawnSync(command, args, { stdio: "inherit", env: process.env });
  if (result.status !== 0) process.exit(result.status ?? 1);
}

function fail(message) {
  console.error(`\n[vercel-build] ${message}\n`);
  process.exit(1);
}

const vercelEnv = process.env.VERCEL_ENV ?? "development";
const migrate = process.env.RUN_MIGRATIONS ? process.env.RUN_MIGRATIONS === "true" : vercelEnv === "production";
const databaseUrl = process.env.DIRECT_DATABASE_URL || process.env.DATABASE_URL_UNPOOLED || process.env.POSTGRES_URL_NON_POOLING || process.env.DATABASE_URL;

if (vercelEnv === "production") {
  if (!process.env.DATABASE_URL) {
    fail(
      "DATABASE_URL is not set. Connect a PostgreSQL database (Vercel → Storage → Neon, or any PostgreSQL provider) " +
        "or add DATABASE_URL under Settings → Environment Variables, then redeploy. See docs/DEPLOYMENT.md (Vercel).",
    );
  }
  const secret = process.env.APP_SECRET ?? "";
  if (secret.length < 32 || /change-me|dev-only|example/i.test(secret)) {
    fail(
      "APP_SECRET must be set to at least 32 random characters (Settings → Environment Variables). Generate one with:\n" +
        "  node -e \"console.log(require('crypto').randomBytes(48).toString('base64url'))\"",
    );
  }
}

if (migrate) {
  if (!databaseUrl) fail("RUN_MIGRATIONS is enabled but no DATABASE_URL is set.");
  console.log(`[vercel-build] Applying database migrations (${vercelEnv})…`);
  run("npx", ["prisma", "migrate", "deploy"]);
} else {
  console.log(`[vercel-build] Skipping database migrations for the "${vercelEnv}" environment (set RUN_MIGRATIONS=true to apply them).`);
}

run("npx", ["next", "build"]);
