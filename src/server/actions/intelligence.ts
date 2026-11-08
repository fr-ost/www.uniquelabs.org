"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { actorFromSession, audit } from "@/lib/audit";
import { requireAdmin } from "@/lib/auth/guards";
import { marketCache } from "@/lib/market/service";
import { formObject, zodErrors, type ActionResult } from "@/lib/validation/fields";
import { airdropSchema, intelligenceSettingsSchema, tokenUnlockSchema } from "@/lib/validation/intelligence";
import { prismaErrorResult, refreshPublic } from "@/server/admin-helpers";
import type { PublishStatus } from "@/generated/prisma/enums";

const PUBLISH_STATUSES: PublishStatus[] = ["DRAFT", "PUBLISHED", "ARCHIVED"];

function assertStatus(status: unknown): asserts status is PublishStatus {
  if (!PUBLISH_STATUSES.includes(status as PublishStatus)) throw new Error("Invalid status.");
}

// ---------------------------------------------------------------------------
// Settings
// ---------------------------------------------------------------------------

export async function saveIntelligenceSettings(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  const session = await requireAdmin();
  const parsed = intelligenceSettingsSchema.safeParse(formObject(formData));
  if (!parsed.success) return zodErrors(parsed.error);
  const { refreshMinutes, ...rest } = parsed.data;
  const data = { ...rest, refreshSeconds: Math.round(refreshMinutes * 60) };
  try {
    await prisma.intelligenceSettings.upsert({ where: { id: 1 }, update: data, create: { id: 1, ...data } });
    await audit({
      actor: actorFromSession(session),
      action: "intelligence.settings",
      entityType: "IntelligenceSettings",
      entityId: "1",
      summary: `Updated Intelligence settings (${data.enabled ? "public" : "hidden"}, ${data.assetLimit} assets, refresh ${refreshMinutes} min)`,
    });
    refreshPublic("/admin/intelligence");
  } catch (error) {
    return prismaErrorResult(error, "settings");
  }
  return { ok: true, message: "Settings saved." };
}

/** Drops cached market data so the next visitor triggers a fresh fetch. */
export async function refreshMarketData(): Promise<void> {
  const session = await requireAdmin();
  marketCache.clear();
  await audit({ actor: actorFromSession(session), action: "intelligence.refresh", entityType: "IntelligenceSettings", entityId: "1", summary: "Cleared the market data cache" });
  refreshPublic("/admin/intelligence");
}

// ---------------------------------------------------------------------------
// Airdrops
// ---------------------------------------------------------------------------

export async function saveAirdrop(id: string | null, _prev: ActionResult, formData: FormData): Promise<ActionResult> {
  const session = await requireAdmin();
  const parsed = airdropSchema.safeParse(formObject(formData));
  if (!parsed.success) return zodErrors(parsed.error);
  const { verified, ...d } = parsed.data;
  if (d.status === "PUBLISHED" && !verified) {
    return { ok: false, message: "Only verified airdrops can be published.", fieldErrors: { verified: "Confirm you checked this airdrop on the project's official channels." } };
  }
  let savedId = id;
  try {
    const existing = id ? await prisma.airdrop.findUnique({ where: { id } }) : null;
    if (id && !existing) return { ok: false, message: "This airdrop no longer exists." };
    const data = { ...d, verifiedAt: verified ? (existing?.verifiedAt ?? new Date()) : null };
    const saved = id ? await prisma.airdrop.update({ where: { id }, data }) : await prisma.airdrop.create({ data });
    savedId = saved.id;
    await audit({
      actor: actorFromSession(session),
      action: id ? "airdrop.update" : "airdrop.create",
      entityType: "Airdrop",
      entityId: saved.id,
      summary: `${id ? "Updated" : "Added"} airdrop “${saved.projectName}” (${saved.status.toLowerCase()})`,
    });
    refreshPublic("/admin/intelligence/airdrops");
  } catch (error) {
    return prismaErrorResult(error, "airdrop");
  }
  if (!id && savedId) redirect(`/admin/intelligence/airdrops/${savedId}?created=1`);
  return { ok: true, message: "Airdrop saved." };
}

