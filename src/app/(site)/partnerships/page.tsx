import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { CollaborationCard, PartnerMark, PartnerTile } from "@/components/cards/content-cards";
import { Reveal } from "@/components/motion/reveal";
import { ClosingCta, EmptyState } from "@/components/sections/shared-sections";
import { Expandable } from "@/components/ui/expandable";
import { Eyebrow, PageHero } from "@/components/ui/section";
import { getCollaborations, getCompany, getPartnerTiers } from "@/lib/content/public";
import type { PartnerDTO } from "@/lib/content/types";
import type { CollaborationCardDTO } from "@/lib/content/types";
import { COLLABORATION_CATEGORY_LABELS } from "@/lib/labels";
import { pageMetadata } from "@/lib/seo/metadata";
import { cn, formatDate, pluralize, yearOf } from "@/lib/utils";

export async function generateMetadata(): Promise<Metadata> {
  const company = await getCompany();
  return pageMetadata({
    title: "Partnerships",
    description: `Exchanges, launchpads, ecosystems and Web3 projects ${company.name} has worked with — as ambassadors, KOC and KOL partners and campaign partners.`,
    path: "/partnerships",
  });
}

function groupByYear(items: CollaborationCardDTO[]) {
  const groups = new Map<string, CollaborationCardDTO[]>();
  for (const item of items) {
    const key = item.date ? String(yearOf(item.date.date)) : "Undated";
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(item);
  }
  return [...groups.entries()];
}

