/**
 * Reset an administrator's password from the server shell and sign out all of
 * their sessions. Also clears any login lockout.
 *
 *   npm run admin:reset-password -- --email you@example.com
 */
import { prisma } from "../src/lib/db.ts";
import { hashPassword, passwordProblem } from "../src/lib/auth/password.ts";
import { argValue, ask, askHidden } from "./cli-utils.ts";

async function main() {
  const email = (argValue("email") ?? (await ask("Admin email: "))).toLowerCase();
  const user = await prisma.adminUser.findUnique({ where: { email } });
  if (!user) throw new Error("No admin account with that email.");

  const password = await askHidden("New password (min 12 chars): ");
  const confirm = await askHidden("Confirm new password: ");
  if (password !== confirm) throw new Error("Passwords don't match.");
  const problem = passwordProblem(password, [user.name, email.split("@")[0] ?? ""]);
  if (problem) throw new Error(problem);

  await prisma.$transaction([
    prisma.adminUser.update({
      where: { id: user.id },
      data: { passwordHash: await hashPassword(password), passwordChangedAt: new Date(), failedLoginCount: 0, lockedUntil: null, isActive: true },
    }),
    prisma.adminSession.deleteMany({ where: { userId: user.id } }),
    prisma.auditLog.create({
      data: { actorLabel: "cli", action: "auth.password_reset", entityType: "AdminUser", entityId: user.id, summary: `Reset password for ${email} from the CLI` },
    }),
  ]);
  console.log(`\n✔ Password reset for ${email}. All existing sessions were signed out.`);
}

main()
  .catch((error) => {
    console.error(`\n✖ ${error instanceof Error ? error.message : String(error)}`);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
