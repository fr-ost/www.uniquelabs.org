"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { actorFromSession, audit } from "@/lib/audit";
import { requireAdmin } from "@/lib/auth/guards";
import { slugify } from "@/lib/utils";
import { COLLAB_CATEGORIES, PLATFORMS, STAGES } from "@/lib/validation/admin";
import { checkbox, formObject, optionalDate, optionalText, optionalUrl, requiredText, zodErrors, type ActionResult } from "@/lib/validation/fields";
import { prismaErrorResult, refreshPublic, resolveSlug } from "@/server/admin-helpers";

/**
 * Review decisions for import candidates. Approval never publishes: it
 * creates a DRAFT content record (optionally pre-verified by the owner) that
 * still has to be published explicitly.
 */

const approveProductSchema = z.object({
  linkToProductId: optionalText(40),
  name: requiredText(120, "Give the product a name."),
  summary: requiredText(320, "Add a short description."),
  websiteUrl: optionalUrl,
  primaryCtaUrl: optionalUrl,
  platforms: z.array(z.enum(PLATFORMS)),
  stage: z.enum(STAGES),
  categoryId: optionalText(40),
  verified: checkbox,
  note: optionalText(1000),
});

export async function approveProductCandidate(candidateId: string, _prev: ActionResult, formData: FormData): Promise<ActionResult> {
  const session = await requireAdmin();
  const parsed = approveProductSchema.safeParse(formObject(formData, ["platforms"]));
  if (!parsed.success) return zodErrors(parsed.error);
  const d = parsed.data;
  const candidate = await prisma.importCandidate.findUnique({ where: { id: candidateId } });
  if (!candidate || candidate.kind !== "PRODUCT") return { ok: false, message: "Candidate not found." };
  if (candidate.status !== "PENDING") return { ok: false, message: "This candidate has already been reviewed." };

  let productId: string;
  try {
    productId = await prisma.$transaction(async (tx) => {
      let id = d.linkToProductId;
      if (id) {
        const existing = await tx.product.findUnique({ where: { id }, select: { id: true } });
        if (!existing) throw new Error("LINK_TARGET_MISSING");
      } else {
        const slug = await resolveSlug(null, d.name, async (candidateSlug) => Boolean(await tx.product.findUnique({ where: { slug: candidateSlug }, select: { id: true } })));
        const product = await tx.product.create({
          data: {
            name: d.name,
            slug,
            summary: d.summary,
            websiteUrl: d.websiteUrl,
            primaryCtaUrl: d.primaryCtaUrl,
            primaryCtaLabel: d.primaryCtaUrl?.includes("chromewebstore") ? "Add to Chrome" : null,
            platforms: d.platforms,
            stage: d.stage,
            categoryId: d.categoryId,
            status: "DRAFT",
            verifiedAt: d.verified ? new Date() : null,
            sortOrder: await tx.product.count(),
          },
        });
        id = product.id;
      }
      await tx.sourceEvidence.updateMany({ where: { candidateId }, data: { productId: id } });
      await tx.importCandidate.update({
        where: { id: candidateId },
        data: { status: "APPROVED", productId: id, reviewedAt: new Date(), reviewedById: session.user.id, reviewNote: d.note, verification: d.verified ? "VERIFIED" : candidate.verification },
      });
      return id;
    });
  } catch (error) {
    if (error instanceof Error && error.message === "LINK_TARGET_MISSING") return { ok: false, message: "The product to link no longer exists." };
    return prismaErrorResult(error, "product");
  }

  await audit({
    actor: actorFromSession(session),
    action: "candidate.approve",
    entityType: "ImportCandidate",
    entityId: candidateId,
    summary: `Approved product candidate “${candidate.title}” → ${d.linkToProductId ? "linked to an existing product" : "new draft product"}${d.verified ? " (verified)" : ""}`,
    metadata: { productId },
  });
  refreshPublic("/admin/candidates/products");
  redirect(`/admin/products/${productId}?created=1`);
}

