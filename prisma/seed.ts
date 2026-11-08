/**
 * Baseline seed — safe to run in every environment, any number of times.
 * The same logic also runs automatically when the server starts.
 * See src/lib/content/bootstrap.ts for exactly what is (and isn't) created.
 */
import { prisma } from "../src/lib/db.ts";
import { ensureBaselineContent } from "../src/lib/content/bootstrap.ts";

async function main() {
  const log = await ensureBaselineContent();
  console.log(log.length > 0 ? log.map((line) => `• ${line}`).join("\n") : "• Baseline content already present — nothing changed.");
  if ((await prisma.adminUser.count()) === 0) {
    console.log(
      "\nNo admin account exists yet. Create the first one with `npm run admin:create`,\n" +
        "or set ADMIN_SETUP_TOKEN and open /admin/setup. See docs/ADMIN.md.",
    );
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
