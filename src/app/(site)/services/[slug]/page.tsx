import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, Check, Mail, Plus } from "lucide-react";
import { PartnerTile } from "@/components/cards/content-cards";
import { ProductCard } from "@/components/cards/product-card";
import { Reveal } from "@/components/motion/reveal";
import { ClosingCta } from "@/components/sections/shared-sections";
import { JsonLdScript } from "@/components/seo/json-ld-script";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { ButtonLink, TextLink } from "@/components/ui/button";
import { Markdown } from "@/components/ui/markdown";
import { Eyebrow } from "@/components/ui/section";
import { CapabilityIconView } from "@/components/visuals/capability-icon";
import { getCompany, getPartners, getServicePage, getServicePages } from "@/lib/content/public";
import { faqJsonLd, servicePageJsonLd } from "@/lib/seo/json-ld";
import { pageMetadata } from "@/lib/seo/metadata";
import { indexLabel } from "@/lib/utils";

type Params = Promise<{ slug: string }>;

/** Pages are generated at build time; unknown slugs are 404s. */
export const dynamicParams = false;

export async function generateStaticParams() {
  return (await getServicePages()).map((page) => ({ slug: page.slug }));
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const page = await getServicePage(slug);
  if (!page) return { title: "Service not found", robots: { index: false } };
  return pageMetadata({
    title: page.seoTitle,
    description: page.seoDescription,
    path: `/services/${page.slug}`,
    imageAlt: page.name,
  });
}

/** How many partners are shown before "See all partners". */
const PROOF_LIMIT = 12;

