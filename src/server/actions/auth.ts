"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { audit } from "@/lib/audit";
import { hashPassword, passwordProblem, verifyPassword } from "@/lib/auth/password";
import { createSession, destroyAllSessionsForUser, destroyCurrentSession, getSession } from "@/lib/auth/session";
import { requireAdmin } from "@/lib/auth/guards";
import { env } from "@/lib/env";
import { consumeRateLimit, resetRateLimit } from "@/lib/rate-limit";
import { clientIpFromHeaders, hashIp, randomToken, safeEqual } from "@/lib/security";
import type { ActionResult } from "@/lib/validation/fields";

// A real Argon2id hash of a random value, computed once per process, used to
// equalise timing when an account does not exist (prevents user enumeration).
let dummyHash: Promise<string> | null = null;
function getDummyHash() {
  dummyHash ??= hashPassword(randomToken(24));
  return dummyHash;
}

const loginSchema = z.object({
  email: z.string().trim().toLowerCase().max(254).pipe(z.email("Enter your email address.")),
  password: z.string().min(1, "Enter your password.").max(256),
  next: z.string().optional(),
});

function safeNext(next: string | undefined): string {
  if (next && /^\/admin(\/[A-Za-z0-9/_?=&.-]*)?$/.test(next) && !next.startsWith("//")) return next;
  return "/admin";
}

async function requestIpHash() {
  return hashIp(clientIpFromHeaders(await headers()));
}

export async function loginAction(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
    next: formData.get("next") ?? undefined,
  });
  const echo = { email: String(formData.get("email") ?? "").slice(0, 254) };
  if (!parsed.success) {
    return { ok: false, message: "Enter your email address and password.", values: echo };
  }
  const { email, password, next } = parsed.data;
  const ipHash = await requestIpHash();

  const [ipLimit, accountLimit] = await Promise.all([
    consumeRateLimit(`login:ip:${ipHash}`, 10, 15 * 60),
    consumeRateLimit(`login:acct:${hashIp(email)}`, 6, 15 * 60),
  ]);
  if (!ipLimit.allowed || !accountLimit.allowed) {
    const minutes = Math.ceil(Math.max(ipLimit.retryAfterSeconds, accountLimit.retryAfterSeconds) / 60);
    await audit({ actor: { label: email }, action: "auth.rate_limited", summary: "Login rate limit reached", ipHash });
    return { ok: false, message: `Too many sign-in attempts. Try again in about ${minutes} minute${minutes === 1 ? "" : "s"}.`, values: echo };
  }

  const user = await prisma.adminUser.findUnique({ where: { email } });
  if (!user || !user.isActive) {
    await verifyPassword(await getDummyHash(), password);
    await audit({ actor: { label: email }, action: "auth.login_failed", summary: "Failed sign-in (unknown or inactive account)", ipHash });
    return { ok: false, message: "Incorrect email or password.", values: echo };
  }

  if (user.lockedUntil && user.lockedUntil.getTime() > Date.now()) {
    await verifyPassword(await getDummyHash(), password);
    return { ok: false, message: "Too many sign-in attempts. Try again later.", values: echo };
  }

  const valid = await verifyPassword(user.passwordHash, password);
  if (!valid) {
    const failures = user.failedLoginCount + 1;
    // Progressive lockout: 5 failures → 15 min, doubling up to 24 h.
    const lockMinutes = failures >= 5 ? Math.min(15 * 2 ** (failures - 5), 24 * 60) : 0;
    await prisma.adminUser.update({
      where: { id: user.id },
      data: {
        failedLoginCount: failures,
        lockedUntil: lockMinutes ? new Date(Date.now() + lockMinutes * 60 * 1000) : null,
      },
    });
    await audit({
      actor: { id: user.id, label: user.email },
      action: "auth.login_failed",
      summary: lockMinutes ? `Failed sign-in; account locked for ${lockMinutes} minutes` : "Failed sign-in",
      ipHash,
    });
    return { ok: false, message: "Incorrect email or password.", values: echo };
  }

  await prisma.adminUser.update({
    where: { id: user.id },
    data: { failedLoginCount: 0, lockedUntil: null, lastLoginAt: new Date() },
  });
  await resetRateLimit(`login:acct:${hashIp(email)}`);
  await createSession(user.id);
  await audit({ actor: { id: user.id, label: user.email }, action: "auth.login", summary: "Signed in", ipHash });
  redirect(safeNext(next));
}

export async function logoutAction(): Promise<void> {
  const session = await getSession();
  await destroyCurrentSession();
  if (session) {
    await audit({ actor: { id: session.user.id, label: session.user.email }, action: "auth.logout", summary: "Signed out" });
  }
  redirect("/admin/login");
}

