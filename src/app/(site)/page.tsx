import type { Metadata } from "next";
import { CapabilityCard, CollaborationCard, PartnerMark, TeamCard } from "@/components/cards/content-cards";
import { ProductCard } from "@/components/cards/product-card";
import { ProjectCard } from "@/components/cards/project-card";
import { CountUp } from "@/components/motion/count-up";
import { Marquee } from "@/components/motion/marquee";
import { Reveal } from "@/components/motion/reveal";
import { MediaImage } from "@/components/ui/media-image";
import { HomeHero } from "@/components/sections/home-hero";
import { ClosingCta, DirectionStrip, PrinciplesSection } from "@/components/sections/shared-sections";
import { JsonLdScript } from "@/components/seo/json-ld-script";
import { ButtonLink, TextLink } from "@/components/ui/button";
import { SectionHeader } from "@/components/ui/section";
import {
  getCapabilities,
  getCompany,
  getFeaturedCollaborations,
  getFeaturedProducts,
  getFeaturedProjects,
  getPartnerTiers,
  getPartners,
  getPrinciples,
  getProducts,
  getRecentMilestones,
  getSettings,
  getSocialLinks,
  getTeamPreview,
} from "@/lib/content/public";
import type { MilestoneDTO, PartnerDTO, ProductCardDTO } from "@/lib/content/types";
import { MILESTONE_KIND_LABELS } from "@/lib/labels";
import { pageMetadata } from "@/lib/seo/metadata";
import { organizationJsonLd, websiteJsonLd } from "@/lib/seo/json-ld";
import { cn, formatDate, indexLabel, yearOf } from "@/lib/utils";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSettings();
  return pageMetadata({
    title: settings.seoTitleDefault,
    absoluteTitle: true,
    description: settings.seoDescription,
    path: "/",
  });
}

function splitFirstSentence(text: string): [string, string] {
  const match = text.match(/^(.+?[.!?])\s+(.*)$/s);
  return match ? [match[1]!, match[2]!] : [text, ""];
}

/** One wide lead product, then the rest in an even grid. */
function ProductsBento({ products }: { products: ProductCardDTO[] }) {
  const [first, ...rest] = products;
  if (!first) return null;
  const columns =
    rest.length === 1 ? "" : rest.length === 2 || rest.length === 4 ? "sm:grid-cols-2" : "sm:grid-cols-2 lg:grid-cols-3";
  return (
    <div className="space-y-4 md:space-y-5">
      <Reveal kind="scale">
        <ProductCard product={first} variant="wide" priority />
      </Reveal>
      {rest.length > 0 ? (
        <div className={cn("grid grid-cols-1 gap-4 md:gap-5", columns)}>
          {rest.map((product, index) => (
            <Reveal key={product.id} delay={(index % 3) * 90}>
              <ProductCard product={product} />
            </Reveal>
          ))}
        </div>
      ) : null}
    </div>
  );
}

/** A partner as it appears in the moving rows on the home page. */
function PartnerChip({ partner, duplicate }: { partner: PartnerDTO; duplicate: boolean }) {
  const external = Boolean(partner.xHandle);
  return (
    <a
      href={partner.xHandle ? `https://x.com/${partner.xHandle}` : "/partnerships"}
      target={external ? "_blank" : undefined}
      rel={external ? "noopener noreferrer" : undefined}
      tabIndex={duplicate ? -1 : undefined}
      className="group flex items-center gap-3 rounded-2xl border border-white/[0.08] bg-white/[0.025] py-2.5 pr-5 pl-2.5 transition-colors duration-300 hover:border-white/20 hover:bg-white/[0.07]"
    >
      <span className="relative flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-white/10 bg-ink-800">
        {partner.logo ? (
          <MediaImage media={partner.logo} alt="" fill sizes="44px" eager={!duplicate} />
        ) : (
          <span aria-hidden className="font-display text-sm text-ink-200">
            {partner.name.slice(0, 2).toUpperCase()}
          </span>
        )}
      </span>
      <span className="whitespace-nowrap">
        <span className="block text-[0.9375rem] leading-tight font-medium text-ink-50">{partner.name}</span>
        {partner.role ? <span className="mt-1 block text-xs leading-tight text-ink-400 transition-colors group-hover:text-signal-300">{partner.role}</span> : null}
      </span>
    </a>
  );
}

