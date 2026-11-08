import type { Metadata } from "next";
import Link from "next/link";
import { ProductCard } from "@/components/cards/product-card";
import { Reveal } from "@/components/motion/reveal";
import { ClosingCta, EmptyState } from "@/components/sections/shared-sections";
import { PageHero } from "@/components/ui/section";
import { getCompany, getProductCategories, getProductPlatforms, getProducts } from "@/lib/content/public";
import { PLATFORM_LABELS, RELEASE_STAGE_LABELS } from "@/lib/labels";
import { pageMetadata } from "@/lib/seo/metadata";
import { cn, pluralize } from "@/lib/utils";
import { Platform, ReleaseStage } from "@/generated/prisma/enums";

export async function generateMetadata(): Promise<Metadata> {
  const company = await getCompany();
  return pageMetadata({
    title: "Products",
    description: `Browse useful digital products from ${company.name} — Chrome extensions, web apps and utilities designed to make everyday digital life easier.`,
    path: "/products",
  });
}

type SearchParams = Promise<{ category?: string; platform?: string; status?: string }>;

function FilterChip({ href, active, children }: { href: string; active: boolean; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      scroll={false}
      aria-current={active ? "true" : undefined}
      className={cn(
        "inline-flex h-9 items-center rounded-full border px-4 text-sm transition-colors duration-300",
        active
          ? "border-ink-50 bg-ink-50 text-ink-950"
          : "border-white/10 text-ink-300 hover:border-white/25 hover:text-ink-50",
      )}
    >
      {children}
    </Link>
  );
}

function buildHref(current: Record<string, string | undefined>, key: string, value: string | undefined) {
  const params = new URLSearchParams();
  for (const [k, v] of Object.entries({ ...current, [key]: value })) {
    if (v) params.set(k, v);
  }
  const query = params.toString();
  return query ? `/products?${query}` : "/products";
}

export default async function ProductsPage({ searchParams }: { searchParams: SearchParams }) {
  const sp = await searchParams;
  const category = sp.category && /^[a-z0-9-]{1,80}$/.test(sp.category) ? sp.category : undefined;
  const platform = sp.platform && sp.platform in Platform ? (sp.platform as Platform) : undefined;
  const stage = sp.status && sp.status in ReleaseStage ? (sp.status as ReleaseStage) : undefined;

  const [products, allProducts, categories, platforms, company] = await Promise.all([
    getProducts({ category, platform, stage }),
    getProducts(),
    getProductCategories(),
    getProductPlatforms(),
    getCompany(),
  ]);
  const stages = [...new Set(allProducts.map((p) => p.stage))];
  const current = { category, platform, status: stage };
  const filtered = Boolean(category || platform || stage);

  return (
    <>
      <PageHero
        eyebrow="Products"
        title={
          <>
            The product directory<span className="text-signal-500">.</span>
          </>
        }
        description={`Useful products from the ${company.name} ecosystem — designed to simplify everyday digital experiences.`}
      />

      <section className="container-site py-14 md:py-20" aria-label="Product directory">
        {allProducts.length === 0 ? (
          <EmptyState
            title="No products published yet"
            body="Products appear here as soon as they are released. In the meantime, see what we focus on."
            action={{ href: "/what-we-do", label: "What we do" }}
          />
        ) : (
          <>
            <div className="flex flex-col gap-6 border-b border-white/[0.07] pb-8 lg:flex-row lg:items-end lg:justify-between">
              <div className="space-y-4">
                {categories.length > 1 ? (
                  <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Filter by category">
                    <span className="text-eyebrow mr-2 w-20 text-ink-500">Category</span>
                    <FilterChip href={buildHref(current, "category", undefined)} active={!category}>
                      All
                    </FilterChip>
                    {categories.map((c) => (
                      <FilterChip key={c.slug} href={buildHref(current, "category", c.slug)} active={category === c.slug}>
                        {c.name}
                      </FilterChip>
                    ))}
                  </div>
                ) : null}
                {platforms.length > 1 ? (
                  <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Filter by platform">
                    <span className="text-eyebrow mr-2 w-20 text-ink-500">Platform</span>
                    <FilterChip href={buildHref(current, "platform", undefined)} active={!platform}>
                      All
                    </FilterChip>
                    {platforms.map((p) => (
                      <FilterChip key={p} href={buildHref(current, "platform", p)} active={platform === p}>
                        {PLATFORM_LABELS[p]}
                      </FilterChip>
                    ))}
                  </div>
                ) : null}
                {stages.length > 1 ? (
                  <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Filter by status">
                    <span className="text-eyebrow mr-2 w-20 text-ink-500">Status</span>
                    <FilterChip href={buildHref(current, "status", undefined)} active={!stage}>
                      All
                    </FilterChip>
                    {stages.map((s) => (
                      <FilterChip key={s} href={buildHref(current, "status", s)} active={stage === s}>
                        {RELEASE_STAGE_LABELS[s]}
                      </FilterChip>
                    ))}
                  </div>
                ) : null}
              </div>
              <p className="text-eyebrow shrink-0 text-ink-400" aria-live="polite">
                {pluralize(products.length, "product")}
                {filtered ? " · filtered" : ""}
              </p>
            </div>

            {products.length === 0 ? (
              <EmptyState
                className="mt-10"
                title="No products match these filters"
                body="Try a different combination, or clear the filters to see everything."
                action={{ href: "/products", label: "Clear filters" }}
              />
            ) : (
              <ul className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-5 lg:grid-cols-3">
                {products.map((product, index) => (
                  <Reveal as="li" key={product.id} delay={(index % 3) * 80}>
                    <ProductCard product={product} />
                  </Reveal>
                ))}
              </ul>
            )}
          </>
        )}
      </section>

      <ClosingCta
        headline="Have an idea for a useful tool?"
        body="We'd like to hear about the problems you want solved."
        primary={{ href: "/contact", label: "Get in touch" }}
        secondary={{ href: "/what-we-do", label: "What we do" }}
      />
    </>
  );
}
