import type { Metadata } from "next";
import Link from "next/link";
import { ProductCard } from "@/components/cards/product-card";
import { Reveal } from "@/components/motion/reveal";
import { ClosingCta, DirectionStrip } from "@/components/sections/shared-sections";
import { TextLink } from "@/components/ui/button";
import { Markdown } from "@/components/ui/markdown";
import { Eyebrow, PageHero, SectionHeader } from "@/components/ui/section";
import { CapabilityIllustration } from "@/components/visuals/capability-illustration";
import { getCapabilities, getCompany, getFeaturedProducts } from "@/lib/content/public";
import { pageMetadata } from "@/lib/seo/metadata";
import { cn, indexLabel } from "@/lib/utils";

export async function generateMetadata(): Promise<Metadata> {
  const company = await getCompany();
  return pageMetadata({
    title: "Services",
    description:
      company.whatWeDoIntro ??
      `${company.name} offers KOC and consultancy services, digital marketing and blockchain development.`,
    path: "/services",
  });
}

export default async function ServicesPage() {
  const [company, capabilities, products] = await Promise.all([getCompany(), getCapabilities(), getFeaturedProducts(3)]);

  return (
    <>
      <PageHero
        eyebrow="Services"
        title={
          <>
            Services to build, launch and grow<span className="text-signal-500">.</span>
          </>
        }
        description={company.whatWeDoIntro}
      />

      {capabilities.length > 0 ? (
        <section className="container-site py-16 md:py-24" aria-label="Services">
          <nav aria-label="Jump to a service" className="mb-16 hidden md:block">
            <ul className="flex flex-wrap gap-2">
              {capabilities.map((capability, index) => (
                <li key={capability.id}>
                  <a
                    href={`#${capability.slug}`}
                    className="inline-flex h-9 items-center gap-2 rounded-full border border-white/10 px-4 text-sm text-ink-300 transition-colors hover:border-white/25 hover:text-ink-50"
                  >
                    <span className="font-mono text-[0.6875rem] text-ink-600">{indexLabel(index + 1)}</span>
                    {capability.title}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
          <div className="space-y-20 md:space-y-32">
            {capabilities.map((capability, index) => {
              const flip = index % 2 === 1;
              return (
                <article
                  key={capability.id}
                  id={capability.slug}
                  className="grid grid-cols-1 scroll-mt-32 items-center gap-10 lg:grid-cols-12 lg:gap-16"
                  aria-labelledby={`${capability.slug}-title`}
                >
                  <Reveal className={cn("lg:col-span-6", flip && "lg:order-2 lg:col-start-7")}>
                    <CapabilityIllustration icon={capability.icon} variant={index} />
                  </Reveal>
                  <Reveal delay={120} className={cn("lg:col-span-5", flip ? "lg:order-1 lg:col-start-1" : "lg:col-start-8")}>
                    <div className="flex items-center gap-3">
                      <p className="text-eyebrow text-signal-400">{indexLabel(index + 1)}</p>
                    </div>
                    <h2 id={`${capability.slug}-title`} className="text-display-sm mt-5 text-ink-50">
                      {capability.title}
                    </h2>
                    <p className="text-lede mt-5 text-ink-200">{capability.summary}</p>
                    {capability.description ? <Markdown source={capability.description} className="mt-5 text-base text-ink-300" /> : null}
                    {capability.products.length > 0 ? (
                      <div className="mt-8">
                        <p className="text-eyebrow text-ink-500">Related products</p>
                        <ul className="mt-3 flex flex-wrap gap-2">
                          {capability.products.map((product) => (
                            <li key={product.slug}>
                              <Link
                                href={`/products/${product.slug}`}
                                className="inline-flex h-9 items-center rounded-full border border-white/10 px-4 text-sm text-ink-200 transition-colors hover:border-signal-500/60 hover:text-ink-50"
                              >
                                {product.name}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ) : null}
                  </Reveal>
                </article>
              );
            })}
          </div>
        </section>
      ) : null}

      <section className="border-t border-white/[0.07] py-20 md:py-32" aria-labelledby="direction-title">
        <div className="container-site">
          <SectionHeader
            eyebrow="How we help"
            title={<span id="direction-title">Build. Launch. Grow.</span>}
            description={company.longTermDirection}
          />
          <div className="mt-16 lg:grid lg:grid-cols-12 lg:gap-10">
            <div className="lg:col-span-9 lg:col-start-4">
              <DirectionStrip />
            </div>
          </div>
        </div>
      </section>

      {company.approach ? (
        <section className="relative overflow-hidden bg-paper-100 text-paper-900" aria-labelledby="how-title">
          <div aria-hidden className="grid-lines-paper mask-fade-radial pointer-events-none absolute inset-0 opacity-70" />
          <div className="container-site relative grid grid-cols-1 gap-12 py-20 md:py-32 lg:grid-cols-12 lg:gap-10">
            <div className="lg:col-span-5">
              <Eyebrow tone="paper">How we work</Eyebrow>
              <h2 id="how-title" className="text-display-md mt-6 max-w-[14ch] text-paper-900">
                Our approach.
              </h2>
            </div>
            <div className="lg:col-span-6 lg:col-start-7">
              <Markdown source={company.approach} className="prose-paper text-lg" />
            </div>
          </div>
        </section>
      ) : null}

      {products.length > 0 ? (
        <section className="py-20 md:py-28" aria-labelledby="wwd-products">
          <div className="container-site">
            <div className="flex items-end justify-between gap-6">
              <div>
                <Eyebrow>Built in-house</Eyebrow>
                <h2 id="wwd-products" className="text-display-sm mt-5 text-ink-50">
                  Our own products
                </h2>
              </div>
              <TextLink href="/products">All products</TextLink>
            </div>
            <ul className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-5 lg:grid-cols-3">
              {products.map((product) => (
                <li key={product.id}>
                  <ProductCard product={product} />
                </li>
              ))}
            </ul>
          </div>
        </section>
      ) : null}

      <ClosingCta headline={company.closingHeadline} body={company.closingBody} />
    </>
  );
}
