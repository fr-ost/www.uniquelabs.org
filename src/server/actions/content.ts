"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { actorFromSession, audit } from "@/lib/audit";
import { requireAdmin } from "@/lib/auth/guards";
import { capabilitySchema, milestoneSchema, principleSchema, teamGroupSchema, teamMemberSchema } from "@/lib/validation/admin";
import { formObject, zodErrors, type ActionResult } from "@/lib/validation/fields";
import { prismaErrorResult, refreshPublic, reorder, resolveSlug } from "@/server/admin-helpers";
import type { PublishStatus } from "@/generated/prisma/enums";

// ---------------------------------------------------------------------------
// Team members
// ---------------------------------------------------------------------------

export async function saveTeamMember(id: string | null, _prev: ActionResult, formData: FormData): Promise<ActionResult> {
  const session = await requireAdmin();
  const parsed = teamMemberSchema.safeParse(formObject(formData));
  if (!parsed.success) return zodErrors(parsed.error);
  const d = parsed.data;
  let savedId = id;
  try {
    const existing = id ? await prisma.teamMember.findUnique({ where: { id } }) : null;
    if (id && !existing) return { ok: false, message: "This team member no longer exists." };
    const slug = await resolveSlug(d.slug, d.name, async (candidate) =>
      Boolean(await prisma.teamMember.findFirst({ where: { slug: candidate, ...(id ? { id: { not: id } } : {}) } })),
    );
    const data = {
      ...d,
      slug,
      joinDateVerified: d.joinDate ? d.joinDateVerified : false,
      publishedAt: d.status === "PUBLISHED" ? (existing?.publishedAt ?? new Date()) : (existing?.publishedAt ?? null),
    };
    const saved = id
      ? await prisma.teamMember.update({ where: { id }, data })
      : await prisma.teamMember.create({ data: { ...data, sortOrder: await prisma.teamMember.count() } });
    savedId = saved.id;
    await audit({ actor: actorFromSession(session), action: id ? "team.update" : "team.create", entityType: "TeamMember", entityId: saved.id, summary: `${id ? "Updated" : "Added"} team member “${saved.name}” (${saved.status.toLowerCase()})` });
    refreshPublic("/admin/team");
  } catch (error) {
    return prismaErrorResult(error, "team member");
  }
  if (!id && savedId) redirect(`/admin/team/${savedId}?created=1`);
  return { ok: true, message: "Team member saved." };
}

export async function setTeamMemberStatus(id: string, status: PublishStatus): Promise<void> {
  const session = await requireAdmin();
  const member = await prisma.teamMember.findUnique({ where: { id } });
  if (!member) return;
  await prisma.teamMember.update({ where: { id }, data: { status, ...(status === "PUBLISHED" && !member.publishedAt ? { publishedAt: new Date() } : {}) } });
  await audit({ actor: actorFromSession(session), action: `team.${status.toLowerCase()}`, entityType: "TeamMember", entityId: id, summary: `Set “${member.name}” to ${status.toLowerCase()}` });
  refreshPublic("/admin/team");
}

export async function moveTeamMember(id: string, direction: "up" | "down"): Promise<void> {
  await requireAdmin();
  const items = await prisma.teamMember.findMany({ orderBy: [{ sortOrder: "asc" }, { name: "asc" }], select: { id: true, sortOrder: true } });
  await reorder(items, id, direction, (itemId, sortOrder) => prisma.teamMember.update({ where: { id: itemId }, data: { sortOrder } }), (ops) => prisma.$transaction(ops));
  refreshPublic("/admin/team");
}

export async function deleteTeamMember(id: string): Promise<void> {
  const session = await requireAdmin();
  const member = await prisma.teamMember.findUnique({ where: { id }, select: { name: true } });
  if (!member) redirect("/admin/team");
  await prisma.teamMember.delete({ where: { id } });
  await audit({ actor: actorFromSession(session), action: "team.delete", entityType: "TeamMember", entityId: id, summary: `Deleted team member “${member.name}”` });
  refreshPublic("/admin/team");
  redirect("/admin/team?deleted=1");
}

export async function saveTeamGroup(id: string | null, _prev: ActionResult, formData: FormData): Promise<ActionResult> {
  const session = await requireAdmin();
  const parsed = teamGroupSchema.safeParse(formObject(formData));
  if (!parsed.success) return zodErrors(parsed.error);
  try {
    const slug = await resolveSlug(parsed.data.slug, parsed.data.name, async (candidate) =>
      Boolean(await prisma.teamGroup.findFirst({ where: { slug: candidate, ...(id ? { id: { not: id } } : {}) } })),
    );
    const data = { ...parsed.data, slug };
    const saved = id ? await prisma.teamGroup.update({ where: { id }, data }) : await prisma.teamGroup.create({ data: { ...data, sortOrder: await prisma.teamGroup.count() } });
    await audit({ actor: actorFromSession(session), action: id ? "team_group.update" : "team_group.create", entityType: "TeamGroup", entityId: saved.id, summary: `Saved team group “${saved.name}”` });
    refreshPublic("/admin/team/groups");
    return { ok: true, message: id ? "Group saved." : "Group added." };
  } catch (error) {
    return prismaErrorResult(error, "group");
  }
}

