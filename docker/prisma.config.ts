import "dotenv/config";
import { defineConfig, env } from "prisma/config";

// Minimal config for the migrator stage of the Docker image.
export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: { path: "prisma/migrations" },
  datasource: { url: env("DATABASE_URL") },
});
