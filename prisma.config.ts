import "dotenv/config";
import { defineConfig, env } from "prisma/config";

/**
 * Prisma CLI configuration (Prisma 7+).
 * The connection string is read from DATABASE_URL (see .env.example).
 */
export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },
  datasource: {
    url: env("DATABASE_URL"),
  },
});
