"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { actorFromSession, audit } from "@/lib/audit";
import { requireAdmin } from "@/lib/auth/guards";
import { collaborationSchema, partnerSchema } from "@/lib/validation/admin";
import { formObject, zodErrors, type ActionResult } from "@/lib/validation/fields";
import { prismaErrorResult, refreshPublic, reorder, resolveSlug } from "@/server/admin-helpers";
import type { PublishStatus } from "@/generated/prisma/enums";

export async function saveCollaboration(id: string | null, _prev: ActionResult, formData: FormData): Promise<ActionResult> {
  const session = await requireAdmin();
  const parsed = collaborationSchema.safeParse(formObject(formData, ["partnerIds", "productIds"]));
  if (!parsed.success) return zodErrors(parsed.error);
  const d = parsed.data;
  const existing = id ? await prisma.collaboration.findUnique({ where: { id } }) : null;
  if (id && !existing) return { ok: false, message: "This collaboration no longer exists." };
  if (d.status === "PUBLISHED" && !d.verified) {
    return { ok: false, message: "Only verified collaborations can be published.", fieldErrors: { verified: "Confirm this collaboration is genuine before publishing." } };
  }

  let savedId = id;
  try {
    const slug = await resolveSlug(d.slug, d.title, async (candidate) =>
      Boolean(await prisma.collaboration.findFirst({ where: { slug: candidate, ...(id ? { id: { not: id } } : {}) }, select: { id: true } })),
    );
    const now = new Date();
    const data = {
      title: d.title,
      slug,
      summary: d.summary,
      description: d.description,
      category: d.category,
      date: d.date,
      datePrecision: d.datePrecision,
      sourceUrl: d.sourceUrl,
      sourceLabel: d.sourceLabel,
      externalUrl: d.externalUrl,
      coverId: d.coverId,
      featured: d.featured,
      status: d.status,
      verifiedAt: d.verified ? (existing?.verifiedAt ?? now) : null,
      publishedAt: d.status === "PUBLISHED" ? (existing?.publishedAt ?? now) : (existing?.publishedAt ?? null),
    };
    const saved = await prisma.$transaction(async (tx) => {
      const record = id
        ? await tx.collaboration.update({ where: { id }, data: { ...data, products: { set: d.productIds.map((pid) => ({ id: pid })) } } })
        : await tx.collaboration.create({
            data: { ...data, sortOrder: await tx.collaboration.count(), products: { connect: d.productIds.map((pid) => ({ id: pid })) } },
          });
      await tx.collaborationPartner.deleteMany({ where: { collaborationId: record.id } });
      if (d.partnerIds.length) {
        await tx.collaborationPartner.createMany({
          data: [...new Set(d.partnerIds)].map((partnerId, index) => ({ collaborationId: record.id, partnerId, sortOrder: index })),
        });
      }
      return record;
    });
    savedId = saved.id;
    await audit({
      actor: actorFromSession(session),
      action: id ? "collaboration.update" : "collaboration.create",
      entityType: "Collaboration",
      entityId: saved.id,
      summary: `${id ? "Updated" : "Created"} collaboration “${saved.title}” (${saved.status.toLowerCase()})`,
      metadata: { status: saved.status, verified: Boolean(saved.verifiedAt) },
    });
    refreshPublic("/admin/collaborations");
  } catch (error) {
    return prismaErrorResult(error, "collaboration");
  }
  if (!id && savedId) redirect(`/admin/collaborations/${savedId}?created=1`);
  return { ok: true, message: "Collaboration saved." };
}