const approveCollaborationSchema = z.object({
  linkToCollaborationId: optionalText(40),
  title: requiredText(160, "Give the collaboration a title."),
  summary: requiredText(400, "Add a short summary."),
  category: z.enum(COLLAB_CATEGORIES),
  date: optionalDate,
  partnerName: requiredText(120, "Name the partner."),
  partnerHandle: z
    .string()
    .trim()
    .optional()
    .transform((v) => (v ? v.replace(/^@/, "").slice(0, 30) : null))
    .refine((v) => v === null || /^[A-Za-z0-9_]{1,30}$/.test(v), "Enter a valid X handle."),
  partnerWebsite: optionalUrl,
  sourceUrl: optionalUrl,
  featured: checkbox,
  verified: checkbox,
  note: optionalText(1000),
});

export async function approveCollaborationCandidate(candidateId: string, _prev: ActionResult, formData: FormData): Promise<ActionResult> {
  const session = await requireAdmin();
  const parsed = approveCollaborationSchema.safeParse(formObject(formData));
  if (!parsed.success) return zodErrors(parsed.error);
  const d = parsed.data;
  const candidate = await prisma.importCandidate.findUnique({ where: { id: candidateId } });
  if (!candidate || candidate.kind !== "COLLABORATION") return { ok: false, message: "Candidate not found." };
  if (candidate.status !== "PENDING") return { ok: false, message: "This candidate has already been reviewed." };

  let collaborationId: string;
  try {
    collaborationId = await prisma.$transaction(async (tx) => {
      // Reuse an existing partner by X handle or slug.
      let partner = d.partnerHandle ? await tx.partner.findFirst({ where: { xHandle: { equals: d.partnerHandle, mode: "insensitive" } } }) : null;
      partner ??= await tx.partner.findUnique({ where: { slug: slugify(d.partnerName) } });
      partner ??= await tx.partner.create({
        data: { name: d.partnerName, slug: await resolveSlug(null, d.partnerName, async (s) => Boolean(await tx.partner.findUnique({ where: { slug: s } }))), xHandle: d.partnerHandle, websiteUrl: d.partnerWebsite },
      });

      let id = d.linkToCollaborationId;
      if (id) {
        const existing = await tx.collaboration.findUnique({ where: { id }, select: { id: true } });
        if (!existing) throw new Error("LINK_TARGET_MISSING");
      } else {
        const slug = await resolveSlug(null, d.title, async (s) => Boolean(await tx.collaboration.findUnique({ where: { slug: s }, select: { id: true } })));
        const collaboration = await tx.collaboration.create({
          data: {
            title: d.title,
            slug,
            summary: d.summary,
            category: d.category,
            date: d.date,
            datePrecision: "DAY",
            sourceUrl: d.sourceUrl,
            sourceLabel: d.sourceUrl ? "Original post on X" : null,
            featured: d.featured,
            status: "DRAFT",
            verifiedAt: d.verified ? new Date() : null,
            sortOrder: await tx.collaboration.count(),
          },
        });
        id = collaboration.id;
      }
      await tx.collaborationPartner.upsert({
        where: { collaborationId_partnerId: { collaborationId: id, partnerId: partner.id } },
        update: {},
        create: { collaborationId: id, partnerId: partner.id },
      });
      await tx.sourceEvidence.updateMany({ where: { candidateId }, data: { collaborationId: id } });
      await tx.importCandidate.update({
        where: { id: candidateId },
        data: { status: "APPROVED", collaborationId: id, reviewedAt: new Date(), reviewedById: session.user.id, reviewNote: d.note, verification: d.verified ? "VERIFIED" : candidate.verification },
      });
      return id;
    });
  } catch (error) {
    if (error instanceof Error && error.message === "LINK_TARGET_MISSING") return { ok: false, message: "The collaboration to link no longer exists." };
    return prismaErrorResult(error, "collaboration");
  }

  await audit({
    actor: actorFromSession(session),
    action: "candidate.approve",
    entityType: "ImportCandidate",
    entityId: candidateId,
    summary: `Approved collaboration candidate “${candidate.title}”${d.verified ? " (verified)" : ""}`,
    metadata: { collaborationId },
  });
  refreshPublic("/admin/candidates/collaborations");
  redirect(`/admin/collaborations/${collaborationId}?created=1`);
}

