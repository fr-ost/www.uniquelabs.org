import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ConfirmAction } from "@/components/admin/confirm";
import { AirdropForm } from "@/components/admin/forms/intelligence-forms";
import { AdminPageHeader, Pill, StatusBadge } from "@/components/admin/ui";
import { requireAdmin } from "@/lib/auth/guards";
import { prisma } from "@/lib/db";
import { deleteAirdrop, saveAirdrop } from "@/server/actions/intelligence";

export const metadata: Metadata = { title: "Edit airdrop" };

function dateValue(d: Date | null | undefined) {
  return d ? d.toISOString().slice(0, 10) : "";
}

export default async function EditAirdropPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ created?: string; needsVerification?: string }> }) {
  await requireAdmin();
  const [{ id }, sp] = await Promise.all([params, searchParams]);
  const isNew = id === "new";
  const airdrop = isNew ? null : await prisma.airdrop.findUnique({ where: { id } });
  if (!isNew && !airdrop) notFound();
  return (
    <div className="space-y-6">
      <AdminPageHeader
        breadcrumbs={[
          { label: "Intelligence", href: "/admin/intelligence" },
          { label: "Airdrops", href: "/admin/intelligence/airdrops" },
          { label: isNew ? "New" : airdrop!.projectName },
        ]}
        title={isNew ? "Add airdrop" : airdrop!.projectName}
        actions={
          airdrop ? (
            <>
              <StatusBadge status={airdrop.status} />
              {airdrop.verifiedAt ? <Pill tone="good">Verified</Pill> : <Pill tone="warn">Unverified</Pill>}
              <ConfirmAction action={deleteAirdrop.bind(null, airdrop.id)} trigger="Delete" size="md" title={`Delete “${airdrop.projectName}”?`} confirmLabel="Delete" />
            </>
          ) : null
        }
      />
      {sp.created ? <p className="rounded-lg border border-live/30 bg-live/10 px-4 py-2 text-sm text-live">Airdrop added.</p> : null}
      {sp.needsVerification ? <p className="rounded-lg border border-beta/30 bg-beta/10 px-4 py-2 text-sm text-beta">Verify this airdrop before publishing it.</p> : null}
      <AirdropForm
        action={saveAirdrop.bind(null, airdrop?.id ?? null)}
        isNew={isNew}
        values={{
          projectName: airdrop?.projectName ?? "",
          tokenSymbol: airdrop?.tokenSymbol ?? "",
          cmcSlug: airdrop?.cmcSlug ?? "",
          description: airdrop?.description ?? "",
          reward: airdrop?.reward ?? "",
          requirements: airdrop?.requirements ?? "",
          startsAt: dateValue(airdrop?.startsAt),
          endsAt: dateValue(airdrop?.endsAt),
          officialUrl: airdrop?.officialUrl ?? "",
          sourceUrl: airdrop?.sourceUrl ?? "",
          verified: Boolean(airdrop?.verifiedAt),
          status: airdrop?.status ?? "DRAFT",
        }}
      />
    </div>
  );
}