export async function setCollaborationStatus(id: string, status: PublishStatus): Promise<void> {
  const session = await requireAdmin();
  const record = await prisma.collaboration.findUnique({ where: { id } });
  if (!record) return;
  if (status === "PUBLISHED" && !record.verifiedAt) redirect(`/admin/collaborations/${id}?needsVerification=1`);
  await prisma.collaboration.update({
    where: { id },
    data: { status, ...(status === "PUBLISHED" && !record.publishedAt ? { publishedAt: new Date() } : {}) },
  });
  await audit({ actor: actorFromSession(session), action: `collaboration.${status.toLowerCase()}`, entityType: "Collaboration", entityId: id, summary: `Set “${record.title}” to ${status.toLowerCase()}` });
  refreshPublic("/admin/collaborations");
}

export async function toggleCollaborationFeatured(id: string): Promise<void> {
  const session = await requireAdmin();
  const record = await prisma.collaboration.findUnique({ where: { id }, select: { title: true, featured: true } });
  if (!record) return;
  await prisma.collaboration.update({ where: { id }, data: { featured: !record.featured } });
  await audit({ actor: actorFromSession(session), action: "collaboration.feature", entityType: "Collaboration", entityId: id, summary: `${record.featured ? "Unfeatured" : "Featured"} “${record.title}”` });
  refreshPublic("/admin/collaborations");
}

export async function moveCollaboration(id: string, direction: "up" | "down"): Promise<void> {
  await requireAdmin();
  const items = await prisma.collaboration.findMany({ orderBy: [{ sortOrder: "asc" }, { date: "desc" }], select: { id: true, sortOrder: true } });
  await reorder(items, id, direction, (itemId, sortOrder) => prisma.collaboration.update({ where: { id: itemId }, data: { sortOrder } }), (ops) => prisma.$transaction(ops));
  refreshPublic("/admin/collaborations");
}

export async function deleteCollaboration(id: string): Promise<void> {
  const session = await requireAdmin();
  const record = await prisma.collaboration.findUnique({ where: { id }, select: { title: true } });
  if (!record) redirect("/admin/collaborations");
  await prisma.$transaction([
    prisma.importCandidate.updateMany({ where: { collaborationId: id }, data: { collaborationId: null, status: "PENDING" } }),
    prisma.collaboration.delete({ where: { id } }),
  ]);
  await audit({ actor: actorFromSession(session), action: "collaboration.delete", entityType: "Collaboration", entityId: id, summary: `Deleted collaboration “${record.title}”` });
  refreshPublic("/admin/collaborations");
  redirect("/admin/collaborations?deleted=1");
}

// ---------------------------------------------------------------------------
// Partners
// ---------------------------------------------------------------------------

export async function savePartner(id: string | null, _prev: ActionResult, formData: FormData): Promise<ActionResult> {
  const session = await requireAdmin();
  const parsed = partnerSchema.safeParse(formObject(formData));
  if (!parsed.success) return zodErrors(parsed.error);
  try {
    const slug = await resolveSlug(parsed.data.slug, parsed.data.name, async (candidate) =>
      Boolean(await prisma.partner.findFirst({ where: { slug: candidate, ...(id ? { id: { not: id } } : {}) } })),
    );
    const data = { ...parsed.data, slug };
    const saved = id ? await prisma.partner.update({ where: { id }, data }) : await prisma.partner.create({ data });
    await audit({ actor: actorFromSession(session), action: id ? "partner.update" : "partner.create", entityType: "Partner", entityId: saved.id, summary: `Saved partner “${saved.name}”` });
    refreshPublic("/admin/collaborations/partners");
    return { ok: true, message: id ? "Partner saved." : "Partner added.", id: saved.id };
  } catch (error) {
    return prismaErrorResult(error, "partner");
  }
}

export async function deletePartner(id: string): Promise<void> {
  const session = await requireAdmin();
  const partner = await prisma.partner.findUnique({ where: { id }, select: { name: true } });
  if (!partner) return;
  await prisma.partner.delete({ where: { id } });
  await audit({ actor: actorFromSession(session), action: "partner.delete", entityType: "Partner", entityId: id, summary: `Deleted partner “${partner.name}”` });
  refreshPublic("/admin/collaborations/partners");
}