export async function moveTeamGroup(id: string, direction: "up" | "down"): Promise<void> {
  await requireAdmin();
  const items = await prisma.teamGroup.findMany({ orderBy: [{ sortOrder: "asc" }, { name: "asc" }], select: { id: true, sortOrder: true } });
  await reorder(items, id, direction, (itemId, sortOrder) => prisma.teamGroup.update({ where: { id: itemId }, data: { sortOrder } }), (ops) => prisma.$transaction(ops));
  refreshPublic("/admin/team/groups");
}

export async function deleteTeamGroup(id: string): Promise<void> {
  const session = await requireAdmin();
  const group = await prisma.teamGroup.findUnique({ where: { id } });
  if (!group) return;
  await prisma.teamGroup.delete({ where: { id } });
  await audit({ actor: actorFromSession(session), action: "team_group.delete", entityType: "TeamGroup", entityId: id, summary: `Deleted team group “${group.name}”` });
  refreshPublic("/admin/team/groups");
}

// ---------------------------------------------------------------------------
// Milestones
// ---------------------------------------------------------------------------

export async function saveMilestone(id: string | null, _prev: ActionResult, formData: FormData): Promise<ActionResult> {
  const session = await requireAdmin();
  const parsed = milestoneSchema.safeParse(formObject(formData));
  if (!parsed.success) return zodErrors(parsed.error);
  const d = parsed.data;
  if (d.status === "PUBLISHED" && !d.verified) {
    return { ok: false, message: "Only verified milestones can be published.", fieldErrors: { verified: "Confirm this milestone is based on a verified record." } };
  }
  let savedId = id;
  try {
    const existing = id ? await prisma.companyMilestone.findUnique({ where: { id } }) : null;
    if (id && !existing) return { ok: false, message: "This milestone no longer exists." };
    const slug = await resolveSlug(d.slug, d.title, async (candidate) =>
      Boolean(await prisma.companyMilestone.findFirst({ where: { slug: candidate, ...(id ? { id: { not: id } } : {}) } })),
    );
    const now = new Date();
    const { verified, ...rest } = d;
    const data = {
      ...rest,
      date: d.date!,
      slug,
      verifiedAt: verified ? (existing?.verifiedAt ?? now) : null,
      publishedAt: d.status === "PUBLISHED" ? (existing?.publishedAt ?? now) : (existing?.publishedAt ?? null),
    };
    const saved = id ? await prisma.companyMilestone.update({ where: { id }, data }) : await prisma.companyMilestone.create({ data });
    savedId = saved.id;
    await audit({ actor: actorFromSession(session), action: id ? "milestone.update" : "milestone.create", entityType: "CompanyMilestone", entityId: saved.id, summary: `${id ? "Updated" : "Added"} milestone “${saved.title}” (${saved.status.toLowerCase()})` });
    refreshPublic("/admin/timeline");
  } catch (error) {
    return prismaErrorResult(error, "milestone");
  }
  if (!id && savedId) redirect(`/admin/timeline/${savedId}?created=1`);
  return { ok: true, message: "Milestone saved." };
}

export async function setMilestoneStatus(id: string, status: PublishStatus): Promise<void> {
  const session = await requireAdmin();
  const milestone = await prisma.companyMilestone.findUnique({ where: { id } });
  if (!milestone) return;
  if (status === "PUBLISHED" && !milestone.verifiedAt) redirect(`/admin/timeline/${id}?needsVerification=1`);
  await prisma.companyMilestone.update({ where: { id }, data: { status, ...(status === "PUBLISHED" && !milestone.publishedAt ? { publishedAt: new Date() } : {}) } });
  await audit({ actor: actorFromSession(session), action: `milestone.${status.toLowerCase()}`, entityType: "CompanyMilestone", entityId: id, summary: `Set “${milestone.title}” to ${status.toLowerCase()}` });
  refreshPublic("/admin/timeline");
}

export async function deleteMilestone(id: string): Promise<void> {
  const session = await requireAdmin();
  const milestone = await prisma.companyMilestone.findUnique({ where: { id }, select: { title: true } });
  if (!milestone) redirect("/admin/timeline");
  await prisma.companyMilestone.delete({ where: { id } });
  await audit({ actor: actorFromSession(session), action: "milestone.delete", entityType: "CompanyMilestone", entityId: id, summary: `Deleted milestone “${milestone.title}”` });
  refreshPublic("/admin/timeline");
  redirect("/admin/timeline?deleted=1");
}

// ---------------------------------------------------------------------------
// Capabilities (What We Do)
// ---------------------------------------------------------------------------

