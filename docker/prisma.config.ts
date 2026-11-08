import "dotenv/config";
import { defineConfig } from "prisma/config";

// Minimal config for the migrator stage of the Docker image. Prefers a direct
// (non-pooled) connection for migrations when one is provided.
const url = process.env.DIRECT_DATABASE_URL || process.env.DATABASE_URL_UNPOOLED || process.env.POSTGRES_URL_NON_POOLING || process.env.DATABASE_URL;

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: { path: "prisma/migrations" },
  ...(url ? { datasource: { url } } : {}),
});