function JourneyPreview({ milestones }: { milestones: MilestoneDTO[] }) {
  return (
    <ol className="relative grid grid-cols-1 gap-px overflow-hidden rounded-[var(--radius-panel)] border border-white/[0.08] bg-white/[0.08] sm:grid-cols-2 lg:grid-cols-4">
      {milestones.map((milestone, index) => (
        <Reveal as="li" key={milestone.id} delay={index * 90} className="relative bg-ink-900 p-7 md:p-8">
          <span className="font-display text-5xl font-light tracking-[-0.05em] text-ink-300">{yearOf(milestone.date)}</span>
          <p className="text-eyebrow mt-8 text-signal-400">{MILESTONE_KIND_LABELS[milestone.kind]}</p>
          <h3 className="mt-3 font-display text-lg font-medium tracking-[-0.03em] text-ink-50">{milestone.title}</h3>
          <p className="mt-2 text-sm text-ink-400">{formatDate(milestone.date, milestone.precision)}</p>
        </Reveal>
      ))}
    </ol>
  );
}

export default async function HomePage() {
  const [company, principles, products, projects, capabilities, collaborations, partners, milestones, team, socials, partnerTiers, allProducts] = await Promise.all([
    getCompany(),
    getPrinciples(),
    getFeaturedProducts(7),
    getFeaturedProjects(3),
    getCapabilities(),
    getFeaturedCollaborations(3),
    getPartners(),
    getRecentMilestones(4),
    getTeamPreview(5),
    getSocialLinks(),
    getPartnerTiers(),
    getProducts(),
  ]);

  let counter = 0;
  const next = () => indexLabel(++counter);
  const [introLead, introRest] = splitFirstSentence(company.introBody ?? company.shortDescription);
  const featuredCapabilities = (capabilities.some((c) => c.featured) ? capabilities.filter((c) => c.featured) : capabilities).slice(0, 6);
  const partnersWithLogos = partners.filter((partner) => partner.logo);
  const partnerCount = partnerTiers.tier1.length + partnerTiers.tier2.length;
  // Every figure below is counted from the content files — nothing is typed in by hand.
  const stats = [
    { label: "Partners worked with", value: partnerCount },
    { label: "Tier 1 partners", value: partnerTiers.tier1.length },
    { label: "Products built in-house", value: allProducts.length },
    { label: "Core services", value: capabilities.length },
  ].filter((stat) => stat.value > 0);
  const partnerRows = [0, 1, 2].map((row) => partnerTiers.tier1.filter((_, index) => index % 3 === row));

  return (
    <>
      <HomeHero company={company} stats={stats} partners={partnerTiers.tier1.filter((partner) => partner.logo).slice(0, 5)} partnerCount={partnerCount} />

      {/* Introduction */}
      <section className="relative py-24 md:py-36" aria-labelledby="intro-title">
        <div className="container-site">
          <SectionHeader
            index={next()}
            eyebrow="Introduction"
            title={<span id="intro-title">{company.introHeading ?? `About ${company.name}`}</span>}
          />
          <div className="mt-12 grid grid-cols-1 lg:grid-cols-12 lg:gap-10">
            <Reveal className="lg:col-span-8 lg:col-start-4">
              <p className="text-display-sm text-ink-500">
                <span className="text-ink-50">{introLead}</span> {introRest}
              </p>
              <div className="mt-10">
                <TextLink href="/about">More about {company.name}</TextLink>
              </div>
            </Reveal>
          </div>
          <div className="mt-20 md:mt-28 lg:grid lg:grid-cols-12 lg:gap-10">
            <div className="lg:col-span-9 lg:col-start-4">
              <DirectionStrip />
            </div>
          </div>
        </div>
      </section>

      {/* Services */}
      {featuredCapabilities.length > 0 ? (
        <section className="relative border-t border-white/[0.07] py-24 md:py-32" aria-labelledby="capabilities-title">
          <div className="container-site">
            <SectionHeader
              index={next()}
              eyebrow="Services"
              title={<span id="capabilities-title">What we do.</span>}
              description={company.whatWeDoIntro}
              action={<TextLink href="/services">All services</TextLink>}
            />
            <div className="mt-14 grid grid-cols-1 gap-4 sm:grid-cols-2 md:mt-20 md:gap-5 lg:grid-cols-3">
              {featuredCapabilities.map((capability, index) => (
                <Reveal key={capability.id} delay={(index % 3) * 90}>
                  <CapabilityCard capability={capability} index={index} />
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {/* Partners */}
      {partnerTiers.tier1.length > 0 ? (
        <section className="relative overflow-hidden border-t border-white/[0.07] py-24 md:py-32" aria-labelledby="partners-title">
          <div
            aria-hidden
            className="pointer-events-none absolute top-1/2 left-1/2 h-[40rem] w-[70rem] -translate-x-1/2 -translate-y-1/2 animate-glow-pulse rounded-full bg-[radial-gradient(closest-side,rgba(139,92,246,0.10),transparent)]"
          />
          <div className="container-site relative">
            <SectionHeader
              index={next()}
              eyebrow="Partners"
              title={<span id="partners-title">Trusted across Web3.</span>}
              description="Exchanges, launchpads and ecosystems we've worked with — as ambassadors, KOC and KOL partners and campaign partners."
              action={<TextLink href="/partnerships">All partners</TextLink>}
            />
          </div>

          <Reveal kind="fade" className="relative mt-14 space-y-3 md:mt-20 md:space-y-4">
            {partnerRows.map((row, index) => (
              <Marquee
                key={index}
                items={row}
                getKey={(partner) => partner.slug}
                label={`Tier 1 partners, row ${index + 1}`}
                reverse={index === 1}
                duration={[78, 92, 84][index]}
                gap="0.875rem"
                renderItem={(partner, duplicate) => <PartnerChip partner={partner} duplicate={duplicate} />}
              />
            ))}
          </Reveal>

          <div className="container-site relative mt-14 md:mt-20">
            <Reveal className="grid grid-cols-3 items-start gap-x-4 gap-y-8 rounded-[var(--radius-panel)] border border-white/[0.08] bg-white/[0.02] p-6 md:p-9 lg:grid-cols-[repeat(3,minmax(0,1fr))_auto] lg:items-center">
              {[
                { label: "Partners in total", value: partnerCount },
                { label: "Tier 1 partners", value: partnerTiers.tier1.length },
                { label: "Tier 2 partners", value: partnerTiers.tier2.length },
              ].map((stat) => (
                <div key={stat.label}>
                  <p className="font-display text-4xl font-medium tracking-[-0.05em] text-ink-50 sm:text-5xl md:text-6xl">
                    <CountUp value={stat.value} />
                  </p>
                  <p className="text-eyebrow mt-3 leading-normal text-ink-400">{stat.label}</p>
                </div>
              ))}
              <div className="col-span-3 lg:col-span-1">
                <ButtonLink href="/partnerships" variant="secondary" arrow>
                  See every partner
                </ButtonLink>
              </div>
            </Reveal>
          </div>
        </section>
      ) : null}

      {/* Featured products */}
      {products.length > 0 ? (
        <section className="relative border-t border-white/[0.07] py-24 md:py-32" aria-labelledby="products-title">
          <div className="container-site">
            <SectionHeader
              index={next()}
              eyebrow="Products"
              title={<span id="products-title">Software we build in-house.</span>}
              description="Our own products — Chrome extensions built by the Unique Labs team."
              action={<TextLink href="/products">View all products</TextLink>}
            />
            <div className="mt-14 md:mt-20">
              <ProductsBento products={products} />
            </div>
          </div>
        </section>
      ) : null}

      {/* Selected work */}
      {projects.length > 0 ? (
        <section className="relative border-t border-white/[0.07] py-24 md:py-32" aria-labelledby="projects-title">
          <div className="container-site">
            <SectionHeader
              index={next()}
              eyebrow="Projects"
              title={<span id="projects-title">Selected work.</span>}
              description="Projects we have designed, built and shipped."
              action={<TextLink href="/projects">All projects</TextLink>}
            />
            <div className={cn("mt-14 grid grid-cols-1 gap-4 md:mt-20 md:gap-5", projects.length === 2 ? "md:grid-cols-2" : projects.length > 2 ? "md:grid-cols-2 lg:grid-cols-3" : "")}>
              {projects.map((project, index) => (
                <Reveal key={project.id} delay={index * 90}>
                  <ProjectCard project={project} variant={projects.length === 1 ? "wide" : "default"} />
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      ) : null}


      <PrinciplesSection index={next()} principles={principles} intro={company.philosophyIntro} />

      {/* Collaborations */}
      {collaborations.length > 0 ? (
        <section className="relative py-24 md:py-32" aria-labelledby="collaborations-title">
          <div className="container-site">
            <SectionHeader
              index={next()}
              eyebrow="Partnerships"
              title={<span id="collaborations-title">Partnerships & collaborations.</span>}
              description="The organisations and people we work with — each partnership linked to its original source."
              action={<TextLink href="/partnerships">All partnerships</TextLink>}
            />
            {partnersWithLogos.length >= 3 ? (
              <ul className="mask-fade-x mt-14 flex flex-wrap items-center gap-x-12 gap-y-6 md:mt-16">
                {partnersWithLogos.slice(0, 8).map((partner) => (
                  <li key={partner.slug} className="flex h-10 w-32 items-center opacity-70 grayscale transition hover:opacity-100 hover:grayscale-0">
                    <PartnerMark partner={partner} />
                  </li>
                ))}
              </ul>
            ) : null}
            <div
              className={cn(
                "mt-14 grid gap-4 md:mt-20 md:gap-5",
                collaborations.length === 1 ? "lg:grid-cols-1" : collaborations.length === 2 ? "md:grid-cols-2" : "md:grid-cols-2 lg:grid-cols-3",
              )}
            >
              {collaborations.map((collaboration, index) => (
                <Reveal key={collaboration.id} delay={index * 90}>
                  <CollaborationCard collaboration={collaboration} />
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {/* Journey */}
      {milestones.length > 0 ? (
        <section className="relative border-t border-white/[0.07] py-24 md:py-32" aria-labelledby="journey-title">
          <div className="container-site">
            <SectionHeader
              index={next()}
              eyebrow="Our journey"
              title={<span id="journey-title">The story so far.</span>}
              action={<TextLink href="/journey">See the full timeline</TextLink>}
            />
            <div className="mt-14 md:mt-20">
              <JourneyPreview milestones={milestones} />
            </div>
          </div>
        </section>
      ) : null}

      {/* Team */}
      {team.length > 0 ? (
        <section className="relative border-t border-white/[0.07] py-24 md:py-32" aria-labelledby="team-title">
          <div className="container-site">
            <SectionHeader
              index={next()}
              eyebrow="Our team"
              title={<span id="team-title">The people behind {company.name}.</span>}
              action={<TextLink href="/team">Meet the team</TextLink>}
            />
            <div className={cn("mt-14 grid grid-cols-2 gap-x-4 gap-y-12 md:mt-20 md:gap-x-5", team.length >= 5 ? "lg:grid-cols-5" : "lg:grid-cols-4")}>
              {team.map((member, index) => (
                <Reveal key={member.id} delay={index * 90}>
                  <TeamCard member={member} />
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      <ClosingCta headline={company.closingHeadline} body={company.closingBody} />

      <JsonLdScript data={[organizationJsonLd(company, socials), websiteJsonLd(company)]} />
    </>
  );
}
