/**
 * Create an administrator account from the server/deployment shell.
 *
 *   npm run admin:create
 *   npm run admin:create -- --email you@example.com --name "Your Name" --role OWNER
 *
 * The password is always prompted (hidden) — never passed as an argument, so
 * it doesn't end up in shell history. For automated provisioning you may set
 * ADMIN_INITIAL_PASSWORD for a single run; unset it afterwards.
 * The first account is always created as OWNER.
 */
import { prisma } from "../src/lib/db.ts";
import { hashPassword, passwordProblem } from "../src/lib/auth/password.ts";
import { argValue, ask, askHidden } from "./cli-utils.ts";

async function main() {
  const existing = await prisma.adminUser.count();
  const email = (argValue("email") ?? (await ask("Email: "))).toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error("Please provide a valid email address.");
  if (await prisma.adminUser.findUnique({ where: { email } })) throw new Error("An admin with this email already exists.");

  const name = argValue("name") ?? (await ask("Full name: "));
  if (name.length < 2) throw new Error("Please provide a name.");

  const requestedRole = (argValue("role") ?? (existing === 0 ? "OWNER" : "EDITOR")).toUpperCase();
  const role = existing === 0 ? "OWNER" : requestedRole === "OWNER" ? "OWNER" : "EDITOR";

  let password = process.env.ADMIN_INITIAL_PASSWORD ?? "";
  if (password) {
    console.log("Using ADMIN_INITIAL_PASSWORD from the environment. Remove it after this run.");
  } else {
    password = await askHidden("Password (min 12 chars): ");
    const confirm = await askHidden("Confirm password: ");
    if (password !== confirm) throw new Error("Passwords don't match.");
  }
  const problem = passwordProblem(password, [name, email.split("@")[0] ?? ""]);
  if (problem) throw new Error(problem);

  const user = await prisma.adminUser.create({
    data: { email, name, role, passwordHash: await hashPassword(password) },
  });
  await prisma.auditLog.create({
    data: { actorLabel: "cli", action: "admin.create", entityType: "AdminUser", entityId: user.id, summary: `Created ${role.toLowerCase()} account ${email} from the CLI` },
  });
  console.log(`\n✔ Created ${role} account for ${email}. Sign in at /admin/login.`);
}

main()
  .catch((error) => {
    console.error(`\n✖ ${error instanceof Error ? error.message : String(error)}`);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
