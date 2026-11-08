import type { Metadata } from "next";
import { ArrowDown, ArrowUp } from "lucide-react";
import { ConfirmAction } from "@/components/admin/confirm";
import { InlineSubmit } from "@/components/admin/form";
import { NamedItemForm } from "@/components/admin/forms/simple-forms";
import { AdminPageHeader, Panel } from "@/components/admin/ui";
import { prisma } from "@/lib/db";
import { deleteCategory, moveCategory, saveCategory } from "@/server/actions/products";

export const metadata: Metadata = { title: "Product categories" };

export default async function CategoriesPage() {
  const categories = await prisma.category.findMany({
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    include: { _count: { select: { products: true } } },
  });
  return (
    <div className="space-y-6">
      <AdminPageHeader
        breadcrumbs={[{ label: "Products", href: "/admin/products" }, { label: "Categories" }]}
        title="Product categories"
        description="Categories group products in the directory filters. Empty categories are never shown publicly."
      />
      <Panel title="Add a category">
        <NamedItemForm action={saveCategory.bind(null, null)} values={{ name: "", slug: "", description: "" }} submitLabel="Add category" />
      </Panel>
      <div className="space-y-3">
        {categories.map((category) => (
          <Panel
            key={category.id}
            title={category.name}
            description={`/${category.slug} · ${category._count.products} product${category._count.products === 1 ? "" : "s"}`}
            actions={
              <>
                <form action={moveCategory.bind(null, category.id, "up")}>
                  <InlineSubmit variant="ghost" title="Move up">
                    <ArrowUp className="h-3.5 w-3.5" aria-label="Move up" />
                  </InlineSubmit>
                </form>
                <form action={moveCategory.bind(null, category.id, "down")}>
                  <InlineSubmit variant="ghost" title="Move down">
                    <ArrowDown className="h-3.5 w-3.5" aria-label="Move down" />
                  </InlineSubmit>
                </form>
                <ConfirmAction
                  action={deleteCategory.bind(null, category.id)}
                  trigger="Delete"
                  title={`Delete “${category.name}”?`}
                  body="Products in this category are kept and become uncategorised."
                  confirmLabel="Delete category"
                />
              </>
            }
          >
            <NamedItemForm
              action={saveCategory.bind(null, category.id)}
              values={{ name: category.name, slug: category.slug, description: category.description ?? "" }}
              submitLabel="Save"
            />
          </Panel>
        ))}
      </div>
    </div>
  );
}
