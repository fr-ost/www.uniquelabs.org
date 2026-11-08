import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/generated/prisma/client";

/**
 * Single Prisma client per process. In development the instance is kept on
 * globalThis so hot reloads don't exhaust database connections.
 */
const globalForPrisma = globalThis as unknown as { __prisma?: PrismaClient };

function createPrismaClient() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL is not set. See .env.example.");
  }
  const adapter = new PrismaPg({
    connectionString,
    max: Number(process.env.DATABASE_POOL_SIZE ?? 10),
  });
  return new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });
}

function getClient(): PrismaClient {
  if (!globalForPrisma.__prisma) {
    globalForPrisma.__prisma = createPrismaClient();
  }
  return globalForPrisma.__prisma;
}

/**
 * Lazily-initialised client. Importing this module never opens a connection,
 * which keeps `next build` independent of database availability.
 */
export const prisma = new Proxy({} as PrismaClient, {
  get(_target, property) {
    const client = getClient();
    const value = Reflect.get(client, property, client);
    return typeof value === "function" ? value.bind(client) : value;
  },
});

export type { PrismaClient };