export default async function PartnershipsPage() {
  const [collaborations, tiers, company] = await Promise.all([getCollaborations(), getPartnerTiers(), getCompany()]);
  const partners = tiers.untiered;
  const networkSize = tiers.tier1.length + tiers.tier2.length;
  const featured = collaborations.filter((c) => c.featured).slice(0, 2);
  const years = groupByYear(collaborations);

  return (
    <>
      <PageHero
        eyebrow="Partnerships"
        title={
          <>
            Partners & collaborations<span className="text-signal-500">.</span>
          </>
        }
        description="Exchanges, launchpads, ecosystems and Web3 projects we've worked with — as ambassadors, KOC and KOL partners, launch partners and campaign partners."
        aside={
          networkSize > 0 ? (
            <dl className="grid grid-cols-2 gap-4">
              <div className="surface-card p-5">
                <dt className="text-eyebrow text-ink-500">Tier 1</dt>
                <dd className="mt-3 font-display text-4xl tracking-[-0.05em] text-ink-50 tabular">{tiers.tier1.length}</dd>
              </div>
              <div className="surface-card p-5">
                <dt className="text-eyebrow text-ink-500">Partners</dt>
                <dd className="mt-3 font-display text-4xl tracking-[-0.05em] text-ink-50 tabular">{networkSize}</dd>
              </div>
            </dl>
          ) : undefined
        }
      />

      <PartnerTierSection id="tier-1" eyebrow="Tier 1" title="Tier 1 partners" description="Our most active relationships — leading exchanges, ecosystems and IDO launchpads." partners={tiers.tier1} />
      <PartnerTierSection id="tier-2" eyebrow="Tier 2" title="Tier 2 partners" description="Projects we've run KOC, KOL and promotional campaigns with." partners={tiers.tier2} compact />

      {collaborations.length === 0 ? (
        networkSize > 0 ? null : (
        <section className="container-site py-16 md:py-24">
          <EmptyState
            title="Partnerships are on their way"
            body="Our partnerships and collaborations will be showcased here, each with a link to its original announcement. Interested in working together?"
            action={{ href: "/contact", label: "Propose a partnership" }}
          />
        </section>
        )
      ) : (
        <>
          {featured.length > 0 ? (
            <section className="container-site py-16 md:py-24" aria-labelledby="featured-collabs">
              <Eyebrow>Featured</Eyebrow>
              <h2 id="featured-collabs" className="sr-only">
                Featured partnerships
              </h2>
              <div className={cn("mt-8 grid gap-4 md:gap-5", featured.length > 1 && "lg:grid-cols-2")}>
                {featured.map((collaboration, index) => (
                  <Reveal key={collaboration.id} delay={index * 100}>
                    <CollaborationCard collaboration={collaboration} variant="feature" />
                  </Reveal>
                ))}
              </div>
            </section>
          ) : null}

          {partners.length > 0 ? (
            <section className="border-t border-white/[0.07] py-16 md:py-24" aria-labelledby="partners-title">
              <div className="container-site">
                <div className="flex items-end justify-between gap-6">
                  <div>
                    <Eyebrow>Partners</Eyebrow>
                    <h2 id="partners-title" className="text-display-sm mt-5 text-ink-50">
                      Who we&apos;ve worked with
                    </h2>
                  </div>
                  <p className="text-eyebrow hidden text-ink-500 sm:block">{pluralize(partners.length, "partner")}</p>
                </div>
                <ul className="mt-10 grid grid-cols-2 pl-px pt-px sm:grid-cols-3 lg:grid-cols-5">
                  {partners.map((partner) => {
                    const inner = (
                      <div className="flex h-28 items-center justify-center px-6 md:h-32">
                        <div className="flex h-10 w-full max-w-[9rem] items-center justify-center opacity-80 grayscale transition duration-500 group-hover:opacity-100 group-hover:grayscale-0">
                          <PartnerMark partner={partner} className="text-center" />
                        </div>
                      </div>
                    );
                    return (
                      <li key={partner.slug} className="group -ml-px -mt-px border border-white/[0.08] transition-colors hover:bg-ink-850">
                        {partner.websiteUrl ? (
                          <a href={partner.websiteUrl} target="_blank" rel="noopener noreferrer" aria-label={`${partner.name} (opens in a new tab)`}>
                            {inner}
                          </a>
                        ) : (
                          inner
                        )}
                      </li>
                    );
                  })}
                </ul>
              </div>
            </section>
          ) : null}

          <section className="border-t border-white/[0.07] py-16 md:py-24" aria-labelledby="archive-title">
            <div className="container-site">
              <Eyebrow>Chronological archive</Eyebrow>
              <h2 id="archive-title" className="text-display-sm mt-5 text-ink-50">
                Every partnership, in order
              </h2>
              <div className="mt-12 space-y-14">
                {years.map(([year, items]) => (
                  <div key={year} className="grid grid-cols-1 gap-6 lg:grid-cols-12 lg:gap-10">
                    <div className="lg:col-span-3">
                      <p className="font-display text-6xl font-light tracking-[-0.06em] text-ink-500 lg:sticky lg:top-[calc(var(--header-height)+2rem)]">
                        {year}
                      </p>
                    </div>
                    <ul className="divide-y divide-white/[0.07] border-y border-white/[0.07] lg:col-span-9">
                      {items.map((item) => (
                        <li key={item.id} className="group relative">
                          <div className="grid grid-cols-1 gap-3 py-6 md:grid-cols-12 md:items-center md:gap-6">
                            <p className="text-eyebrow text-ink-500 md:col-span-3">
                              {item.date ? formatDate(item.date.date, item.date.precision, "short") : "—"}
                            </p>
                            <div className="md:col-span-6">
                              <h3 className="font-display text-xl font-medium tracking-[-0.03em] text-ink-50 transition-colors group-hover:text-white">
                                <Link href={`/partnerships/${item.slug}`} className="after:absolute after:inset-0">
                                  {item.title}
                                </Link>
                              </h3>
                              <p className="mt-1 text-sm text-ink-400">
                                {COLLABORATION_CATEGORY_LABELS[item.category]}
                                {item.partners.length ? ` · ${item.partners.map((p) => p.name).join(", ")}` : ""}
                              </p>
                            </div>
                            <div className="flex items-center justify-between gap-4 md:col-span-3 md:justify-end">
                              {item.sourceUrl ? (
                                <a href={item.sourceUrl} target="_blank" rel="noopener noreferrer" className="relative z-10 inline-flex items-center gap-1 text-xs text-ink-400 hover:text-ink-50">
                                  Source <ArrowUpRight aria-hidden className="h-3.5 w-3.5" />
                                  <span className="sr-only"> for {item.title} (opens in a new tab)</span>
                                </a>
                              ) : null}
                              <ArrowRight aria-hidden className="h-4 w-4 text-ink-500 transition-transform duration-500 group-hover:translate-x-1 group-hover:text-signal-500" />
                            </div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </>
      )}

      <ClosingCta
        headline="Let's grow your project together."
        body={`KOC campaigns, consultancy, digital marketing and blockchain development — talk to ${company.name}.`}
        primary={{ href: "/contact", label: "Start a conversation" }}
        secondary={{ href: "/services", label: "Explore our services" }}
      />
    </>
  );
}

function PartnerTierSection({
  id,
  eyebrow,
  title,
  description,
  partners,
  compact = false,
}: {
  id: string;
  eyebrow: string;
  title: string;
  description: string;
  partners: PartnerDTO[];
  compact?: boolean;
}) {
  if (partners.length === 0) return null;
  return (
    <section id={id} className="scroll-mt-20 border-t border-white/[0.07] py-16 md:py-24" aria-labelledby={`${id}-title`}>
      <div className="container-site">
        <div className="flex items-end justify-between gap-6">
          <div>
            <Eyebrow>{eyebrow}</Eyebrow>
            <h2 id={`${id}-title`} className="text-display-sm mt-5 text-ink-50">
              {title}
            </h2>
            <p className="mt-3 max-w-xl text-ink-400">{description}</p>
          </div>
          <p className="text-eyebrow hidden shrink-0 text-ink-500 sm:block">{pluralize(partners.length, "partner")}</p>
        </div>
        {compact ? (
          // The long list: two columns even on phones, and collapsed until asked for.
          <div className="mt-10">
            <Expandable collapsedHeight={620} moreLabel={`Show all ${partners.length} partners`}>
              <ul className="grid grid-cols-2 gap-2 sm:gap-2.5 lg:grid-cols-3 xl:grid-cols-4">
                {partners.map((partner) => (
                  <li key={partner.slug} className="lazy-row min-w-0">
                    <PartnerTile partner={partner} size="compact" />
                  </li>
                ))}
              </ul>
            </Expandable>
          </div>
        ) : (
          <ul className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {partners.map((partner, index) => (
              <Reveal as="li" key={partner.slug} delay={(index % 4) * 60}>
                <PartnerTile partner={partner} />
              </Reveal>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