const setupSchema = z
  .object({
    token: z.string().min(1, "Enter the setup token."),
    name: z.string().trim().min(2, "Enter your name.").max(120),
    email: z.string().trim().toLowerCase().max(254).pipe(z.email("Enter a valid email address.")),
    password: z.string().max(256),
    confirm: z.string().max(256),
  })
  .refine((data) => data.password === data.confirm, { path: ["confirm"], message: "Passwords don't match." });

/** First-run owner account creation, gated by ADMIN_SETUP_TOKEN. */
export async function setupAction(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  const configured = env().ADMIN_SETUP_TOKEN;
  if (!configured) return { ok: false, message: "Setup is disabled. Set ADMIN_SETUP_TOKEN or use `npm run admin:create`." };

  const ipHash = await requestIpHash();
  const limit = await consumeRateLimit(`setup:ip:${ipHash}`, 8, 60 * 60);
  if (!limit.allowed) return { ok: false, message: "Too many attempts. Try again later." };

  const parsed = setupSchema.safeParse(Object.fromEntries(formData));
  const echo = { name: String(formData.get("name") ?? "").slice(0, 120), email: String(formData.get("email") ?? "").slice(0, 254) };
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) fieldErrors[String(issue.path[0])] ??= issue.message;
    return { ok: false, message: "Please fix the highlighted fields.", fieldErrors, values: echo };
  }
  const { token, name, email, password } = parsed.data;
  if (!safeEqual(token, configured)) {
    await audit({ actor: { label: email }, action: "auth.setup_failed", summary: "Invalid setup token", ipHash });
    return { ok: false, message: "The setup token is incorrect.", fieldErrors: { token: "Incorrect token." }, values: echo };
  }
  const problem = passwordProblem(password, [name, email.split("@")[0] ?? ""]);
  if (problem) return { ok: false, message: problem, fieldErrors: { password: problem }, values: echo };

  const passwordHash = await hashPassword(password);
  let userId: string | null = null;
  // Serialise concurrent setups and re-check inside the transaction.
  await prisma.$transaction(async (tx) => {
    await tx.$executeRaw`SELECT pg_advisory_xact_lock(424242)`;
    if ((await tx.adminUser.count()) > 0) return;
    const user = await tx.adminUser.create({ data: { name, email, passwordHash, role: "OWNER" } });
    userId = user.id;
  });
  if (!userId) return { ok: false, message: "An administrator already exists. Please sign in." };

  await createSession(userId);
  await audit({ actor: { id: userId, label: email }, action: "auth.setup", summary: "Created the first owner account", ipHash });
  redirect("/admin?welcome=1");
}

const passwordChangeSchema = z
  .object({
    current: z.string().min(1, "Enter your current password.").max(256),
    password: z.string().max(256),
    confirm: z.string().max(256),
  })
  .refine((data) => data.password === data.confirm, { path: ["confirm"], message: "Passwords don't match." });

export async function changePasswordAction(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  const session = await requireAdmin();
  const parsed = passwordChangeSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) fieldErrors[String(issue.path[0])] ??= issue.message;
    return { ok: false, message: "Please fix the highlighted fields.", fieldErrors };
  }
  const user = await prisma.adminUser.findUniqueOrThrow({ where: { id: session.user.id } });
  if (!(await verifyPassword(user.passwordHash, parsed.data.current))) {
    return { ok: false, message: "Your current password is incorrect.", fieldErrors: { current: "Incorrect password." } };
  }
  const problem = passwordProblem(parsed.data.password, [user.name, user.email.split("@")[0] ?? ""]);
  if (problem) return { ok: false, message: problem, fieldErrors: { password: problem } };

  await prisma.adminUser.update({
    where: { id: user.id },
    data: { passwordHash: await hashPassword(parsed.data.password), passwordChangedAt: new Date() },
  });
  // Sign out every other session; keep this one by issuing a fresh session.
  await destroyAllSessionsForUser(user.id);
  await createSession(user.id);
  await audit({ actor: { id: user.id, label: user.email }, action: "auth.password_changed", summary: "Changed password and signed out other sessions" });
  return { ok: true, message: "Password updated. Other sessions were signed out." };
}

export async function revokeSessionAction(sessionId: string): Promise<void> {
  const session = await requireAdmin();
  await prisma.adminSession.deleteMany({ where: { id: sessionId, userId: session.user.id } });
  await audit({ actor: { id: session.user.id, label: session.user.email }, action: "auth.session_revoked", summary: "Revoked a session" });
}