export async function saveCapability(id: string | null, _prev: ActionResult, formData: FormData): Promise<ActionResult> {
  const session = await requireAdmin();
  const parsed = capabilitySchema.safeParse(formObject(formData, ["productIds"]));
  if (!parsed.success) return zodErrors(parsed.error);
  const { productIds, ...d } = parsed.data;
  let savedId = id;
  try {
    const slug = await resolveSlug(d.slug, d.title, async (candidate) =>
      Boolean(await prisma.capability.findFirst({ where: { slug: candidate, ...(id ? { id: { not: id } } : {}) } })),
    );
    const data = { ...d, slug };
    const saved = id
      ? await prisma.capability.update({ where: { id }, data: { ...data, products: { set: productIds.map((pid) => ({ id: pid })) } } })
      : await prisma.capability.create({ data: { ...data, sortOrder: await prisma.capability.count(), products: { connect: productIds.map((pid) => ({ id: pid })) } } });
    savedId = saved.id;
    await audit({ actor: actorFromSession(session), action: id ? "capability.update" : "capability.create", entityType: "Capability", entityId: saved.id, summary: `${id ? "Updated" : "Added"} focus area “${saved.title}” (${saved.status.toLowerCase()})` });
    refreshPublic("/admin/capabilities");
  } catch (error) {
    return prismaErrorResult(error, "focus area");
  }
  if (!id && savedId) redirect(`/admin/capabilities/${savedId}?created=1`);
  return { ok: true, message: "Focus area saved." };
}

export async function setCapabilityStatus(id: string, status: PublishStatus): Promise<void> {
  const session = await requireAdmin();
  const capability = await prisma.capability.findUnique({ where: { id } });
  if (!capability) return;
  await prisma.capability.update({ where: { id }, data: { status } });
  await audit({ actor: actorFromSession(session), action: `capability.${status.toLowerCase()}`, entityType: "Capability", entityId: id, summary: `Set “${capability.title}” to ${status.toLowerCase()}` });
  refreshPublic("/admin/capabilities");
}

export async function publishAllDraftCapabilities(): Promise<void> {
  const session = await requireAdmin();
  const result = await prisma.capability.updateMany({ where: { status: "DRAFT" }, data: { status: "PUBLISHED" } });
  await audit({ actor: actorFromSession(session), action: "capability.publish_all", entityType: "Capability", summary: `Published ${result.count} reviewed focus areas` });
  refreshPublic("/admin/capabilities");
}

export async function moveCapability(id: string, direction: "up" | "down"): Promise<void> {
  await requireAdmin();
  const items = await prisma.capability.findMany({ orderBy: [{ sortOrder: "asc" }, { title: "asc" }], select: { id: true, sortOrder: true } });
  await reorder(items, id, direction, (itemId, sortOrder) => prisma.capability.update({ where: { id: itemId }, data: { sortOrder } }), (ops) => prisma.$transaction(ops));
  refreshPublic("/admin/capabilities");
}

export async function deleteCapability(id: string): Promise<void> {
  const session = await requireAdmin();
  const capability = await prisma.capability.findUnique({ where: { id }, select: { title: true } });
  if (!capability) redirect("/admin/capabilities");
  await prisma.capability.delete({ where: { id } });
  await audit({ actor: actorFromSession(session), action: "capability.delete", entityType: "Capability", entityId: id, summary: `Deleted focus area “${capability.title}”` });
  refreshPublic("/admin/capabilities");
  redirect("/admin/capabilities?deleted=1");
}

// ---------------------------------------------------------------------------
// Principles (philosophy)
// ---------------------------------------------------------------------------

export async function savePrinciple(id: string | null, _prev: ActionResult, formData: FormData): Promise<ActionResult> {
  const session = await requireAdmin();
  const parsed = principleSchema.safeParse(formObject(formData));
  if (!parsed.success) return zodErrors(parsed.error);
  try {
    const saved = id
      ? await prisma.principle.update({ where: { id }, data: parsed.data })
      : await prisma.principle.create({ data: { ...parsed.data, sortOrder: await prisma.principle.count() } });
    await audit({ actor: actorFromSession(session), action: id ? "principle.update" : "principle.create", entityType: "Principle", entityId: saved.id, summary: `Saved principle “${saved.title}”` });
    refreshPublic("/admin/company/principles");
    return { ok: true, message: id ? "Principle saved." : "Principle added." };
  } catch (error) {
    return prismaErrorResult(error, "principle");
  }
}

export async function movePrinciple(id: string, direction: "up" | "down"): Promise<void> {
  await requireAdmin();
  const items = await prisma.principle.findMany({ orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }], select: { id: true, sortOrder: true } });
  await reorder(items, id, direction, (itemId, sortOrder) => prisma.principle.update({ where: { id: itemId }, data: { sortOrder } }), (ops) => prisma.$transaction(ops));
  refreshPublic("/admin/company/principles");
}

export async function deletePrinciple(id: string): Promise<void> {
  const session = await requireAdmin();
  const principle = await prisma.principle.findUnique({ where: { id } });
  if (!principle) return;
  await prisma.principle.delete({ where: { id } });
  await audit({ actor: actorFromSession(session), action: "principle.delete", entityType: "Principle", entityId: id, summary: `Deleted principle “${principle.title}”` });
  refreshPublic("/admin/company/principles");
}
