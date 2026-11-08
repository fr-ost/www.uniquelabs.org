import { describe, expect, it } from "vitest";
import { prisma } from "@/lib/db";
import { hashPassword } from "@/lib/auth/password";
import { createSession } from "@/lib/auth/session";
import { approveCollaborationCandidate, approveProductCandidate, mergeCandidates, rejectCandidate } from "@/server/actions/candidates";
import { saveProduct } from "@/server/actions/products";
import { RedirectSignal } from "./setup";

async function signIn() {
  const user = await prisma.adminUser.create({
    data: { email: "owner@example.com", name: "Owner", role: "OWNER", passwordHash: await hashPassword("Grey-Otter-Canyon-91") },
  });
  await createSession(user.id);
  return user;
}

async function candidate(kind: "PRODUCT" | "COLLABORATION", title: string, sourceIds: string[]) {
  return prisma.importCandidate.create({
    data: {
      kind,
      fingerprint: `fp-${title}`,
      title,
      confidence: 70,
      productStage: kind === "PRODUCT" ? "PUBLISHED" : null,
      collaborationCategory: kind === "COLLABORATION" ? "BRAND_PARTNERSHIP" : null,
      evidence: {
        create: sourceIds.map((sourceId) => ({ sourceType: kind === "PRODUCT" ? "CLAUDE_CONVERSATION" : "TWEET", sourceId, excerpt: `excerpt ${sourceId}` })),
      },
    },
  });
}

async function expectRedirect(promise: Promise<unknown>): Promise<string> {
  try {
    await promise;
  } catch (error) {
    if (error instanceof RedirectSignal) return error.url;
    throw error;
  }
  throw new Error("Expected a redirect");
}

function form(values: Record<string, string | string[]>) {
  const data = new FormData();
  for (const [key, value] of Object.entries(values)) {
    for (const v of Array.isArray(value) ? value : [value]) data.append(key, v);
  }
  return data;
}

describe("candidate review", () => {
  it("requires an authenticated admin", async () => {
    const c = await candidate("PRODUCT", "Unauthed", ["s1"]);
    const url = await expectRedirect(approveProductCandidate(c.id, { ok: false }, form({ name: "X", summary: "Y", stage: "AVAILABLE" })));
    expect(url).toBe("/admin/login");
    expect((await prisma.importCandidate.findUniqueOrThrow({ where: { id: c.id } })).status).toBe("PENDING");
  });

  it("approving creates a private draft and moves provenance to the product", async () => {
    await signIn();
    const c = await candidate("PRODUCT", "TabNest", ["conv-1", "conv-2"]);
    const url = await expectRedirect(
      approveProductCandidate(c.id, { ok: false }, form({ name: "TabNest", summary: "Tab sessions", stage: "AVAILABLE", platforms: ["CHROME_EXTENSION"], verified: "on" })),
    );
    const product = await prisma.product.findFirstOrThrow({ where: { name: "TabNest" }, include: { evidence: true } });
    expect(url).toBe(`/admin/products/${product.id}?created=1`);
    expect(product.status).toBe("DRAFT");
    expect(product.verifiedAt).not.toBeNull();
    expect(product.evidence.map((e) => e.sourceId).sort()).toEqual(["conv-1", "conv-2"]);
    const updated = await prisma.importCandidate.findUniqueOrThrow({ where: { id: c.id } });
    expect(updated).toMatchObject({ status: "APPROVED", productId: product.id, verification: "VERIFIED" });
    expect(await prisma.auditLog.count({ where: { action: "candidate.approve" } })).toBe(1);
  });

  it("an approved but unverified product cannot be published", async () => {
    await signIn();
    const c = await candidate("PRODUCT", "Unverified", ["conv-9"]);
    await expectRedirect(approveProductCandidate(c.id, { ok: false }, form({ name: "Unverified", summary: "S", stage: "AVAILABLE" })));
    const product = await prisma.product.findFirstOrThrow({ where: { name: "Unverified" } });
    expect(product.verifiedAt).toBeNull();
    const result = await saveProduct(
      product.id,
      { ok: false },
      form({ name: "Unverified", summary: "S", stage: "AVAILABLE", pricing: "UNSPECIFIED", releaseDatePrecision: "DAY", status: "PUBLISHED" }),
    );
    expect(result.ok).toBe(false);
    expect(result.fieldErrors?.verified).toBeTruthy();
    expect((await prisma.product.findUniqueOrThrow({ where: { id: product.id } })).status).toBe("DRAFT");
  });

  it("approving a collaboration creates the partner and keeps the public source link", async () => {
    await signIn();
    const c = await candidate("COLLABORATION", "Partnership with Acme", ["1001"]);
    await expectRedirect(
      approveCollaborationCandidate(
        c.id,
        { ok: false },
        form({ title: "Acme partnership", summary: "Integration", category: "PRODUCT_INTEGRATION", date: "2025-03-05", partnerName: "Acme Tools", partnerHandle: "@acmetools", sourceUrl: "https://x.com/uniquelabs/status/1001" }),
      ),
    );
    const collaboration = await prisma.collaboration.findFirstOrThrow({ include: { partners: { include: { partner: true } } } });
    expect(collaboration.status).toBe("DRAFT");
    expect(collaboration.verifiedAt).toBeNull();
    expect(collaboration.sourceUrl).toBe("https://x.com/uniquelabs/status/1001");
    expect(collaboration.partners[0]?.partner).toMatchObject({ name: "Acme Tools", xHandle: "acmetools" });
  });

  it("rejection is recorded with a note", async () => {
    await signIn();
    const c = await candidate("PRODUCT", "Just an idea", ["conv-3"]);
    await rejectCandidate(c.id, form({ note: "Never built" }));
    expect(await prisma.importCandidate.findUniqueOrThrow({ where: { id: c.id } })).toMatchObject({ status: "REJECTED", reviewNote: "Never built" });
  });

  it("merging moves evidence, removes duplicates and marks sources as merged", async () => {
    await signIn();
    const target = await candidate("COLLABORATION", "Acme A", ["1001", "1002"]);
    const duplicate = await candidate("COLLABORATION", "Acme B", ["1002", "1003"]);
    await mergeCandidates(form({ targetId: target.id, sourceIds: [target.id, duplicate.id] }));
    const evidence = await prisma.sourceEvidence.findMany({ where: { candidateId: target.id } });
    expect(evidence.map((e) => e.sourceId).sort()).toEqual(["1001", "1002", "1003"]);
    expect(await prisma.importCandidate.findUniqueOrThrow({ where: { id: duplicate.id } })).toMatchObject({ status: "MERGED", mergedIntoId: target.id });
  });
});