export async function setAirdropStatus(id: string, status: PublishStatus): Promise<void> {
  const session = await requireAdmin();
  assertStatus(status);
  const airdrop = await prisma.airdrop.findUnique({ where: { id } });
  if (!airdrop) return;
  if (status === "PUBLISHED" && !airdrop.verifiedAt) redirect(`/admin/intelligence/airdrops/${id}?needsVerification=1`);
  await prisma.airdrop.update({ where: { id }, data: { status } });
  await audit({ actor: actorFromSession(session), action: `airdrop.${status.toLowerCase()}`, entityType: "Airdrop", entityId: id, summary: `Set airdrop “${airdrop.projectName}” to ${status.toLowerCase()}` });
  refreshPublic("/admin/intelligence/airdrops");
}

export async function deleteAirdrop(id: string): Promise<void> {
  const session = await requireAdmin();
  const airdrop = await prisma.airdrop.findUnique({ where: { id }, select: { projectName: true } });
  if (airdrop) {
    await prisma.airdrop.delete({ where: { id } });
    await audit({ actor: actorFromSession(session), action: "airdrop.delete", entityType: "Airdrop", entityId: id, summary: `Deleted airdrop “${airdrop.projectName}”` });
    refreshPublic("/admin/intelligence/airdrops");
  }
  redirect("/admin/intelligence/airdrops");
}

// ---------------------------------------------------------------------------
// Token unlocks
// ---------------------------------------------------------------------------

export async function saveTokenUnlock(id: string | null, _prev: ActionResult, formData: FormData): Promise<ActionResult> {
  const session = await requireAdmin();
  const parsed = tokenUnlockSchema.safeParse(formObject(formData));
  if (!parsed.success) return zodErrors(parsed.error);
  const { verified, unlockAt, ...d } = parsed.data;
  if (d.status === "PUBLISHED" && !verified) {
    return { ok: false, message: "Only verified unlocks can be published.", fieldErrors: { verified: "Confirm the schedule against the linked source." } };
  }
  let savedId = id;
  try {
    const existing = id ? await prisma.tokenUnlock.findUnique({ where: { id } }) : null;
    if (id && !existing) return { ok: false, message: "This unlock no longer exists." };
    const data = { ...d, unlockAt: unlockAt!, verifiedAt: verified ? (existing?.verifiedAt ?? new Date()) : null };
    const saved = id ? await prisma.tokenUnlock.update({ where: { id }, data }) : await prisma.tokenUnlock.create({ data });
    savedId = saved.id;
    await audit({
      actor: actorFromSession(session),
      action: id ? "unlock.update" : "unlock.create",
      entityType: "TokenUnlock",
      entityId: saved.id,
      summary: `${id ? "Updated" : "Added"} ${saved.tokenSymbol} unlock on ${saved.unlockAt.toISOString().slice(0, 10)} (${saved.status.toLowerCase()})`,
    });
    refreshPublic("/admin/intelligence/unlocks");
  } catch (error) {
    return prismaErrorResult(error, "unlock");
  }
  if (!id && savedId) redirect(`/admin/intelligence/unlocks/${savedId}?created=1`);
  return { ok: true, message: "Unlock saved." };
}

export async function setTokenUnlockStatus(id: string, status: PublishStatus): Promise<void> {
  const session = await requireAdmin();
  assertStatus(status);
  const unlock = await prisma.tokenUnlock.findUnique({ where: { id } });
  if (!unlock) return;
  if (status === "PUBLISHED" && !unlock.verifiedAt) redirect(`/admin/intelligence/unlocks/${id}?needsVerification=1`);
  await prisma.tokenUnlock.update({ where: { id }, data: { status } });
  await audit({ actor: actorFromSession(session), action: `unlock.${status.toLowerCase()}`, entityType: "TokenUnlock", entityId: id, summary: `Set ${unlock.tokenSymbol} unlock to ${status.toLowerCase()}` });
  refreshPublic("/admin/intelligence/unlocks");
}

export async function deleteTokenUnlock(id: string): Promise<void> {
  const session = await requireAdmin();
  const unlock = await prisma.tokenUnlock.findUnique({ where: { id }, select: { tokenSymbol: true, unlockAt: true } });
  if (unlock) {
    await prisma.tokenUnlock.delete({ where: { id } });
    await audit({ actor: actorFromSession(session), action: "unlock.delete", entityType: "TokenUnlock", entityId: id, summary: `Deleted ${unlock.tokenSymbol} unlock (${unlock.unlockAt.toISOString().slice(0, 10)})` });
    refreshPublic("/admin/intelligence/unlocks");
  }
  redirect("/admin/intelligence/unlocks");
}
