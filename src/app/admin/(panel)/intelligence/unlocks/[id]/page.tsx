import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ConfirmAction } from "@/components/admin/confirm";
import { TokenUnlockForm } from "@/components/admin/forms/intelligence-forms";
import { AdminPageHeader, Pill, StatusBadge } from "@/components/admin/ui";
import { requireAdmin } from "@/lib/auth/guards";
import { prisma } from "@/lib/db";
import { deleteTokenUnlock, saveTokenUnlock } from "@/server/actions/intelligence";

export const metadata: Metadata = { title: "Edit token unlock" };

export default async function EditUnlockPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ created?: string; needsVerification?: string }> }) {
  await requireAdmin();
  const [{ id }, sp] = await Promise.all([params, searchParams]);
  const isNew = id === "new";
  const unlock = isNew ? null : await prisma.tokenUnlock.findUnique({ where: { id } });
  if (!isNew && !unlock) notFound();
  const title = unlock ? `${unlock.tokenSymbol} · ${unlock.unlockAt.toISOString().slice(0, 10)}` : "Add token unlock";
  return (
    <div className="space-y-6">
      <AdminPageHeader
        breadcrumbs={[
          { label: "Intelligence", href: "/admin/intelligence" },
          { label: "Token unlocks", href: "/admin/intelligence/unlocks" },
          { label: isNew ? "New" : title },
        ]}
        title={title}
        actions={
          unlock ? (
            <>
              <StatusBadge status={unlock.status} />
              {unlock.verifiedAt ? <Pill tone="good">Verified</Pill> : <Pill tone="warn">Unverified</Pill>}
              <ConfirmAction action={deleteTokenUnlock.bind(null, unlock.id)} trigger="Delete" size="md" title={`Delete the ${unlock.tokenSymbol} unlock?`} confirmLabel="Delete" />
            </>
          ) : null
        }
      />
      {sp.created ? <p className="rounded-lg border border-live/30 bg-live/10 px-4 py-2 text-sm text-live">Unlock added.</p> : null}
      {sp.needsVerification ? <p className="rounded-lg border border-beta/30 bg-beta/10 px-4 py-2 text-sm text-beta">Verify this unlock before publishing it.</p> : null}
      <TokenUnlockForm
        action={saveTokenUnlock.bind(null, unlock?.id ?? null)}
        isNew={isNew}
        values={{
          tokenName: unlock?.tokenName ?? "",
          tokenSymbol: unlock?.tokenSymbol ?? "",
          cmcSlug: unlock?.cmcSlug ?? "",
          unlockAt: unlock ? unlock.unlockAt.toISOString().slice(0, 16) : "",
          amount: unlock?.amount != null ? unlock.amount.toString() : "",
          percentOfSupply: unlock?.percentOfSupply != null ? unlock.percentOfSupply.toString() : "",
          allocation: unlock?.allocation ?? "",
          unlockType: unlock?.unlockType ?? "CLIFF",
          description: unlock?.description ?? "",
          sourceUrl: unlock?.sourceUrl ?? "",
          verified: Boolean(unlock?.verifiedAt),
          status: unlock?.status ?? "DRAFT",
        }}
      />
    </div>
  );
}
