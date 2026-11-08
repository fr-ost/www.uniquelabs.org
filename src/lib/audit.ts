import { prisma } from "@/lib/db";
import type { Prisma } from "@/generated/prisma/client";

export interface AuditActor {
  id?: string | null;
  label: string;
}

export interface AuditEntry {
  actor: AuditActor;
  action: string;
  summary: string;
  entityType?: string;
  entityId?: string;
  metadata?: Prisma.InputJsonValue;
  ipHash?: string | null;
}

/**
 * Append-only audit trail of administrative actions. Failures are logged but
 * never break the user-facing operation.
 */
export async function audit(entry: AuditEntry): Promise<void> {
  try {
    await prisma.auditLog.create({
      data: {
        actorId: entry.actor.id ?? null,
        actorLabel: entry.actor.label.slice(0, 200),
        action: entry.action.slice(0, 100),
        summary: entry.summary.slice(0, 500),
        entityType: entry.entityType?.slice(0, 60) ?? null,
        entityId: entry.entityId?.slice(0, 100) ?? null,
        metadata: entry.metadata ?? undefined,
        ipHash: entry.ipHash ?? null,
      },
    });
  } catch (error) {
    console.error("[audit] failed to write audit entry", entry.action, error);
  }
}

export function actorFromSession(session: { user: { id: string; email: string } }): AuditActor {
  return { id: session.user.id, label: session.user.email };
}
