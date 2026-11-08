import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ExternalLink, Eye } from "lucide-react";
import { ConfirmAction } from "@/components/admin/confirm";
import { ProductForm, type ProductFormValues } from "@/components/admin/forms/product-form";
import { EvidenceList } from "@/components/admin/evidence-list";
import { AdminPageHeader, Panel, Pill, StatusBadge } from "@/components/admin/ui";
import { prisma } from "@/lib/db";
import { adminMediaSelect, toDateInputValue, toPicked } from "@/lib/admin/data";
import { deleteProduct, saveProduct } from "@/server/actions/products";
import { requireAdmin } from "@/lib/auth/guards";

export const metadata: Metadata = { title: "Edit product" };

type Params = Promise<{ id: string }>;
type Search = Promise<{ created?: string; needsVerification?: string }>;

export default async function EditProductPage({ params, searchParams }: { params: Params; searchParams: Search }) {
  await requireAdmin();
  const [{ id }, sp] = await Promise.all([params, searchParams]);
  const isNew = id === "new";

  const [product, categories] = await Promise.all([
    isNew
      ? null
      : prisma.product.findUnique({
          where: { id },
          include: {
            logo: { select: adminMediaSelect },
            cover: { select: adminMediaSelect },
            features: { orderBy: { sortOrder: "asc" } },
            links: { orderBy: { sortOrder: "asc" } },
            images: { orderBy: { sortOrder: "asc" }, include: { media: { select: adminMediaSelect } } },
            evidence: { orderBy: { sourceTimestamp: "asc" } },
          },
        }),
    prisma.category.findMany({ orderBy: [{ sortOrder: "asc" }, { name: "asc" }] }),
  ]);
  if (!isNew && !product) notFound();

  const values: ProductFormValues = {
    name: product?.name ?? "",
    slug: product?.slug ?? "",
    tagline: product?.tagline ?? "",
    summary: product?.summary ?? "",
    description: product?.description ?? "",
    audience: product?.audience ?? "",
    categoryId: product?.categoryId ?? "",
    platforms: product?.platforms ?? [],
    stage: product?.stage ?? "COMING_SOON",
    pricing: product?.pricing ?? "UNSPECIFIED",
    websiteUrl: product?.websiteUrl ?? "",
    primaryCtaUrl: product?.primaryCtaUrl ?? "",
    primaryCtaLabel: product?.primaryCtaLabel ?? "",
    releaseDate: toDateInputValue(product?.releaseDate),
    releaseDatePrecision: product?.releaseDatePrecision ?? "DAY",
    releaseDateVerified: product?.releaseDateVerified ?? false,
    accentColor: product?.accentColor ?? "",
    logo: toPicked(product?.logo),
    cover: toPicked(product?.cover),
    images: (product?.images ?? []).flatMap((image) => {
      const media = toPicked(image.media);
      return media ? [{ media, caption: image.caption }] : [];
    }),
    features: (product?.features ?? []).map((f) => ({ title: f.title, description: f.description })),
    links: (product?.links ?? []).map((l) => ({ kind: l.kind, label: l.label, url: l.url })),
    seoTitle: product?.seoTitle ?? "",
    seoDescription: product?.seoDescription ?? "",
    featured: product?.featured ?? false,
    verified: Boolean(product?.verifiedAt),
    status: product?.status ?? "DRAFT",
  };

  return (
    <div className="space-y-6">
      <AdminPageHeader
        breadcrumbs={[{ label: "Products", href: "/admin/products" }, { label: isNew ? "New product" : (product?.name ?? "") }]}
        title={isNew ? "New product" : product!.name}
        description={
          isNew ? "Create a product record. It stays a private draft until you verify and publish it." : undefined
        }
        actions={
          product ? (
            <>
              <StatusBadge status={product.status} />
              {product.verifiedAt ? <Pill tone="good">Verified</Pill> : <Pill tone="warn">Unverified</Pill>}
              <a href={`/api/admin/preview?path=/products/${product.slug}`} target="_blank" rel="noopener noreferrer" className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-white/12 px-3 text-sm text-ink-100 hover:border-white/25">
                <Eye aria-hidden className="h-4 w-4" /> Preview
              </a>
              {product.status === "PUBLISHED" ? (
                <a href={`/products/${product.slug}`} target="_blank" rel="noopener noreferrer" className="inline-flex h-9 items-center gap-1.5 rounded-lg px-3 text-sm text-ink-300 hover:text-ink-50">
                  <ExternalLink aria-hidden className="h-4 w-4" /> View live
                </a>
              ) : null}
              <ConfirmAction
                action={deleteProduct.bind(null, product.id)}
                trigger="Delete"
                size="md"
                title={`Delete “${product.name}”?`}
                body="This permanently removes the product record. Uploaded images stay in the media library."
                confirmLabel="Delete product"
              />
            </>
          ) : null
        }
      />

      {sp.created ? <p className="rounded-lg border border-live/30 bg-live/10 px-4 py-2 text-sm text-live">Product created as a draft.</p> : null}
      {sp.needsVerification ? (
        <p className="rounded-lg border border-beta/30 bg-beta/10 px-4 py-2 text-sm text-beta">
          This product must be marked “Verified by owner” before it can be published.
        </p>
      ) : null}

      <div className="grid gap-6 xl:grid-cols-[1fr_20rem]">
        <ProductForm
          action={saveProduct.bind(null, product?.id ?? null)}
          values={values}
          categories={categories.map((c) => ({ value: c.id, label: c.name }))}
          isNew={isNew}
        />
        {product && product.evidence.length > 0 ? (
          <aside className="space-y-4">
            <Panel title="Source evidence" description="Private provenance from imports. Never shown publicly.">
              <EvidenceList evidence={product.evidence} />
            </Panel>
          </aside>
        ) : null}
      </div>
    </div>
  );
}
