import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowUpRight, Check } from "lucide-react";
import { ProductLogo } from "@/components/cards/product-card";
import { Reveal } from "@/components/motion/reveal";
import { ScreenshotGallery } from "@/components/sections/screenshot-gallery";
import { ClosingCta } from "@/components/sections/shared-sections";
import { JsonLdScript } from "@/components/seo/json-ld-script";
import { SampleBadge, StageBadge } from "@/components/ui/badges";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { ButtonLink, TextLink } from "@/components/ui/button";
import { Markdown } from "@/components/ui/markdown";
import { MediaImage } from "@/components/ui/media-image";
import { Eyebrow } from "@/components/ui/section";
import { getCompany, getProduct, getProducts } from "@/lib/content/public";
import { LINK_KIND_LABELS, PLATFORM_LABELS, PRICING_LABELS } from "@/lib/labels";
import { productJsonLd } from "@/lib/seo/json-ld";
import { clampDescription, pageMetadata } from "@/lib/seo/metadata";
import { displayHost, formatDate, indexLabel } from "@/lib/utils";

type Params = Promise<{ slug: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProduct(slug);
  if (!product) return { title: "Product not found", robots: { index: false } };
  return pageMetadata({
    title: product.seoTitle ?? product.name,
    description: clampDescription(product.seoDescription ?? `${product.name} — ${product.summary}`),
    path: `/products/${product.slug}`,
    imageAlt: product.name,
    noIndex: product.status !== "PUBLISHED" || product.isPlaceholder,
  });
}

