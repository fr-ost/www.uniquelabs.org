"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { actorFromSession, audit } from "@/lib/audit";
import { requireAdmin } from "@/lib/auth/guards";
import { productSchema, categorySchema } from "@/lib/validation/admin";
import { formObject, zodErrors, type ActionResult } from "@/lib/validation/fields";
import { prismaErrorResult, refreshPublic, reorder, resolveSlug } from "@/server/admin-helpers";
import type { PublishStatus } from "@/generated/prisma/enums";

export async function saveProduct(id: string | null, _prev: ActionResult, formData: FormData): Promise<ActionResult> {
  const session = await requireAdmin();
  const parsed = productSchema.safeParse(formObject(formData, ["platforms"]));
  if (!parsed.success) return zodErrors(parsed.error);
  const d = parsed.data;

  const existing = id ? await prisma.product.findUnique({ where: { id } }) : null;
  if (id && !existing) return { ok: false, message: "This product no longer exists." };
  if (d.status === "PUBLISHED" && !d.verified) {
    return {
      ok: false,
      message: "Only verified products can be published.",
      fieldErrors: { verified: "Confirm the details are verified before publishing." },
    };
  }

  let savedId = id;
  try {
    const slug = await resolveSlug(d.slug, d.name, async (candidate) =>
      Boolean(await prisma.product.findFirst({ where: { slug: candidate, ...(id ? { id: { not: id } } : {}) }, select: { id: true } })),
    );
    const now = new Date();
    const data = {
      name: d.name,
      slug,
      tagline: d.tagline,
      summary: d.summary,
      description: d.description,
      audience: d.audience,
      categoryId: d.categoryId,
      platforms: d.platforms,
      stage: d.stage,
      pricing: d.pricing,
      websiteUrl: d.websiteUrl,
      primaryCtaUrl: d.primaryCtaUrl,
      primaryCtaLabel: d.primaryCtaLabel,
      releaseDate: d.releaseDate,
      releaseDatePrecision: d.releaseDatePrecision,
      releaseDateVerified: d.releaseDate ? d.releaseDateVerified : false,
      accentColor: d.accentColor,
      logoId: d.logoId,
      coverId: d.coverId,
      seoTitle: d.seoTitle,
      seoDescription: d.seoDescription,
      featured: d.featured,
      status: d.status,
      verifiedAt: d.verified ? (existing?.verifiedAt ?? now) : null,
      publishedAt: d.status === "PUBLISHED" ? (existing?.publishedAt ?? now) : (existing?.publishedAt ?? null),
    };

    const saved = await prisma.$transaction(async (tx) => {
      const product = id
        ? await tx.product.update({ where: { id }, data })
        : await tx.product.create({ data: { ...data, sortOrder: await tx.product.count() } });
      await tx.productFeature.deleteMany({ where: { productId: product.id } });
      await tx.productLink.deleteMany({ where: { productId: product.id } });
      await tx.productImage.deleteMany({ where: { productId: product.id } });
      if (d.features.length) {
        await tx.productFeature.createMany({
          data: d.features.map((f, i) => ({ productId: product.id, title: f.title, description: f.description || null, sortOrder: i })),
        });
      }
      if (d.links.length) {
        await tx.productLink.createMany({
          data: d.links.map((l, i) => ({ productId: product.id, kind: l.kind, label: l.label, url: l.url, sortOrder: i })),
        });
      }
      if (d.images.length) {
        await tx.productImage.createMany({
          data: d.images.map((img, i) => ({ productId: product.id, mediaId: img.mediaId, caption: img.caption || null, sortOrder: i })),
        });
      }
      return product;
    });
    savedId = saved.id;

    await audit({
      actor: actorFromSession(session),
      action: id ? "product.update" : "product.create",
      entityType: "Product",
      entityId: saved.id,
      summary: `${id ? "Updated" : "Created"} product “${saved.name}” (${saved.status.toLowerCase()})`,
      metadata: {
        status: saved.status,
        verified: Boolean(saved.verifiedAt),
        ...(existing && existing.status !== saved.status ? { previousStatus: existing.status } : {}),
      },
    });
    refreshPublic("/admin/products");
  } catch (error) {
    return prismaErrorResult(error, "product");
  }

  if (!id && savedId) redirect(`/admin/products/${savedId}?created=1`);
  return { ok: true, message: "Product saved." };
}

