import { afterAll, beforeEach, vi } from "vitest";

process.env.DATABASE_URL =
  process.env.TEST_DATABASE_URL ?? "postgresql://uniquelabs:uniquelabs@localhost:5432/uniquelabs_test?schema=public";
process.env.APP_SECRET = "integration-test-secret-0123456789abcdefghijklmnop";
process.env.SITE_URL = "http://localhost:3000";
process.env.MEDIA_STORAGE = "database";

/** In-memory stand-ins for Next.js request APIs used by server code. */
export const requestState = {
  cookies: new Map<string, string>(),
  headers: new Headers({ "x-forwarded-for": "203.0.113.10", "user-agent": "vitest" }),
};

vi.mock("next/headers", () => ({
  headers: async () => requestState.headers,
  cookies: async () => ({
    get: (name: string) => (requestState.cookies.has(name) ? { name, value: requestState.cookies.get(name)! } : undefined),
    set: (name: string, value: string) => {
      if (value) requestState.cookies.set(name, value);
      else requestState.cookies.delete(name);
    },
    delete: (name: string) => requestState.cookies.delete(name),
    has: (name: string) => requestState.cookies.has(name),
  }),
  draftMode: async () => ({ isEnabled: false, enable: () => undefined, disable: () => undefined }),
}));

vi.mock("next/cache", () => ({
  updateTag: () => undefined,
  revalidateTag: () => undefined,
  revalidatePath: () => undefined,
  unstable_cache: <T,>(fn: T) => fn,
}));

export class RedirectSignal extends Error {
  constructor(public url: string) {
    super(`redirect:${url}`);
  }
}

vi.mock("next/navigation", () => ({
  redirect: (url: string) => {
    throw new RedirectSignal(url);
  },
  notFound: () => {
    throw new Error("notFound");
  },
}));

const TABLES = [
  "SourceEvidence",
  "ImportCandidate",
  "ImportJob",
  "AuditLog",
  "AdminSession",
  "AdminUser",
  "RateLimitBucket",
  "ContactMessage",
  "ProductFeature",
  "ProductImage",
  "ProductLink",
  "CollaborationPartner",
  "_CapabilityToProduct",
  "_CollaborationToProduct",
  "CompanyMilestone",
  "Product",
  "Collaboration",
  "Partner",
  "Category",
  "TeamMember",
  "TeamGroup",
  "Capability",
  "Principle",
  "SocialLink",
  "MediaBlob",
  "MediaAsset",
  "CompanyProfile",
  "SiteSettings",
];

beforeEach(async () => {
  if (!/test/i.test(process.env.DATABASE_URL ?? "")) throw new Error("Integration tests must run against a test database.");
  const { prisma } = await import("@/lib/db");
  await prisma.$executeRawUnsafe(`TRUNCATE ${TABLES.map((t) => `"${t}"`).join(", ")} RESTART IDENTITY CASCADE`);
  requestState.cookies.clear();
  requestState.headers = new Headers({ "x-forwarded-for": "203.0.113.10", "user-agent": "vitest" });
});

afterAll(async () => {
  const { prisma } = await import("@/lib/db");
  await prisma.$disconnect();
});
