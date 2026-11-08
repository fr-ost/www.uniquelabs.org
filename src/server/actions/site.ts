"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { actorFromSession, audit } from "@/lib/audit";
import { requireAdmin } from "@/lib/auth/guards";
import { hashPassword, passwordProblem } from "@/lib/auth/password";
import { DEFAULT_COMPANY, DEFAULT_PRIVACY_POLICY, DEFAULT_SEO, DEFAULT_TERMS } from "@/lib/content/defaults";
import { deleteMediaAsset, mediaUsageCount } from "@/lib/media/storage";
import { companySchema, contactInfoSchema, legalSchema, seoSchema, socialLinkSchema } from "@/lib/validation/admin";
import { formObject, zodErrors, type ActionResult } from "@/lib/validation/fields";
import { prismaErrorResult, refreshPublic, reorder } from "@/server/admin-helpers";
import { z } from "zod";

async function ensureSingletons() {
  await prisma.companyProfile.upsert({ where: { id: 1 }, update: {}, create: { id: 1, ...DEFAULT_COMPANY } });
  await prisma.siteSettings.upsert({
    where: { id: 1 },
    update: {},
    create: { id: 1, ...DEFAULT_SEO, privacyPolicy: DEFAULT_PRIVACY_POLICY, termsOfUse: DEFAULT_TERMS },
  });
}

export async function saveCompany(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  const session = await requireAdmin();
  const parsed = companySchema.safeParse(formObject(formData));
  if (!parsed.success) return zodErrors(parsed.error);
  try {
    await ensureSingletons();
    const d = parsed.data;
    await prisma.companyProfile.update({
      where: { id: 1 },
      data: { ...d, foundedDateVerified: d.foundedDate ? d.foundedDateVerified : false },
    });
    await audit({ actor: actorFromSession(session), action: "company.update", entityType: "CompanyProfile", entityId: "1", summary: "Updated company information" });
    refreshPublic("/admin/company");
    return { ok: true, message: "Company information saved." };
  } catch (error) {
    return prismaErrorResult(error, "company profile");
  }
}

export async function saveContactInfo(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  const session = await requireAdmin();
  const parsed = contactInfoSchema.safeParse(formObject(formData));
  if (!parsed.success) return zodErrors(parsed.error);
  const { contactFormEnabled, ...company } = parsed.data;
  if (company.showAddress && !company.addressLine1) {
    return { ok: false, message: "Add at least the first address line before showing the address.", fieldErrors: { addressLine1: "Required to show the address." } };
  }
  try {
    await ensureSingletons();
    await prisma.$transaction([
      prisma.companyProfile.update({ where: { id: 1 }, data: company }),
      prisma.siteSettings.update({ where: { id: 1 }, data: { contactFormEnabled } }),
    ]);
    await audit({ actor: actorFromSession(session), action: "contact.update", entityType: "CompanyProfile", entityId: "1", summary: "Updated contact information" });
    refreshPublic("/admin/contact");
    return { ok: true, message: "Contact information saved." };
  } catch (error) {
    return prismaErrorResult(error, "contact information");
  }
}

export async function saveSeo(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  const session = await requireAdmin();
  const parsed = seoSchema.safeParse(formObject(formData));
  if (!parsed.success) return zodErrors(parsed.error);
  try {
    await ensureSingletons();
    await prisma.siteSettings.update({ where: { id: 1 }, data: parsed.data });
    await audit({
      actor: actorFromSession(session),
      action: "seo.update",
      entityType: "SiteSettings",
      entityId: "1",
      summary: `Updated SEO settings${parsed.data.allowIndexing ? "" : " (search indexing disabled)"}`,
    });
    refreshPublic("/admin/seo");
    return { ok: true, message: "SEO settings saved." };
  } catch (error) {
    return prismaErrorResult(error, "SEO settings");
  }
}

export async function saveLegal(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  const session = await requireAdmin();
  const parsed = legalSchema.safeParse(formObject(formData));
  if (!parsed.success) return zodErrors(parsed.error);
  try {
    await ensureSingletons();
    await prisma.siteSettings.update({ where: { id: 1 }, data: parsed.data });
    await audit({ actor: actorFromSession(session), action: "legal.update", entityType: "SiteSettings", entityId: "1", summary: "Updated privacy policy / terms of use" });
    refreshPublic("/admin/seo");
    return { ok: true, message: "Legal pages saved." };
  } catch (error) {
    return prismaErrorResult(error, "legal pages");
  }
}

// ---------------------------------------------------------------------------
// Social links
// ---------------------------------------------------------------------------

export async function saveSocialLink(id: string | null, _prev: ActionResult, formData: FormData): Promise<ActionResult> {
  const session = await requireAdmin();
  const parsed = socialLinkSchema.safeParse(formObject(formData));
  if (!parsed.success) return zodErrors(parsed.error);
  try {
    const data = { ...parsed.data, url: parsed.data.url! };
    const saved = id
      ? await prisma.socialLink.update({ where: { id }, data })
      : await prisma.socialLink.create({ data: { ...data, sortOrder: await prisma.socialLink.count() } });
    await audit({ actor: actorFromSession(session), action: id ? "social.update" : "social.create", entityType: "SocialLink", entityId: saved.id, summary: `Saved ${saved.platform} link` });
    refreshPublic("/admin/contact");
    return { ok: true, message: id ? "Link saved." : "Link added." };
  } catch (error) {
    return prismaErrorResult(error, "social link");
  }
}

export async function moveSocialLink(id: string, direction: "up" | "down"): Promise<void> {
  await requireAdmin();
  const items = await prisma.socialLink.findMany({ orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }], select: { id: true, sortOrder: true } });
  await reorder(items, id, direction, (itemId, sortOrder) => prisma.socialLink.update({ where: { id: itemId }, data: { sortOrder } }), (ops) => prisma.$transaction(ops));
  refreshPublic("/admin/contact");
}

