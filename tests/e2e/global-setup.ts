import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { hash } from "@node-rs/argon2";
import { PrismaClient } from "../../src/generated/prisma/client.ts";

export const E2E_ADMIN = { email: "e2e-admin@uniquelabs.test", password: "E2E-Test-Pass-7351!", name: "E2E Admin" };

/** Ensures a known admin account exists and clears rate-limit counters. */
export default async function globalSetup() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL must be set for e2e tests (use a development or CI database).");
  const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: url }) });
  try {
    const passwordHash = await hash(E2E_ADMIN.password.normalize("NFKC"), { memoryCost: 19456, timeCost: 2, parallelism: 1, outputLen: 32 });
    await prisma.adminUser.upsert({
      where: { email: E2E_ADMIN.email },
      update: { passwordHash, isActive: true, failedLoginCount: 0, lockedUntil: null },
      create: { email: E2E_ADMIN.email, name: E2E_ADMIN.name, passwordHash, role: "OWNER" },
    });
    await prisma.rateLimitBucket.deleteMany({});
  } finally {
    await prisma.$disconnect();
  }
}
