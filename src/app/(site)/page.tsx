import type { Metadata } from "next";
import { CapabilityCard, CollaborationCard, PartnerMark, TeamCard } from "@/components/cards/content-cards";
import { ProductCard } from "@/components/cards/product-card";
import { ProjectCard } from "@/components/cards/project-card";
import { Reveal } from "@/components/motion/reveal";
import { HomeHero } from "@/components/sections/home-hero";
import { ClosingCta, DirectionStrip, PrinciplesSection } from "@/components/sections/shared-sections";
import { JsonLdScript } from "@/components/seo/json-ld-script";
import { TextLink } from "@/components/ui/button";
import { SectionHeader } from "@/components/ui/section";
import {
  getCapabilities,
  getCompany,
  getFeaturedCollaborations,
  getFeaturedProducts,
  getFeaturedProjects,
  getPartners,
  getPrinciples,
  getRecentMilestones,
  getSettings,
  getSocialLinks,
  getTeamPreview,
} from "@/lib/content/public";
import type { MilestoneDTO, ProductCardDTO } from "@/lib/content/types";
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

function ProductsBento({ products }: { products: ProductCardDTO[] }) {
  if (products.length === 1) {
    return <ProductCard product={products[0]!} variant="feature" priority />;
  }
  const [first, ...rest] = products;
  return (
    <div className="grid grid-cols-1 gap-4 md:gap-5 lg:grid-cols-12">
      <Reveal className="lg:col-span-7 lg:row-span-2">
        <ProductCard product={first!} variant="feature" />
      </Reveal>
      {rest.slice(0, 4).map((product, index) => (
        <Reveal key={product.id} delay={index * 90} className={cn(rest.length === 1 ? "lg:col-span-5 lg:row-span-2" : "lg:col-span-5")}>
          <ProductCard product={product} />
        </Reveal>
      ))}
    </div>
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
  const [company, principles, products, projects, capabilities, collaborations, partners, milestones, team, socials] = await Promise.all([
    getCompany(),
    getPrinciples(),
    getFeaturedProducts(5),
    getFeaturedProjects(3),
    getCapabilities(),
    getFeaturedCollaborations(3),
    getPartners(),
    getRecentMilestones(4),
    getTeamPreview(4),
    getSocialLinks(),
  ]);

  let counter = 0;
  const next = () => indexLabel(++counter);
  const [introLead, introRest] = splitFirstSentence(company.introBody ?? company.shortDescription);
  const featuredCapabilities = (capabilities.some((c) => c.featured) ? capabilities.filter((c) => c.featured) : capabilities).slice(0, 6);
  const partnersWithLogos = partners.filter((partner) => partner.logo);

  return (
    <>
      <HomeHero company={company} />

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

      {/* Featured products */}
      {products.length > 0 ? (
        <section className="relative border-t border-white/[0.07] py-24 md:py-32" aria-labelledby="products-title">
          <div className="container-site">
            <SectionHeader
              index={next()}
              eyebrow="Products"
              title={<span id="products-title">Useful products, carefully made.</span>}
              description="A selection of products from the Unique Labs ecosystem."
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
                  <ProjectCard project={project} variant={projects.length === 1 ? "feature" : "default"} />
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {/* What we do */}
      {featuredCapabilities.length > 0 ? (
        <section className="relative border-t border-white/[0.07] py-24 md:py-32" aria-labelledby="capabilities-title">
          <div className="container-site">
            <SectionHeader
              index={next()}
              eyebrow="What we do"
              title={<span id="capabilities-title">Focused on the tools people use every day.</span>}
              description={company.whatWeDoIntro}
              action={<TextLink href="/what-we-do">Explore what we do</TextLink>}
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
            <div className="mt-14 grid grid-cols-2 gap-x-4 gap-y-12 md:mt-20 md:gap-x-5 lg:grid-cols-4">
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