export async function deleteSocialLink(id: string): Promise<void> {
  const session = await requireAdmin();
  const link = await prisma.socialLink.findUnique({ where: { id } });
  if (!link) return;
  await prisma.socialLink.delete({ where: { id } });
  await audit({ actor: actorFromSession(session), action: "social.delete", entityType: "SocialLink", entityId: id, summary: `Deleted ${link.platform} link` });
  refreshPublic("/admin/contact");
}

// ---------------------------------------------------------------------------
// Messages
// ---------------------------------------------------------------------------

const MESSAGE_STATUSES = ["NEW", "READ", "ARCHIVED", "SPAM"] as const;

export async function setMessageStatus(id: string, status: (typeof MESSAGE_STATUSES)[number]): Promise<void> {
  const session = await requireAdmin();
  if (typeof id !== "string" || !MESSAGE_STATUSES.includes(status)) throw new Error("Invalid message status.");
  await prisma.contactMessage.update({ where: { id }, data: { status, ...(status === "READ" ? { readAt: new Date() } : {}) } });
  await audit({ actor: actorFromSession(session), action: `message.${status.toLowerCase()}`, entityType: "ContactMessage", entityId: id, summary: `Marked a message as ${status.toLowerCase()}` });
  refreshPublic("/admin/messages");
}

/**
 * Opening a message marks it read. Called from the client after the page has
 * rendered (a POST with the Server Action origin check) — never as a side
 * effect of a GET render, so prefetches and crawlers can't change state.
 */
export async function markMessageRead(id: string): Promise<void> {
  await requireAdmin();
  if (typeof id !== "string" || id.length > 64) return;
  const { count } = await prisma.contactMessage.updateMany({ where: { id, status: "NEW" }, data: { status: "READ", readAt: new Date() } });
  if (count > 0) revalidatePath("/admin", "layout");
}

export async function deleteMessage(id: string): Promise<void> {
  const session = await requireAdmin();
  await prisma.contactMessage.deleteMany({ where: { id } });
  await audit({ actor: actorFromSession(session), action: "message.delete", entityType: "ContactMessage", entityId: id, summary: "Deleted a contact message" });
  refreshPublic("/admin/messages");
}

// ---------------------------------------------------------------------------
// Media
// ---------------------------------------------------------------------------

const altSchema = z.object({ alt: z.string().trim().max(300) });

export async function updateMediaAlt(id: string, _prev: ActionResult, formData: FormData): Promise<ActionResult> {
  const session = await requireAdmin();
  const parsed = altSchema.safeParse(formObject(formData));
  if (!parsed.success) return zodErrors(parsed.error);
  await prisma.mediaAsset.update({ where: { id }, data: { alt: parsed.data.alt } });
  await audit({ actor: actorFromSession(session), action: "media.update", entityType: "MediaAsset", entityId: id, summary: "Updated image alt text" });
  refreshPublic("/admin/media");
  return { ok: true, message: "Saved." };
}

export async function deleteMedia(id: string): Promise<void> {
  const session = await requireAdmin();
  const asset = await prisma.mediaAsset.findUnique({ where: { id }, select: { fileName: true } });
  if (!asset) return;
  const uses = await mediaUsageCount(id);
  await deleteMediaAsset(id);
  await audit({
    actor: actorFromSession(session),
    action: "media.delete",
    entityType: "MediaAsset",
    entityId: id,
    summary: `Deleted ${asset.fileName}${uses ? ` (was used in ${uses} place${uses === 1 ? "" : "s"})` : ""}`,
  });
  refreshPublic("/admin/media");
}

// ---------------------------------------------------------------------------
// Admin users (owner only)
// ---------------------------------------------------------------------------

const newUserSchema = z.object({
  name: z.string().trim().min(2, "Enter a name.").max(120),
  email: z.string().trim().toLowerCase().max(254).pipe(z.email("Enter a valid email.")),
  role: z.enum(["OWNER", "EDITOR"]),
  password: z.string().max(256),
});

export async function createAdminUser(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  const session = await requireAdmin("OWNER");
  const parsed = newUserSchema.safeParse(formObject(formData));
  if (!parsed.success) return zodErrors(parsed.error);
  const problem = passwordProblem(parsed.data.password, [parsed.data.name, parsed.data.email.split("@")[0] ?? ""]);
  if (problem) return { ok: false, message: problem, fieldErrors: { password: problem } };
  try {
    const user = await prisma.adminUser.create({
      data: { name: parsed.data.name, email: parsed.data.email, role: parsed.data.role, passwordHash: await hashPassword(parsed.data.password) },
    });
    await audit({ actor: actorFromSession(session), action: "admin.create", entityType: "AdminUser", entityId: user.id, summary: `Created ${user.role.toLowerCase()} account ${user.email}` });
    refreshPublic("/admin/users");
    return { ok: true, message: `Account created for ${user.email}. Share the password through a secure channel.` };
  } catch (error) {
    return prismaErrorResult(error, "admin account");
  }
}

export async function setAdminActive(id: string, active: boolean): Promise<void> {
  const session = await requireAdmin("OWNER");
  if (id === session.user.id) return;
  const user = await prisma.adminUser.update({ where: { id }, data: { isActive: active } });
  if (!active) await prisma.adminSession.deleteMany({ where: { userId: id } });
  await audit({ actor: actorFromSession(session), action: active ? "admin.activate" : "admin.deactivate", entityType: "AdminUser", entityId: id, summary: `${active ? "Reactivated" : "Deactivated"} ${user.email}` });
  refreshPublic("/admin/users");
}