async function setCandidateStatus(id: string, status: "REJECTED" | "ARCHIVED" | "PENDING", note: string | null) {
  const session = await requireAdmin();
  const candidate = await prisma.importCandidate.findUnique({ where: { id } });
  if (!candidate) return;
  if (candidate.status === "APPROVED" && status !== "PENDING") return;
  await prisma.importCandidate.update({
    where: { id },
    data: { status, reviewedAt: status === "PENDING" ? null : new Date(), reviewedById: status === "PENDING" ? null : session.user.id, ...(note !== null ? { reviewNote: note } : {}) },
  });
  await audit({
    actor: actorFromSession(session),
    action: `candidate.${status.toLowerCase()}`,
    entityType: "ImportCandidate",
    entityId: id,
    summary: `${status === "PENDING" ? "Restored" : status === "REJECTED" ? "Rejected" : "Archived"} ${candidate.kind.toLowerCase()} candidate “${candidate.title}”`,
  });
  refreshPublic(candidate.kind === "PRODUCT" ? "/admin/candidates/products" : "/admin/candidates/collaborations");
}

export async function rejectCandidate(id: string, formData: FormData): Promise<void> {
  const note = String(formData.get("note") ?? "").trim().slice(0, 1000);
  await setCandidateStatus(id, "REJECTED", note || null);
}

export async function archiveCandidate(id: string): Promise<void> {
  await setCandidateStatus(id, "ARCHIVED", null);
}

export async function restoreCandidate(id: string): Promise<void> {
  await setCandidateStatus(id, "PENDING", null);
}

/** Merges duplicate candidates into one, moving all evidence to the target. */
export async function mergeCandidates(formData: FormData): Promise<void> {
  const session = await requireAdmin();
  const targetId = String(formData.get("targetId") ?? "");
  const sourceIds = formData.getAll("sourceIds").map(String).filter((id) => id && id !== targetId);
  if (!targetId || sourceIds.length === 0) return;
  const target = await prisma.importCandidate.findUnique({ where: { id: targetId } });
  if (!target || target.status !== "PENDING") return;
  const sources = await prisma.importCandidate.findMany({ where: { id: { in: sourceIds }, kind: target.kind, status: "PENDING" } });
  if (sources.length === 0) return;

  await prisma.$transaction(async (tx) => {
    const existing = await tx.sourceEvidence.findMany({ where: { candidateId: targetId }, select: { sourceType: true, sourceId: true } });
    const known = new Set(existing.map((e) => `${e.sourceType}:${e.sourceId}`));
    for (const source of sources) {
      const evidence = await tx.sourceEvidence.findMany({ where: { candidateId: source.id } });
      for (const item of evidence) {
        const key = `${item.sourceType}:${item.sourceId}`;
        if (known.has(key)) {
          await tx.sourceEvidence.delete({ where: { id: item.id } });
        } else {
          known.add(key);
          await tx.sourceEvidence.update({ where: { id: item.id }, data: { candidateId: targetId } });
        }
      }
      await tx.importCandidate.update({ where: { id: source.id }, data: { status: "MERGED", mergedIntoId: targetId, reviewedAt: new Date(), reviewedById: session.user.id } });
    }
    const all = [target, ...sources];
    const first = all.map((c) => c.firstSeenAt?.getTime()).filter((t): t is number => typeof t === "number");
    const last = all.map((c) => c.lastSeenAt?.getTime()).filter((t): t is number => typeof t === "number");
    await tx.importCandidate.update({
      where: { id: targetId },
      data: {
        confidence: Math.min(100, Math.max(...all.map((c) => c.confidence)) + 3 * sources.length),
        firstSeenAt: first.length ? new Date(Math.min(...first)) : null,
        lastSeenAt: last.length ? new Date(Math.max(...last)) : null,
      },
    });
  });
  await audit({
    actor: actorFromSession(session),
    action: "candidate.merge",
    entityType: "ImportCandidate",
    entityId: targetId,
    summary: `Merged ${sources.length} duplicate candidate${sources.length === 1 ? "" : "s"} into “${target.title}”`,
    metadata: { merged: sources.map((s) => s.id) },
  });
  refreshPublic(target.kind === "PRODUCT" ? "/admin/candidates/products" : "/admin/candidates/collaborations");
}
