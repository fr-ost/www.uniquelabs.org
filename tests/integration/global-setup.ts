import { execSync } from "node:child_process";

/**
 * Applies all migrations to the dedicated test database (non-destructive:
 * `migrate deploy` only applies pending migrations). Tables are emptied
 * between tests by setup.ts. Never point TEST_DATABASE_URL at real data.
 */
export default function setup() {
  const url = process.env.TEST_DATABASE_URL ?? "postgresql://uniquelabs:uniquelabs@localhost:5432/uniquelabs_test?schema=public";
  if (!/test/i.test(url)) {
    throw new Error("Refusing to use a database whose URL does not contain 'test'. Set TEST_DATABASE_URL.");
  }
  execSync("npx prisma migrate deploy", {
    stdio: "pipe",
    env: { ...process.env, DATABASE_URL: url },
  });
}
