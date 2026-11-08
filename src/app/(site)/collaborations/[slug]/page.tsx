import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowUpRight } from "lucide-react";
import { PartnerMark } from "@/components/cards/content-cards";
import { ClosingCta } from "@/components/sections/shared-sections";
import { SampleBadge } from "@/components/ui/badges";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { ButtonLink, TextLink } from "@/components/ui/button";
import { Markdown } from "@/components/ui/markdown";
import { MediaImage } from "@/components/ui/media-image";
import { Eyebrow } from "@/components/ui/section";
import { getCollaboration, getCollaborations, getCompany } from "@/lib/content/public";
import { COLLABORATION_CATEGORY_LABELS } from "@/lib/labels";
import { clampDescription, pageMetadata } from "@/lib/seo/metadata";
import { displayHost, formatDate } from "@/lib/utils";

type Params = Promise<{ slug: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const collaboration = await getCollaboration(slug);
  if (!collaboration) return { title: "Collaboration not found", robots: { index: false } };
  return pageMetadata({
    title: collaboration.title,
    description: clampDescription(collaboration.summary),
    path: `/collaborations/${collaboration.slug}`,
    type: "article",
    noIndex: collaboration.status !== "PUBLISHED" || collaboration.isPlaceholder,
  });
}

export default async function CollaborationPage({ params }: { params: Params }) {
  const { slug } = await params;
  const [collaboration, company] = await Promise.all([getCollaboration(slug), getCompany()]);
  if (!collaboration) notFound();
  const others = (await getCollaborations()).filter((c) => c.id !== collaboration.id).slice(0, 3);

  return (
    <>
      {collaboration.status !== "PUBLISHED" ? (
        <div className="fixed inset-x-0 top-[var(--header-height)] z-40 bg-beta/90 py-1.5 text-center text-xs font-medium text-ink-950">
          Draft preview — this collaboration is not public
        </div>
      ) : null}
      <article>
        <header className="relative overflow-hidden border-b border-white/[0.07] pt-[calc(var(--header-height)+2.5rem)] pb-14 md:pb-20">
          <div aria-hidden className="grid-lines mask-fade-radial pointer-events-none absolute inset-0 opacity-50" />
          <div className="container-site relative">
            <Breadcrumbs
              items={[
                { name: "Collaborations", path: "/collaborations" },
                { name: collaboration.title, path: `/collaborations/${collaboration.slug}` },
              ]}
            />
            <div className="mt-12 grid grid-cols-1 gap-10 lg:grid-cols-12">
              <div className="lg:col-span-8">
                <div className="flex flex-wrap items-center gap-3">
                  <Eyebrow>
                    {COLLABORATION_CATEGORY_LABELS[collaboration.category]}
                    {collaboration.date ? ` · ${formatDate(collaboration.date.date, collaboration.date.precision)}` : ""}
                  </Eyebrow>
                  {collaboration.isPlaceholder ? <SampleBadge /> : null}
                </div>
                <h1 className="text-display-lg mt-7 animate-fade-up text-ink-50">{collaboration.title}</h1>
                <p className="text-lede mt-6 max-w-2xl animate-fade-up text-ink-300 [animation-delay:120ms]">{collaboration.summary}</p>
                <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                  {collaboration.sourceUrl ? (
                    <ButtonLink href={collaboration.sourceUrl} external arrow>
                      {collaboration.sourceLabel ?? "View original source"}
                    </ButtonLink>
                  ) : null}
                  {collaboration.externalUrl ? (
                    <ButtonLink href={collaboration.externalUrl} external variant="secondary" arrow>
                      {displayHost(collaboration.externalUrl)}
                    </ButtonLink>
                  ) : null}
                </div>
              </div>
              {collaboration.partners.length > 0 ? (
                <aside className="lg:col-span-4">
                  <p className="text-eyebrow text-ink-500">{collaboration.partners.length > 1 ? "Partners" : "Partner"}</p>
                  <ul className="mt-4 space-y-3">
                    {collaboration.partners.map((partner) => (
                      <li key={partner.slug} className="surface-card flex items-center gap-4 p-4">
                        <div className="flex h-12 w-24 shrink-0 items-center">
                          <PartnerMark partner={partner} />
                        </div>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium text-ink-100">{partner.name}</p>
                          {partner.role ? <p className="text-xs text-ink-400">{partner.role}</p> : null}
                          {partner.websiteUrl ? (
                            <a href={partner.websiteUrl} target="_blank" rel="noopener noreferrer" className="mt-1 inline-flex items-center gap-1 text-xs text-ink-400 hover:text-ink-50">
                              {displayHost(partner.websiteUrl)} <ArrowUpRight aria-hidden className="h-3 w-3" />
                            </a>
                          ) : null}
                        </div>
                      </li>
                    ))}
                  </ul>
                </aside>
              ) : null}
            </div>
          </div>
        </header>

        {collaboration.cover ? (
          <div className="container-site pt-12 md:pt-16">
            <div className="overflow-hidden rounded-[var(--radius-panel)] border border-white/10">
              <MediaImage media={collaboration.cover} priority sizes="(min-width: 1408px) 1312px, 100vw" className="w-full" />
            </div>
          </div>
        ) : null}

        <div className="container-site grid grid-cols-1 gap-12 py-14 md:py-20 lg:grid-cols-12 lg:gap-10">
          <div className="lg:col-span-7 lg:col-start-2">
            <Markdown source={collaboration.description ?? collaboration.summary} className="text-lg" />
          </div>
          {collaboration.products.length > 0 ? (
            <aside className="lg:col-span-3 lg:col-start-10">
              <div className="surface-card p-6">
                <p className="text-eyebrow text-ink-400">Related products</p>
                <ul className="mt-4 space-y-2 text-sm">
                  {collaboration.products.map((product) => (
                    <li key={product.slug}>
                      <Link href={`/products/${product.slug}`} className="text-ink-200 hover:text-ink-50">
                        {product.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </aside>
          ) : null}
        </div>
      </article>

      {others.length > 0 ? (
        <section className="border-t border-white/[0.07] py-16 md:py-20" aria-labelledby="more-collabs">
          <div className="container-site">
            <div className="flex items-end justify-between gap-6">
              <h2 id="more-collabs" className="text-display-sm text-ink-50">More collaborations</h2>
              <TextLink href="/collaborations">View all</TextLink>
            </div>
            <ul className="mt-8 divide-y divide-white/[0.07] border-y border-white/[0.07]">
              {others.map((item) => (
                <li key={item.id}>
                  <Link href={`/collaborations/${item.slug}`} className="group flex items-center justify-between gap-6 py-5">
                    <span>
                      <span className="block font-display text-lg font-medium tracking-[-0.02em] text-ink-100 group-hover:text-white">{item.title}</span>
                      <span className="block text-sm text-ink-500">
                        {COLLABORATION_CATEGORY_LABELS[item.category]}
                        {item.date ? ` · ${formatDate(item.date.date, item.date.precision, "short")}` : ""}
                      </span>
                    </span>
                    <span aria-hidden className="text-ink-500 transition-transform group-hover:translate-x-1 group-hover:text-signal-500">→</span>
                  </Link>
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
