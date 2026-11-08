import type { Metadata } from "next";
import Link from "next/link";
import { ArrowDown, ArrowUp, Eye, Plus, Star } from "lucide-react";
import { ConfirmAction } from "@/components/admin/confirm";
import { InlineSubmit } from "@/components/admin/form";
import { AdminButtonLink, AdminPageHeader, AdminTable, EmptyPanel, Pill, StatusBadge, Td, Th } from "@/components/admin/ui";
import { prisma } from "@/lib/db";
import { mediaUrl } from "@/lib/media/storage";
import { RELEASE_STAGE_LABELS } from "@/lib/labels";
import { formatDate } from "@/lib/utils";
import { deleteProduct, moveProduct, setProductStatus, toggleProductFeatured } from "@/server/actions/products";

export const metadata: Metadata = { title: "Products" };

export default async function AdminProductsPage({ searchParams }: { searchParams: Promise<{ deleted?: string }> }) {
  const [{ deleted }, products] = await Promise.all([
    searchParams,
    prisma.product.findMany({
      orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
      select: {
        id: true,
        name: true,
        slug: true,
        status: true,
        stage: true,
        featured: true,
        verifiedAt: true,
        isPlaceholder: true,
        updatedAt: true,
        category: { select: { name: true } },
        logo: { select: { id: true, fileName: true } },
        _count: { select: { evidence: true } },
      },
    }),
  ]);

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Products"
        description="Every product shown on the website. Only Published + verified products are public."
        actions={
          <>
            <AdminButtonLink href="/admin/products/categories">Categories</AdminButtonLink>
            <AdminButtonLink href="/admin/products/new" variant="primary">
              <Plus aria-hidden className="h-4 w-4" /> New product
            </AdminButtonLink>
          </>
        }
      />
      {deleted ? <p className="rounded-lg border border-white/10 bg-white/[0.03] px-4 py-2 text-sm text-ink-300">Product deleted.</p> : null}

      {products.length === 0 ? (
        <EmptyPanel
          title="No products yet"
          body="Add a product manually, or import candidates from your Claude history and approve them."
          action={
            <div className="flex gap-2">
              <AdminButtonLink href="/admin/products/new" variant="primary">
                New product
              </AdminButtonLink>
              <AdminButtonLink href="/admin/imports/claude">Import from Claude</AdminButtonLink>
            </div>
          }
        />
      ) : (
        <AdminTable>
          <thead>
            <tr>
              <Th className="w-20">Order</Th>
              <Th>Product</Th>
              <Th>Status</Th>
              <Th>Lifecycle</Th>
              <Th>Updated</Th>
              <Th className="text-right">Actions</Th>
            </tr>
          </thead>
          <tbody>
            {products.map((product, index) => (
              <tr key={product.id} className="hover:bg-white/[0.02]">
                <Td>
                  <div className="flex gap-1">
                    <form action={moveProduct.bind(null, product.id, "up")}>
                      <InlineSubmit variant="ghost" title="Move up">
                        <ArrowUp className="h-3.5 w-3.5" aria-label="Move up" />
                      </InlineSubmit>
                    </form>
                    <form action={moveProduct.bind(null, product.id, "down")}>
                      <InlineSubmit variant="ghost" title="Move down">
                        <ArrowDown className="h-3.5 w-3.5" aria-label="Move down" />
                      </InlineSubmit>
                    </form>
                  </div>
                  <span className="sr-only">Position {index + 1}</span>
                </Td>
                <Td>
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-white/10 bg-ink-800">
                      {product.logo ? (
                        // eslint-disable-next-line @next/next/no-img-element -- admin thumbnail
                        <img src={mediaUrl(product.logo)} alt="" className="h-full w-full object-contain p-1" />
                      ) : (
                        <span className="text-xs font-semibold text-ink-300">{product.name.charAt(0)}</span>
                      )}
                    </div>
                    <div className="min-w-0">
                      <Link href={`/admin/products/${product.id}`} className="font-medium text-ink-50 hover:underline">
                        {product.name}
                      </Link>
                      <div className="mt-0.5 flex flex-wrap items-center gap-1.5 text-xs text-ink-500">
                        <span>/{product.slug}</span>
                        {product.category ? <span>· {product.category.name}</span> : null}
                        {product._count.evidence > 0 ? <Pill tone="info">Imported · {product._count.evidence} sources</Pill> : null}
                        {product.isPlaceholder ? <Pill tone="warn">Sample</Pill> : null}
                      </div>
                    </div>
                  </div>
                </Td>
                <Td>
                  <div className="flex flex-wrap items-center gap-1.5">
                    <StatusBadge status={product.status} />
                    {product.verifiedAt ? <Pill tone="good">Verified</Pill> : <Pill tone="warn">Unverified</Pill>}
                    {product.featured ? <Pill tone="accent">Featured</Pill> : null}
                  </div>
                </Td>
                <Td className="text-ink-300">{RELEASE_STAGE_LABELS[product.stage]}</Td>
                <Td className="text-xs text-ink-400">{formatDate(product.updatedAt, "DAY", "short")}</Td>
                <Td>
                  <div className="flex flex-wrap justify-end gap-1.5">
                    <form action={toggleProductFeatured.bind(null, product.id)}>
                      <InlineSubmit variant="ghost" title={product.featured ? "Unfeature" : "Feature on homepage"}>
                        <Star className={product.featured ? "h-3.5 w-3.5 fill-signal-500 text-signal-500" : "h-3.5 w-3.5"} aria-label="Toggle featured" />
                      </InlineSubmit>
                    </form>
                    <a href={`/api/admin/preview?path=/products/${product.slug}`} target="_blank" rel="noopener noreferrer" className="inline-flex h-8 items-center gap-1 rounded-lg px-2.5 text-xs text-ink-300 hover:bg-white/[0.05] hover:text-ink-50" title="Preview">
                      <Eye className="h-3.5 w-3.5" aria-hidden /> Preview
                    </a>
                    {product.status === "PUBLISHED" ? (
                      <form action={setProductStatus.bind(null, product.id, "DRAFT")}>
                        <InlineSubmit>Unpublish</InlineSubmit>
                      </form>
                    ) : product.verifiedAt ? (
                      <form action={setProductStatus.bind(null, product.id, "PUBLISHED")}>
                        <InlineSubmit variant="primary">Publish</InlineSubmit>
                      </form>
                    ) : (
                      <AdminButtonLink href={`/admin/products/${product.id}#publication`} size="sm">
                        Verify to publish
                      </AdminButtonLink>
                    )}
                    {product.status !== "ARCHIVED" ? (
                      <form action={setProductStatus.bind(null, product.id, "ARCHIVED")}>
                        <InlineSubmit variant="ghost">Archive</InlineSubmit>
                      </form>
                    ) : null}
                    <ConfirmAction
                      action={deleteProduct.bind(null, product.id)}
                      trigger="Delete"
                      title={`Delete “${product.name}”?`}
                      body="The product, its features, links and screenshot list are removed permanently. Uploaded images stay in the media library, and import candidates return to the review queue."
                      confirmLabel="Delete product"
                    />
                  </div>
                </Td>
              </tr>
            ))}
          </tbody>
        </AdminTable>
      )}
    </div>
  );
}
