import { describe, expect, it } from "vitest";
import { prisma } from "@/lib/db";
import { hashPassword, passwordProblem, verifyPassword } from "@/lib/auth/password";
import { createSession, destroyCurrentSession, getSession, sessionCookieName } from "@/lib/auth/session";
import { consumeRateLimit } from "@/lib/rate-limit";
import { signValue } from "@/lib/security";
import { submitContactMessage } from "@/server/actions/contact";
import { requestState } from "./setup";

function contactForm(overrides: Record<string, string> = {}) {
  const form = new FormData();
  const values = {
    name: "Ada Lovelace",
    email: "ada@example.com",
    inquiryType: "PARTNERSHIP",
    subject: "Working together",
    message: "Hello! I'd love to talk about a possible partnership with your team.",
    company_website: "",
    form_token: signValue(String(Date.now() - 10_000), "contact-form"),
    ...overrides,
  };
  for (const [key, value] of Object.entries(values)) form.set(key, value);
  return form;
}

describe("contact form", () => {
  it("stores a valid message", async () => {
    const result = await submitContactMessage({ status: "idle" }, contactForm());
    expect(result.status).toBe("success");
    const saved = await prisma.contactMessage.findFirstOrThrow();
    expect(saved).toMatchObject({ email: "ada@example.com", inquiryType: "PARTNERSHIP", status: "NEW" });
  });

  it("validates fields server-side", async () => {
    const result = await submitContactMessage({ status: "idle" }, contactForm({ email: "not-an-email", message: "short" }));
    expect(result.status).toBe("error");
    if (result.status === "error") {
      expect(result.fieldErrors?.email).toBeTruthy();
      expect(result.fieldErrors?.message).toBeTruthy();
      expect(result.values?.name).toBe("Ada Lovelace");
    }
    expect(await prisma.contactMessage.count()).toBe(0);
  });

  it("silently drops honeypot submissions", async () => {
    const result = await submitContactMessage({ status: "idle" }, contactForm({ company_website: "https://spam.example" }));
    expect(result.status).toBe("success");
    expect(await prisma.contactMessage.count()).toBe(0);
  });

  it("rejects instant, forged or expired form tokens", async () => {
    expect((await submitContactMessage({ status: "idle" }, contactForm({ form_token: signValue(String(Date.now()), "contact-form") }))).status).toBe("error");
    expect((await submitContactMessage({ status: "idle" }, contactForm({ form_token: `${Date.now() - 10_000}.forged` }))).status).toBe("error");
    expect((await submitContactMessage({ status: "idle" }, contactForm({ form_token: signValue(String(Date.now() - 1000 * 60 * 60 * 24), "contact-form") }))).status).toBe("error");
    expect(await prisma.contactMessage.count()).toBe(0);
  });

  it("rate limits repeated submissions from one address", async () => {
    for (let i = 0; i < 5; i += 1) {
      const ok = await submitContactMessage({ status: "idle" }, contactForm({ email: `person${i}@example.com` }));
      expect(ok.status).toBe("success");
    }
    const blocked = await submitContactMessage({ status: "idle" }, contactForm({ email: "another@example.com" }));
    expect(blocked.status).toBe("error");
    // A different client is unaffected.
    requestState.headers = new Headers({ "x-forwarded-for": "198.51.100.7" });
    expect((await submitContactMessage({ status: "idle" }, contactForm({ email: "fresh@example.com" }))).status).toBe("success");
  });

  it("files suspected spam separately instead of discarding it", async () => {
    await submitContactMessage(
      { status: "idle" },
      contactForm({ message: "Cheap SEO services and backlinks! https://a.example https://b.example https://c.example https://d.example" }),
    );
    expect((await prisma.contactMessage.findFirstOrThrow()).status).toBe("SPAM");
  });

  it("never stores raw IP addresses", async () => {
    await submitContactMessage({ status: "idle" }, contactForm());
    const buckets = await prisma.rateLimitBucket.findMany();
    expect(buckets.length).toBeGreaterThan(0);
    expect(buckets.some((b) => b.key.includes("203.0.113.10"))).toBe(false);
  });
});

describe("authentication", () => {
  it("hashes passwords with Argon2id", async () => {
    const hash = await hashPassword("correct horse battery staple");
    expect(hash.startsWith("$argon2id$")).toBe(true);
    expect(await verifyPassword(hash, "correct horse battery staple")).toBe(true);
    expect(await verifyPassword(hash, "wrong password here")).toBe(false);
    expect(await verifyPassword("not-a-hash", "anything")).toBe(false);
  });

  it("enforces a password policy", () => {
    expect(passwordProblem("short")).toMatch(/12/);
    expect(passwordProblem("password1234")).toMatch(/common/);
    expect(passwordProblem("aaaaaaaaaaaaaaaa")).toBeTruthy();
    expect(passwordProblem("ada.lovelace.2025!", ["Ada Lovelace", "ada.lovelace"])).toMatch(/name|email/);
    expect(passwordProblem("Grey-Otter-Canyon-91")).toBeNull();
  });

  it("creates server-verified sessions stored only as hashes", async () => {
    const user = await prisma.adminUser.create({ data: { email: "o@example.com", name: "Owner", passwordHash: await hashPassword("Grey-Otter-Canyon-91"), role: "OWNER" } });
    await createSession(user.id);
    const token = requestState.cookies.get(sessionCookieName())!;
    expect(token.length).toBeGreaterThan(30);
    const stored = await prisma.adminSession.findFirstOrThrow();
    expect(stored.tokenHash).not.toBe(token);
    expect(stored.ipHash).not.toContain("203.0.113.10");

    const session = await getSession();
    expect(session?.user.email).toBe("o@example.com");

    await destroyCurrentSession();
    expect(await prisma.adminSession.count()).toBe(0);
  });

  it("rejects expired sessions, deactivated users and tampered tokens", async () => {
    const user = await prisma.adminUser.create({ data: { email: "e@example.com", name: "Editor", passwordHash: "x" } });
    await createSession(user.id);
    await prisma.adminSession.updateMany({ data: { expiresAt: new Date(Date.now() - 1000) } });
    expect(await getSession()).toBeNull();

    await createSession(user.id);
    await prisma.adminUser.update({ where: { id: user.id }, data: { isActive: false } });
    expect(await getSession()).toBeNull();

    requestState.cookies.set(sessionCookieName(), "tampered-token-value-that-does-not-exist-anywhere");
    expect(await getSession()).toBeNull();
  });

  it("rate limits with database-backed counters", async () => {
    const results = [];
    for (let i = 0; i < 4; i += 1) results.push(await consumeRateLimit("test:key", 3, 60));
    expect(results.map((r) => r.allowed)).toEqual([true, true, true, false]);
    expect(results[3]!.retryAfterSeconds).toBeGreaterThan(0);
  });
});
