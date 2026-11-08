import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CandidateDetail, KeyValueList } from "@/components/admin/candidate-detail";
import { ApproveProductForm } from "@/components/admin/forms/approve-forms";
import { prisma } from "@/lib/db";
import { PLATFORM_LABELS } from "@/lib/labels";
import { approveProductCandidate } from "@/server/actions/candidates";
import type { Platform } from "@/generated/prisma/enums";
import { requireAdmin } from "@/lib/auth/guards";

export const metadata: Metadata = { title: "Review product candidate" };

interface ProductData {
  names?: Array<{ display: string; weight: number }>;
  chromeStoreIds?: string[];
  urls?: { store?: string[]; deployment?: string[]; site?: string[] };
  platforms?: string[];
  description?: string | null;
  sourceCount?: number;
}

const STAGE_TO_RELEASE: Record<string, string> = { PUBLISHED: "AVAILABLE", BETA: "BETA", CANCELLED: "DISCONTINUED" };

export default async function ProductCandidatePage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;
  const candidate = await prisma.importCandidate.findUnique({ where: { id }, include: { evidence: { orderBy: { sourceTimestamp: "asc" } }, product: { select: { id: true, name: true } } } });
  if (!candidate || candidate.kind !== "PRODUCT") notFound();
  const [categories, products] = await Promise.all([
    prisma.category.findMany({ orderBy: { sortOrder: "asc" } }),
    prisma.product.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } }),
  ]);
  const data = (candidate.data ?? {}) as ProductData;
  const storeUrls = data.urls?.store ?? [];
  const platforms = (data.platforms ?? []).filter((p): p is Platform => p in PLATFORM_LABELS);

  return (
    <CandidateDetail
      candidate={candidate}
      evidence={candidate.evidence}
      listHref="/admin/candidates/products"
      listLabel="Product candidates"
      linkedRecord={candidate.product ? { href: `/admin/products/${candidate.product.id}`, label: `Open product “${candidate.product.name}”` } : null}
      extracted={
        <KeyValueList
          items={[
            { label: "Name variants", value: (data.names ?? []).map((n) => n.display).join(", ") },
            { label: "Platforms", value: platforms.map((p) => PLATFORM_LABELS[p]).join(", ") },
            { label: "Store listings", value: storeUrls.length ? <ul>{storeUrls.map((u) => <li key={u} className="truncate">{u}</li>)}</ul> : null },
            { label: "Deployments", value: (data.urls?.deployment ?? []).join(", ") },
            { label: "Other URLs mentioned by you", value: (data.urls?.site ?? []).slice(0, 6).join(", ") },
            { label: "Chrome Web Store id", value: (data.chromeStoreIds ?? []).join(", ") },
            { label: "Description found", value: data.description ?? null },
            { label: "Sources", value: String(data.sourceCount ?? candidate.evidence.length) },
          ]}
        />
      }
      approval={
        <ApproveProductForm
          action={approveProductCandidate.bind(null, candidate.id)}
          categories={categories.map((c) => ({ value: c.id, label: c.name }))}
          products={products.map((p) => ({ value: p.id, label: p.name }))}
          values={{
            name: candidate.title,
            summary: candidate.summary ?? data.description ?? "",
            websiteUrl: data.urls?.deployment?.[0] ?? data.urls?.site?.[0] ?? "",
            primaryCtaUrl: storeUrls[0] ?? "",
            platforms,
            stage: STAGE_TO_RELEASE[candidate.productStage ?? ""] ?? "COMING_SOON",
          }}
        />
      }
    />
  );
}