export default async function ServicePage({ params }: { params: Params }) {
  const { slug } = await params;
  const [page, company, allPartners] = await Promise.all([getServicePage(slug), getCompany(), getPartners()]);
  if (!page) notFound();
  const email = company.contact.contactEmail;

  const toc = [
    ...page.sections.map((section) => ({ id: section.id, title: section.heading })),
    ...(page.proof.length > 0 ? [{ id: "partners", title: "Partners we've worked with" }] : []),
    ...(page.products.length > 0 ? [{ id: "products", title: "Our extensions" }] : []),
    { id: "pricing", title: "Pricing" },
    { id: "faq", title: "Questions" },
  ];

  return (
    <>
      <section className="relative overflow-hidden border-b border-white/[0.07] pt-[calc(var(--header-height)+2.5rem)] pb-16 md:pb-24">
        <div aria-hidden className="grid-lines mask-fade-radial pointer-events-none absolute inset-0 opacity-50" />
        <div
          aria-hidden
          className="pointer-events-none absolute -top-40 right-[-10%] h-[36rem] w-[36rem] rounded-full bg-[radial-gradient(closest-side,rgba(255,107,53,0.16),rgba(255,107,53,0.05)_60%,transparent)]"
        />
        <div className="container-site relative">
          <Breadcrumbs items={[{ name: "Services", path: "/services" }, { name: page.name, path: `/services/${page.slug}` }]} />
          <div className="mt-12 grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-10">
            <div className="lg:col-span-8">
              <div className="flex items-center gap-4">
                <span className="flex h-12 w-12 items-center justify-center rounded-xl border border-white/10 bg-ink-800 text-signal-400">
                  <CapabilityIconView name={page.icon} className="h-5 w-5" />
                </span>
                <Eyebrow>Service</Eyebrow>
              </div>
              <h1 className="text-display-lg mt-8 max-w-[18ch] animate-fade-up text-ink-50">
                {page.title}
                <span className="text-signal-500">.</span>
              </h1>
              <p className="text-lede mt-7 max-w-2xl animate-fade-up text-ink-200 [animation-delay:120ms]">{page.quickAnswer}</p>
              <div className="mt-9 flex animate-fade-up flex-col gap-3 [animation-delay:200ms] sm:flex-row">
                <ButtonLink href="/contact" size="lg" arrow>
                  Discuss your project
                </ButtonLink>
                {email ? (
                  <a href={`mailto:${email}`} className="group inline-flex h-13 items-center justify-center gap-2 rounded-full border border-white/12 bg-white/[0.04] px-7 text-base font-medium text-ink-50 transition-colors hover:border-white/25 hover:bg-white/[0.07]">
                    <Mail aria-hidden className="h-4 w-4 text-ink-300" />
                    {email}
                  </a>
                ) : null}
              </div>
            </div>
            {page.audience.length > 0 ? (
              <aside className="animate-fade-in lg:col-span-4 lg:self-end [animation-delay:300ms]" aria-labelledby="audience-title">
                <div className="surface-card p-6 md:p-7">
                  <h2 id="audience-title" className="text-eyebrow text-ink-400">
                    Who it&apos;s for
                  </h2>
                  <ul className="mt-5 space-y-3">
                    {page.audience.map((item) => (
                      <li key={item} className="flex gap-3 text-[0.9375rem] text-ink-100">
                        <Check aria-hidden className="mt-1 h-4 w-4 shrink-0 text-signal-400" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </aside>
            ) : null}
          </div>
        </div>
      </section>

      <div className="container-site">
        <div className="grid grid-cols-1 gap-10 py-10 lg:grid-cols-12 lg:py-16">
          <aside className="hidden lg:col-span-3 lg:block">
            <nav aria-label="On this page" className="sticky top-[calc(var(--header-height)+2.5rem)]">
              <p className="text-eyebrow text-ink-500">On this page</p>
              <ol className="mt-5 space-y-3 border-l border-white/[0.08]">
                {toc.map((item, index) => (
                  <li key={item.id}>
                    <a
                      href={`#${item.id}`}
                      className="-ml-px flex gap-3 border-l border-transparent pl-4 text-sm text-ink-400 transition-colors hover:border-signal-500 hover:text-ink-50"
                    >
                      <span className="font-mono text-xs text-ink-600">{indexLabel(index + 1)}</span>
                      {item.title}
                    </a>
                  </li>
                ))}
              </ol>
            </nav>
          </aside>

          <div className="min-w-0 lg:col-span-8 lg:col-start-5">
            {page.sections.map((section, index) => (
              <section key={section.id} id={section.id} aria-labelledby={`${section.id}-title`} className="scroll-mt-32 border-t border-white/[0.07] py-12 first:border-t-0 first:pt-0 md:py-16">
                <Reveal>
                  <p className="text-eyebrow text-signal-400">{indexLabel(index + 1)}</p>
                  <h2 id={`${section.id}-title`} className="text-display-sm mt-4 text-ink-50">
                    {section.heading}
                  </h2>
                  <Markdown source={section.body} className="mt-6" />
                </Reveal>
              </section>
            ))}

            {page.proof.length > 0 ? (
              <section id="partners" aria-labelledby="partners-title" className="scroll-mt-32 border-t border-white/[0.07] py-12 md:py-16">
                <p className="text-eyebrow text-signal-400">Proof</p>
                <h2 id="partners-title" className="text-display-sm mt-4 text-ink-50">
                  Partners we&apos;ve worked with
                </h2>
                <p className="mt-4 text-ink-300">
                  {page.proof.length} of our {allPartners.length} partners worked with us in this kind of role.
                </p>
                <ul className="mt-8 grid grid-cols-2 gap-2 sm:gap-2.5 xl:grid-cols-3">
                  {page.proof.slice(0, PROOF_LIMIT).map((partner) => (
                    <li key={partner.slug} className="min-w-0">
                      <PartnerTile partner={partner} size="compact" />
                    </li>
                  ))}
                </ul>
                <div className="mt-6">
                  <TextLink href="/partnerships">See all {allPartners.length} partners</TextLink>
                </div>
              </section>
            ) : null}

            {page.products.length > 0 ? (
              <section id="products" aria-labelledby="products-title" className="scroll-mt-32 border-t border-white/[0.07] py-12 md:py-16">
                <p className="text-eyebrow text-signal-400">Proof</p>
                <h2 id="products-title" className="text-display-sm mt-4 text-ink-50">
                  Our own extensions
                </h2>
                <ul className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {page.products.slice(0, 6).map((product) => (
                    <li key={product.slug}>
                      <ProductCard product={product} />
                    </li>
                  ))}
                </ul>
                <div className="mt-6">
                  <TextLink href="/products">See all our products</TextLink>
                </div>
              </section>
            ) : null}

            <section id="pricing" aria-labelledby="pricing-title" className="scroll-mt-32 border-t border-white/[0.07] py-12 md:py-16">
              <p className="text-eyebrow text-signal-400">Pricing</p>
              <h2 id="pricing-title" className="text-display-sm mt-4 text-ink-50">
                Priced per project
              </h2>
              <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="surface-card p-6 md:p-7">
                  <h3 className="font-display text-lg font-medium text-ink-50">Scoped to your goals</h3>
                  <p className="mt-3 text-[0.9375rem] text-ink-300">
                    There are no fixed packages. Tell us what you are building or launching, and when, and we will price the work for your project.
                  </p>
                </div>
                <div className="surface-card p-6 md:p-7">
                  <h3 className="font-display text-lg font-medium text-ink-50">Results, privately</h3>
                  <p className="mt-3 text-[0.9375rem] text-ink-300">
                    We don&apos;t publish campaign results, out of respect for our partners. Get in touch to talk about the work closest to yours.
                  </p>
                </div>
              </div>
            </section>

            <section id="faq" aria-labelledby="faq-title" className="scroll-mt-32 border-t border-white/[0.07] py-12 md:py-16">
              <p className="text-eyebrow text-signal-400">Questions</p>
              <h2 id="faq-title" className="text-display-sm mt-4 text-ink-50">
                {page.name}: common questions
              </h2>
              <div className="mt-8 divide-y divide-white/[0.08] border-y border-white/[0.08]">
                {page.faqs.map((faq) => (
                  <details key={faq.question} className="group py-5">
                    <summary className="flex cursor-pointer list-none items-start justify-between gap-6 text-left font-display text-lg font-medium tracking-[-0.02em] text-ink-50 [&::-webkit-details-marker]:hidden">
                      <h3>{faq.question}</h3>
                      <Plus aria-hidden className="mt-1 h-5 w-5 shrink-0 text-ink-400 transition-transform duration-300 group-open:rotate-45" />
                    </summary>
                    <p className="mt-3 max-w-2xl text-ink-300">{faq.answer}</p>
                  </details>
                ))}
              </div>
            </section>
          </div>
        </div>
      </div>

      {page.related.length > 0 ? (
        <section className="border-t border-white/[0.07] py-16 md:py-24" aria-labelledby="related-title">
          <div className="container-site">
            <Eyebrow>Related services</Eyebrow>
            <h2 id="related-title" className="text-display-sm mt-5 text-ink-50">
              Often combined with
            </h2>
            <ul className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {page.related.map((other) => (
                <li key={other.slug}>
                  <Link href={`/services/${other.slug}`} className="surface-card lift group flex h-full flex-col p-6 hover:border-white/20">
                    <span className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-ink-800 text-ink-50 transition-colors group-hover:text-signal-400">
                      <CapabilityIconView name={other.icon} className="h-5 w-5" />
                    </span>
                    <span className="mt-6 font-display text-lg font-medium tracking-[-0.02em] text-ink-50">{other.name}</span>
                    <span className="mt-2 text-sm text-ink-300">{other.summary}</span>
                    <span className="mt-auto inline-flex items-center gap-1.5 pt-6 text-sm text-ink-200 group-hover:text-ink-50">
                      Learn more
                      <ArrowRight aria-hidden className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>
      ) : null}

      <ClosingCta
        headline={`Ready to talk about ${page.name}?`}
        body="Tell us what you're working on. Every project is priced for its scope."
        primary={{ href: "/contact", label: "Get in touch" }}
        secondary={{ href: "/services", label: "All services" }}
      />
      <JsonLdScript data={[servicePageJsonLd(page), faqJsonLd(page.faqs)]} />
    </>
  );
}
