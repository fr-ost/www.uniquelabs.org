import { afterEach, describe, expect, it } from "vitest";
import { prisma } from "@/lib/db";
import { loadCollaborations, loadProduct, loadProducts, loadTeam } from "@/lib/content/queries";

async function product(overrides: Record<string, unknown> = {}) {
  return prisma.product.create({
    data: { name: "Test", slug: `test-${Math.random().toString(36).slice(2, 8)}`, summary: "A test product", ...overrides },
  });
}

describe("publication rules", () => {
  const originalEnv = process.env.NODE_ENV;
  afterEach(() => {
    (process.env as Record<string, string | undefined>).NODE_ENV = originalEnv;
  });

  it("the database refuses to publish an unverified product", async () => {
    await expect(product({ status: "PUBLISHED", verifiedAt: null })).rejects.toThrow();
    await expect(
      prisma.collaboration.create({ data: { title: "C", slug: "c", summary: "s", status: "PUBLISHED" } }),
    ).rejects.toThrow();
    await expect(
      prisma.companyMilestone.create({ data: { title: "M", slug: "m", date: new Date(), status: "PUBLISHED" } }),
    ).rejects.toThrow();
  });

  it("only published, verified products are public", async () => {
    await product({ slug: "draft", status: "DRAFT" });
    await product({ slug: "verified-draft", status: "DRAFT", verifiedAt: new Date() });
    await product({ slug: "archived", status: "ARCHIVED", verifiedAt: new Date() });
    await product({ slug: "live", status: "PUBLISHED", verifiedAt: new Date() });
    const slugs = (await loadProducts()).map((p) => p.slug);
    expect(slugs).toEqual(["live"]);
    expect(await loadProduct("draft")).toBeNull();
    expect(await loadProduct("live")).not.toBeNull();
  });

  it("drafts are only visible through admin preview", async () => {
    await product({ slug: "secret", status: "DRAFT" });
    expect(await loadProduct("secret", false)).toBeNull();
    expect((await loadProduct("secret", true))?.slug).toBe("secret");
  });

  it("placeholder content never appears on a production deployment", async () => {
    await product({ slug: "sample", status: "PUBLISHED", verifiedAt: new Date(), isPlaceholder: true });
    await product({ slug: "real", status: "PUBLISHED", verifiedAt: new Date() });
    (process.env as Record<string, string>).NODE_ENV = "production";
    expect((await loadProducts()).map((p) => p.slug)).toEqual(["real"]);
    (process.env as Record<string, string>).NODE_ENV = "development";
    expect((await loadProducts()).map((p) => p.slug).sort()).toEqual(["real", "sample"]);
  });

  it("public DTOs never include private provenance", async () => {
    const created = await product({ slug: "with-evidence", status: "PUBLISHED", verifiedAt: new Date() });
    await prisma.sourceEvidence.create({
      data: { sourceType: "CLAUDE_CONVERSATION", sourceId: "conv-1", excerpt: "private chat excerpt", productId: created.id },
    });
    const dto = await loadProduct("with-evidence");
    const serialised = JSON.stringify(dto);
    expect(serialised).not.toContain("private chat excerpt");
    expect(serialised).not.toContain("verifiedAt");
    expect(dto && "evidence" in dto).toBe(false);
  });

  it("unverified collaborations and draft team members stay private", async () => {
    await prisma.collaboration.create({ data: { title: "Draft collab", slug: "draft-collab", summary: "s" } });
    await prisma.teamMember.create({ data: { name: "Hidden Person", slug: "hidden", position: "Role", status: "DRAFT" } });
    expect(await loadCollaborations()).toEqual([]);
    const team = await loadTeam();
    expect(team.leadership.length + team.groups.length + team.former.length).toBe(0);
  });
});
