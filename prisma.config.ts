import "dotenv/config";
import { defineConfig } from "prisma/config";

/**
 * Prisma CLI configuration (Prisma 7+).
 *
 * - `prisma generate` (run on every install) needs no database, so a missing
 *   connection string must not fail installs or builds — e.g. on Vercel before
 *   a database is connected. Commands that do need one (migrate, studio, seed)
 *   still fail clearly without it.
 * - Migrations prefer a direct, non-pooled connection when one is provided:
 *   DIRECT_DATABASE_URL, or DATABASE_URL_UNPOOLED / POSTGRES_URL_NON_POOLING
 *   (names used by Vercel's Postgres integrations). Pooled connections
 *   (PgBouncer transaction mode) can break migrations. The app itself always
 *   uses DATABASE_URL.
 */
const url = process.env.DIRECT_DATABASE_URL || process.env.DATABASE_URL_UNPOOLED || process.env.POSTGRES_URL_NON_POOLING || process.env.DATABASE_URL;

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },
  ...(url ? { datasource: { url } } : {}),
});
