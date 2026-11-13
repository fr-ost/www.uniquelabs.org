import type { Metadata } from "next";
import { ProductCard } from "@/components/cards/product-card";
import { Reveal } from "@/components/motion/reveal";
import { ProductDirectory } from "@/components/sections/product-directory";
import { ClosingCta, EmptyState } from "@/components/sections/shared-sections";
import { PageHero } from "@/components/ui/section";
import { getCompany, getProductCategories, getProductPlatforms, getProducts } from "@/lib/content/public";
import { PLATFORM_LABELS, RELEASE_STAGE_LABELS } from "@/lib/labels";
import { pageMetadata } from "@/lib/seo/metadata";

export async function generateMetadata(): Promise<Metadata> {
  const company = await getCompany();
  return pageMetadata({
    title: "Products",
    description: `Software built in-house by ${company.name} — Chrome extensions including UnfollowX Pro, GrowX, Unique PDF, FrameShot, Twofold, Rowlio and ScoreX.`,
    path: "/products",
  });
}

export default async function ProductsPage() {
  const [products, categories, platforms, company] = await Promise.all([
    getProducts(),
    getProductCategories(),
    getProductPlatforms(),
    getCompany(),
  ]);
  const stages = [...new Set(products.map((p) => p.stage))];

  return (
    <>
      <PageHero
        eyebrow="Products"
        title={
          <>
            The product directory<span className="text-signal-500">.</span>
          </>
        }
        description={`Software we build in-house at ${company.name} — Chrome extensions for X (Twitter), PDFs, screen capture, security and web data.`}
      />

      <section className="container-site py-14 md:py-20" aria-label="Product directory">
        {products.length === 0 ? (
          <EmptyState
            title="No products published yet"
            body="Products appear here as soon as they are released. In the meantime, see what we focus on."
            action={{ href: "/services", label: "Our services" }}
          />
        ) : (
          <ProductDirectory
            categories={categories.map((c) => ({ value: c.slug, label: c.name }))}
            platforms={platforms.map((p) => ({ value: p, label: PLATFORM_LABELS[p] }))}
            stages={stages.map((s) => ({ value: s, label: RELEASE_STAGE_LABELS[s] }))}
            empty={
              <EmptyState
                className="mt-10"
                title="No products match these filters"
                body="Try a different combination, or clear the filters to see everything."
                action={{ href: "/products", label: "Clear filters" }}
              />
            }
            items={products.map((product, index) => ({
              slug: product.slug,
              category: product.category?.slug ?? null,
              platforms: product.platforms,
              stage: product.stage,
              node: (
                <Reveal as="li" key={product.id} delay={(index % 3) * 80}>
                  <ProductCard product={product} priority={index === 0} />
                </Reveal>
              ),
            }))}
          />
        )}
      </section>

      <ClosingCta
        headline="Have an idea for a useful tool?"
        body="We'd like to hear about the problems you want solved."
        primary={{ href: "/contact", label: "Get in touch" }}
        secondary={{ href: "/services", label: "Our services" }}
      />
    </>
  );
}