export default async function ProductPage({ params }: { params: Params }) {
  const { slug } = await params;
  const [product, company] = await Promise.all([getProduct(slug), getCompany()]);
  if (!product) notFound();

  const others = (await getProducts()).filter((p) => p.id !== product.id).slice(0, 3);
  const accent = product.accentColor ?? "#ff6b35";
  const visual = product.cover ?? product.images[0]?.media ?? null;

  const meta: Array<{ label: string; value: React.ReactNode }> = [
    ...(product.category ? [{ label: "Category", value: product.category.name }] : []),
    ...(product.platforms.length
      ? [{ label: "Platform", value: product.platforms.map((p) => PLATFORM_LABELS[p]).join(", ") }]
      : []),
    ...(product.pricing !== "UNSPECIFIED" ? [{ label: "Pricing", value: PRICING_LABELS[product.pricing] }] : []),
    ...(product.release
      ? [{ label: "Released", value: formatDate(product.release.date, product.release.precision) }]
      : []),
  ];

  return (
    <>
      {product.status !== "PUBLISHED" ? (
        <div className="fixed inset-x-0 top-[var(--header-height)] z-40 bg-beta/90 py-1.5 text-center text-xs font-medium text-ink-950">
          Draft preview — this product is not public ({product.status.toLowerCase()})
        </div>
      ) : null}

      <section className="relative overflow-hidden border-b border-white/[0.07] pt-[calc(var(--header-height)+2.5rem)] pb-16 md:pb-24">
        <div aria-hidden className="grid-lines mask-fade-radial pointer-events-none absolute inset-0 opacity-50" />
        <div
          aria-hidden
          className="pointer-events-none absolute -top-48 right-[-15%] h-[44rem] w-[44rem] rounded-full blur-3xl"
          style={{ background: `radial-gradient(circle, ${accent}33, transparent 62%)` }}
        />
        <div className="container-site relative">
          <Breadcrumbs items={[{ name: "Products", path: "/products" }, { name: product.name, path: `/products/${product.slug}` }]} />

          <div className="mt-12 grid items-center gap-12 lg:grid-cols-12 lg:gap-10">
            <div className="lg:col-span-6">
              <div className="flex flex-wrap items-center gap-4">
                <ProductLogo logo={product.logo} name={product.name} accent={product.accentColor} size="xl" />
                <div className="flex flex-col items-start gap-2">
                  <StageBadge stage={product.stage} />
                  {product.isPlaceholder ? <SampleBadge /> : null}
                </div>
              </div>
              <h1 className="text-display-lg mt-8 animate-fade-up text-ink-50">{product.name}</h1>
              {product.tagline ? (
                <p className="mt-4 animate-fade-up font-display text-xl tracking-[-0.02em] text-ink-200 [animation-delay:80ms] md:text-2xl">
                  {product.tagline}
                </p>
              ) : null}
              <p className="text-lede mt-6 max-w-xl animate-fade-up text-ink-300 [animation-delay:160ms]">{product.summary}</p>
              <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                {product.primaryCtaUrl ? (
                  <ButtonLink href={product.primaryCtaUrl} external arrow size="lg">
                    {product.primaryCtaLabel ?? "Get it"}
                  </ButtonLink>
                ) : null}
                {product.websiteUrl ? (
                  <ButtonLink href={product.websiteUrl} external variant="secondary" size="lg" arrow>
                    {displayHost(product.websiteUrl)}
                  </ButtonLink>
                ) : null}
              </div>
              {meta.length > 0 ? (
                <dl className="mt-12 grid grid-cols-2 gap-x-6 gap-y-6 border-t border-white/[0.08] pt-6 sm:grid-cols-4">
                  {meta.map((item) => (
                    <div key={item.label}>
                      <dt className="text-eyebrow text-ink-500">{item.label}</dt>
                      <dd className="mt-2 text-sm text-ink-100">{item.value}</dd>
                    </div>
                  ))}
                </dl>
              ) : null}
            </div>

            {visual ? (
              <div className="lg:col-span-6">
                <div className="relative">
                  <div aria-hidden className="absolute -inset-6 rounded-[2rem] opacity-60 blur-2xl" style={{ background: `radial-gradient(60% 60% at 50% 40%, ${accent}40, transparent)` }} />
                  <div className="relative overflow-hidden rounded-[var(--radius-panel)] border border-white/10 bg-ink-850 p-2 shadow-[0_40px_120px_-40px_rgba(0,0,0,0.8)]">
                    <MediaImage
                      media={visual}
                      priority
                      quality={85}
                      sizes="(min-width: 1024px) 45vw, 100vw"
                      className="w-full rounded-[1.25rem]"
                    />
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </section>

      {product.images.length > 0 ? (
        <section className="py-16 md:py-24" aria-labelledby="screens-title">
          <div className="container-site">
            <Eyebrow>Screenshots</Eyebrow>
            <h2 id="screens-title" className="sr-only">
              Screenshots
            </h2>
            <div className="mt-8">
              <ScreenshotGallery shots={product.images} productName={product.name} />
            </div>
          </div>
        </section>
      ) : null}

      <section className="border-t border-white/[0.07] py-16 md:py-24">
        <div className="container-site grid gap-14 lg:grid-cols-12 lg:gap-10">
          <div className="lg:col-span-7">
            {product.description ? (
              <Reveal>
                <Eyebrow>About {product.name}</Eyebrow>
                <Markdown source={product.description} className="mt-8 text-lg" />
              </Reveal>
            ) : null}

            {product.features.length > 0 ? (
              <div className={product.description ? "mt-16" : ""}>
                <Eyebrow>Main features</Eyebrow>
                <ol className="mt-8 grid gap-px overflow-hidden rounded-[var(--radius-card)] border border-white/[0.08] bg-white/[0.08] sm:grid-cols-2">
                  {product.features.map((feature, index) => (
                    <Reveal
                      as="li"
                      key={feature.id}
                      delay={(index % 2) * 80}
                      className={`bg-ink-900 p-6 md:p-7 ${index === product.features.length - 1 && product.features.length % 2 === 1 ? "sm:col-span-2" : ""}`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="flex h-7 w-7 items-center justify-center rounded-full" style={{ background: `${accent}22`, color: accent }}>
                          <Check aria-hidden className="h-3.5 w-3.5" />
                        </span>
                        <span className="font-mono text-xs text-ink-500">{indexLabel(index + 1)}</span>
                      </div>
                      <h3 className="mt-5 font-display text-lg font-medium tracking-[-0.02em] text-ink-50">{feature.title}</h3>
                      {feature.description ? <p className="mt-2 text-[0.9375rem] text-ink-300">{feature.description}</p> : null}
                    </Reveal>
                  ))}
                </ol>
              </div>
            ) : null}
          </div>

          <aside className="space-y-6 lg:col-span-4 lg:col-start-9">
            {product.audience ? (
              <div className="surface-card p-6">
                <p className="text-eyebrow text-ink-400">Who it&apos;s for</p>
                <p className="mt-4 text-ink-200">{product.audience}</p>
              </div>
            ) : null}
            {product.links.length > 0 ? (
              <div className="surface-card p-6">
                <p className="text-eyebrow text-ink-400">Links</p>
                <ul className="mt-4 divide-y divide-white/[0.07]">
                  {product.links.map((link) => (
                    <li key={link.id}>
                      <a href={link.url} target="_blank" rel="noopener noreferrer" className="group flex items-center justify-between gap-3 py-3 text-sm">
                        <span>
                          <span className="block text-ink-100 group-hover:text-white">{link.label}</span>
                          <span className="block text-xs text-ink-500">{LINK_KIND_LABELS[link.kind]} · {displayHost(link.url)}</span>
                        </span>
                        <ArrowUpRight aria-hidden className="h-4 w-4 text-ink-500 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-ink-50" />
                        <span className="sr-only"> (opens in a new tab)</span>
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
            {product.milestones.length > 0 ? (
              <div className="surface-card p-6">
                <p className="text-eyebrow text-ink-400">Milestones</p>
                <ol className="mt-4 space-y-4 border-l border-white/10 pl-4">
                  {product.milestones.map((milestone) => (
                    <li key={milestone.slug} className="relative">
                      <span aria-hidden className="absolute -left-[1.3rem] top-1.5 h-2 w-2 rounded-full bg-signal-500" />
                      <p className="text-xs text-ink-500">{formatDate(milestone.date, milestone.precision)}</p>
                      <p className="mt-1 text-sm text-ink-100">{milestone.title}</p>
                    </li>
                  ))}
                </ol>
                <div className="mt-5">
                  <TextLink href="/journey">Our journey</TextLink>
                </div>
              </div>
            ) : null}
            {product.collaborations.length > 0 || product.capabilities.length > 0 ? (
              <div className="surface-card p-6">
                {product.collaborations.length > 0 ? (
                  <>
                    <p className="text-eyebrow text-ink-400">Collaborations</p>
                    <ul className="mt-3 space-y-2 text-sm">
                      {product.collaborations.map((c) => (
                        <li key={c.slug}>
                          <Link href={`/collaborations/${c.slug}`} className="text-ink-200 hover:text-ink-50">
                            {c.title}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </>
                ) : null}
                {product.capabilities.length > 0 ? (
                  <>
                    <p className={`text-eyebrow text-ink-400 ${product.collaborations.length ? "mt-6" : ""}`}>Related focus areas</p>
                    <ul className="mt-3 flex flex-wrap gap-2">
                      {product.capabilities.map((c) => (
                        <li key={c.slug}>
                          <Link href={`/what-we-do#${c.slug}`} className="inline-flex rounded-full border border-white/10 px-3 py-1 text-xs text-ink-200 hover:border-white/25">
                            {c.title}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </>
                ) : null}
              </div>
            ) : null}
          </aside>
        </div>
      </section>

      {others.length > 0 ? (
        <section className="border-t border-white/[0.07] py-16 md:py-24" aria-labelledby="more-title">
          <div className="container-site">
            <div className="flex items-end justify-between gap-6">
              <h2 id="more-title" className="text-display-sm text-ink-50">More from {company.name}</h2>
              <TextLink href="/products">All products</TextLink>
            </div>
            <ul className="mt-10 grid gap-4 sm:grid-cols-2 md:gap-5 lg:grid-cols-3">
              {others.map((p) => (
                <li key={p.id}>
                  <Link href={`/products/${p.slug}`} className="group flex items-center gap-4 rounded-[var(--radius-card)] border border-white/[0.08] p-4 transition-colors hover:border-white/20 hover:bg-white/[0.02]">
                    <ProductLogo logo={p.logo} name={p.name} accent={p.accentColor} size="sm" />
                    <span className="min-w-0">
                      <span className="block truncate font-display text-base font-medium tracking-[-0.02em] text-ink-50">{p.name}</span>
                      <span className="block truncate text-sm text-ink-400">{p.tagline ?? p.summary}</span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>
      ) : null}

      <ClosingCta headline={company.closingHeadline} body={company.closingBody} />
      {product.status === "PUBLISHED" ? <JsonLdScript data={productJsonLd(product, company.name)} /> : null}
    </>
  );
}