export async function setProductStatus(id: string, status: PublishStatus): Promise<void> {
  const session = await requireAdmin();
  const product = await prisma.product.findUnique({ where: { id } });
  if (!product) return;
  if (status === "PUBLISHED" && !product.verifiedAt) {
    // Cannot publish unverified records; the edit form explains why.
    redirect(`/admin/products/${id}?needsVerification=1`);
  }
  await prisma.product.update({
    where: { id },
    data: { status, ...(status === "PUBLISHED" && !product.publishedAt ? { publishedAt: new Date() } : {}) },
  });
  await audit({
    actor: actorFromSession(session),
    action: `product.${status.toLowerCase()}`,
    entityType: "Product",
    entityId: id,
    summary: `Set “${product.name}” to ${status.toLowerCase()}`,
    metadata: { previousStatus: product.status },
  });
  refreshPublic("/admin/products");
}

export async function toggleProductFeatured(id: string): Promise<void> {
  const session = await requireAdmin();
  const product = await prisma.product.findUnique({ where: { id }, select: { name: true, featured: true } });
  if (!product) return;
  await prisma.product.update({ where: { id }, data: { featured: !product.featured } });
  await audit({
    actor: actorFromSession(session),
    action: "product.feature",
    entityType: "Product",
    entityId: id,
    summary: `${product.featured ? "Unfeatured" : "Featured"} “${product.name}”`,
  });
  refreshPublic("/admin/products");
}

export async function moveProduct(id: string, direction: "up" | "down"): Promise<void> {
  const session = await requireAdmin();
  const items = await prisma.product.findMany({ orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }], select: { id: true, sortOrder: true } });
  await reorder(items, id, direction, (itemId, sortOrder) => prisma.product.update({ where: { id: itemId }, data: { sortOrder } }), (ops) => prisma.$transaction(ops));
  await audit({ actor: actorFromSession(session), action: "product.reorder", entityType: "Product", entityId: id, summary: `Moved a product ${direction}` });
  refreshPublic("/admin/products");
}

export async function deleteProduct(id: string): Promise<void> {
  const session = await requireAdmin();
  const product = await prisma.product.findUnique({ where: { id }, select: { name: true } });
  if (!product) redirect("/admin/products");
  await prisma.$transaction([
    // Keep candidates and evidence for provenance, but detach them.
    prisma.importCandidate.updateMany({ where: { productId: id }, data: { productId: null, status: "PENDING" } }),
    prisma.product.delete({ where: { id } }),
  ]);
  await audit({ actor: actorFromSession(session), action: "product.delete", entityType: "Product", entityId: id, summary: `Deleted product “${product.name}”` });
  refreshPublic("/admin/products");
  redirect("/admin/products?deleted=1");
}

// ---------------------------------------------------------------------------
// Categories
// ---------------------------------------------------------------------------

export async function saveCategory(id: string | null, _prev: ActionResult, formData: FormData): Promise<ActionResult> {
  const session = await requireAdmin();
  const parsed = categorySchema.safeParse(formObject(formData));
  if (!parsed.success) return zodErrors(parsed.error);
  try {
    const slug = await resolveSlug(parsed.data.slug, parsed.data.name, async (candidate) =>
      Boolean(await prisma.category.findFirst({ where: { slug: candidate, ...(id ? { id: { not: id } } : {}) } })),
    );
    const data = { name: parsed.data.name, slug, description: parsed.data.description };
    const saved = id
      ? await prisma.category.update({ where: { id }, data })
      : await prisma.category.create({ data: { ...data, sortOrder: await prisma.category.count() } });
    await audit({ actor: actorFromSession(session), action: id ? "category.update" : "category.create", entityType: "Category", entityId: saved.id, summary: `Saved category “${saved.name}”` });
    refreshPublic("/admin/products/categories");
    return { ok: true, message: id ? "Category saved." : "Category added." };
  } catch (error) {
    return prismaErrorResult(error, "category");
  }
}

export async function deleteCategory(id: string): Promise<void> {
  const session = await requireAdmin();
  const category = await prisma.category.findUnique({ where: { id } });
  if (!category) return;
  await prisma.category.delete({ where: { id } });
  await audit({ actor: actorFromSession(session), action: "category.delete", entityType: "Category", entityId: id, summary: `Deleted category “${category.name}” (products keep existing, uncategorised)` });
  refreshPublic("/admin/products/categories");
}

export async function moveCategory(id: string, direction: "up" | "down"): Promise<void> {
  await requireAdmin();
  const items = await prisma.category.findMany({ orderBy: [{ sortOrder: "asc" }, { name: "asc" }], select: { id: true, sortOrder: true } });
  await reorder(items, id, direction, (itemId, sortOrder) => prisma.category.update({ where: { id: itemId }, data: { sortOrder } }), (ops) => prisma.$transaction(ops));
  refreshPublic("/admin/products/categories");
}
