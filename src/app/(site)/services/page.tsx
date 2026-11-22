import { JsonLdScript } from "@/components/seo/json-ld-script";
import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { ProductCard } from "@/components/cards/product-card";
import { Reveal } from "@/components/motion/reveal";
import { ClosingCta, DirectionStrip } from "@/components/sections/shared-sections";
import { TextLink } from "@/components/ui/button";
import { Markdown } from "@/components/ui/markdown";
import { Eyebrow, PageHero, SectionHeader } from "@/components/ui/section";
import { CapabilityIconView } from "@/components/visuals/capability-icon";
import { CapabilityIllustration } from "@/components/visuals/capability-illustration";
import { getCapabilities, getCompany, getFeaturedProducts, getServicePages } from "@/lib/content/public";
import { pageMetadata } from "@/lib/seo/metadata";
import { breadcrumbJsonLd, servicesJsonLd } from "@/lib/seo/json-ld";
import { cn, indexLabel } from "@/lib/utils";

export async function generateMetadata(): Promise<Metadata> {
  const company = await getCompany();
  return pageMetadata({
    title: "Web3 Marketing, KOC & Blockchain Services",
    description: `${company.name} services: crypto KOC and KOL campaigns, Web3 consultancy, digital marketing, blockchain development and Chrome extension builds.`,
    path: "/services",
  });
}

export default async function ServicesPage() {
  const [company, capabilities, products, servicePages] = await Promise.all([
    getCompany(),
    getCapabilities(),
    getFeaturedProducts(3),
    getServicePages(),
  ]);

  return (
    <>
      <PageHero
        eyebrow="Services"
        title={
          <>
            Web3 marketing and development services<span className="text-signal-500">.</span>
          </>
        }
        description={company.whatWeDoIntro}
      />

      {servicePages.length > 0 ? (
        <section className="container-site py-16 md:py-24" aria-labelledby="all-services-title">
          <Eyebrow>All services</Eyebrow>
          <h2 id="all-services-title" className="text-display-sm mt-5 max-w-[22ch] text-ink-50">
            Choose a service to see how we work.
          </h2>
          <ul className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {servicePages.map((page, index) => (
              <Reveal as="li" key={page.slug} delay={(index % 4) * 70}>
                <Link href={`/services/${page.slug}`} className="surface-card lift group flex h-full flex-col p-6 hover:border-white/20">
                  <span className="flex items-center justify-between">
                    <span className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-ink-800 text-ink-50 transition-colors group-hover:text-signal-400">
                      <CapabilityIconView name={page.icon} className="h-5 w-5" />
                    </span>
                    <span className="font-mono text-[0.6875rem] text-ink-600">{indexLabel(index + 1)}</span>
                  </span>
                  <span className="mt-6 font-display text-lg font-medium tracking-[-0.02em] text-ink-50">{page.name}</span>
                  <span className="mt-2 text-sm text-ink-300">{page.summary}</span>
                  <span className="mt-auto inline-flex items-center gap-1.5 pt-6 text-sm text-ink-200 group-hover:text-ink-50">
                    Learn more
                    <ArrowRight aria-hidden className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </span>
                </Link>
              </Reveal>
            ))}
          </ul>
        </section>
      ) : null}

      {capabilities.length > 0 ? (
        <section className="container-site border-t border-white/[0.07] py-16 md:py-24" aria-label="What we do">
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
                    {capability.page ? (
                      <div className="mt-6">
                        <TextLink href={`/services/${capability.page.slug}`}>More about {capability.page.name}</TextLink>
                      </div>
                    ) : null}
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
      <JsonLdScript data={[servicesJsonLd(servicePages, company.name), breadcrumbJsonLd([{ name: "Home", path: "/" }, { name: "Services", path: "/services" }])]} />
    </>
  );
}
