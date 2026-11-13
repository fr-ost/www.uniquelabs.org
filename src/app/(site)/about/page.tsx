import type { Metadata } from "next";
import { TeamCard } from "@/components/cards/content-cards";
import { CountUp } from "@/components/motion/count-up";
import { Reveal } from "@/components/motion/reveal";
import { ClosingCta, DirectionStrip, PrinciplesSection } from "@/components/sections/shared-sections";
import { StructureSection } from "@/components/sections/structure-section";
import { Markdown } from "@/components/ui/markdown";
import { TextLink } from "@/components/ui/button";
import { PageHero, SectionHeader } from "@/components/ui/section";
import { getCapabilities, getCompany, getDepartments, getMilestones, getPartners, getPrinciples, getProducts, getTeamPreview } from "@/lib/content/public";
import { clampDescription, pageMetadata } from "@/lib/seo/metadata";
import { cn, indexLabel, yearOf } from "@/lib/utils";

export async function generateMetadata(): Promise<Metadata> {
  const company = await getCompany();
  return pageMetadata({
    title: "About",
    description: clampDescription(
      `${company.name}: a group of friends who started with airdrops in 2019 and grew into a Web3 growth and software company. ${company.shortDescription}`,
    ),
    path: "/about",
  });
}

function Chapter({
  id,
  index,
  title,
  body,
  lead = false,
}: {
  id: string;
  index: string;
  title: string;
  body: string | null;
  lead?: boolean;
}) {
  if (!body) return null;
  return (
    <section id={id} aria-labelledby={`${id}-title`} className="scroll-mt-32 border-t border-white/[0.07] py-14 md:py-20">
      <Reveal>
        <p className="text-eyebrow text-signal-400">{index}</p>
        <h2 id={`${id}-title`} className="text-display-sm mt-4 text-ink-50">
          {title}
        </h2>
        <Markdown source={body} className={lead ? "mt-6 text-lg md:text-xl md:leading-relaxed" : "mt-6"} />
      </Reveal>
    </section>
  );
}

export default async function AboutPage() {
  const [company, principles, departments, partners, products, capabilities, milestones, team] = await Promise.all([
    getCompany(),
    getPrinciples(),
    getDepartments(),
    getPartners(),
    getProducts(),
    getCapabilities(),
    getMilestones(),
    getTeamPreview(5),
  ]);
  // Numbers come from the content files, never typed in.
  const firstYear = milestones.length > 0 ? Math.min(...milestones.map((m) => Number(yearOf(m.date)))) : null;
  const stats = [
    { label: "Partners", value: partners.length },
    { label: "Products", value: products.length },
    { label: "Services", value: capabilities.length },
  ].filter((stat) => stat.value > 0);

  const chapters = [
    { id: "who-we-are", title: "Who we are", body: company.whoWeAre, lead: true },
    { id: "why-we-exist", title: `Why ${company.name} exists`, body: company.whyWeExist },
  ].filter((c) => c.body);

  const toc = [
    ...chapters.map((c) => ({ id: c.id, title: c.title })),
    ...(company.mission || company.vision ? [{ id: "mission-vision", title: "Mission & vision" }] : []),
    ...(principles.length ? [{ id: "philosophy", title: "Our philosophy" }] : []),
    ...(company.approach ? [{ id: "approach", title: "Our approach to technology" }] : []),
    ...(company.longTermDirection ? [{ id: "direction", title: "Long-term direction" }] : []),
  ];

  return (
    <>
      <PageHero
        eyebrow={`About ${company.name}`}
        title={
          <>
            From a group of friends to a Web3 growth partner<span className="text-signal-500">.</span>
          </>
        }
        description={company.shortDescription}
        aside={
          <dl className="surface-card grid grid-cols-2 gap-x-6 gap-y-7 p-6 md:p-7">
            {firstYear ? (
              <div className="flex flex-col-reverse">
                <dt className="text-eyebrow mt-3 text-ink-400">Started</dt>
                <dd className="font-display text-3xl tracking-[-0.04em] text-ink-50 tabular">{firstYear}</dd>
              </div>
            ) : null}
            {stats.map((stat) => (
              <div key={stat.label} className="flex flex-col-reverse">
                <dt className="text-eyebrow mt-3 text-ink-400">{stat.label}</dt>
                <dd className="font-display text-3xl tracking-[-0.04em] text-ink-50">
                  <CountUp value={stat.value} />
                </dd>
              </div>
            ))}
          </dl>
        }
      />

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

          <div className="lg:col-span-8 lg:col-start-5">
            {chapters.map((chapter, index) => (
              <Chapter key={chapter.id} {...chapter} index={indexLabel(index + 1)} />
            ))}

            {company.mission || company.vision ? (
              <section
                id="mission-vision"
                aria-label="Mission and vision"
                className="scroll-mt-32 border-t border-white/[0.07] py-14 md:py-20"
              >
                <p className="text-eyebrow text-signal-400">{indexLabel(chapters.length + 1)}</p>
                <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
                  {company.mission ? (
                    <Reveal className="surface-card relative overflow-hidden p-7 md:p-8">
                      <p className="text-eyebrow text-ink-400">Our mission</p>
                      <p className="mt-6 font-display text-2xl leading-snug tracking-[-0.03em] text-ink-50">
                        {company.mission}
                      </p>
                    </Reveal>
                  ) : null}
                  {company.vision ? (
                    <Reveal delay={100} className="relative overflow-hidden rounded-[var(--radius-card)] bg-signal-500 p-7 text-ink-950 md:p-8">
                      <p className="text-eyebrow text-ink-950/70">Our vision</p>
                      <p className="mt-6 font-display text-2xl leading-snug tracking-[-0.03em]">{company.vision}</p>
                    </Reveal>
                  ) : null}
                </div>
              </section>
            ) : null}
          </div>
        </div>
      </div>

      <div id="philosophy" className="scroll-mt-20">
        <PrinciplesSection principles={principles} intro={company.philosophyIntro} title="Our philosophy." />
      </div>

      {company.approach || company.longTermDirection ? (
        <div className="container-site">
          <div className="grid grid-cols-1 gap-10 py-10 lg:grid-cols-12 lg:py-16">
            <div className="lg:col-span-8 lg:col-start-5">
              <Chapter
                id="approach"
                index={indexLabel(toc.findIndex((t) => t.id === "approach") + 1)}
                title="Our approach to technology"
                body={company.approach}
              />
              <Chapter
                id="direction"
                index={indexLabel(toc.findIndex((t) => t.id === "direction") + 1)}
                title="Our long-term direction"
                body={company.longTermDirection}
              />
            </div>
          </div>
          <div className="pb-24 lg:grid lg:grid-cols-12 lg:gap-10">
            <div className="lg:col-span-8 lg:col-start-5">
              <DirectionStrip />
            </div>
          </div>
        </div>
      ) : null}

      {team.length > 0 ? (
        <section className="relative border-t border-white/[0.07] py-24 md:py-32" aria-labelledby="about-team-title">
          <div className="container-site">
            <SectionHeader
              eyebrow="The people"
              title={<span id="about-team-title">Still the same friends.</span>}
              description="The group that started together in 2019 leads the company today."
              action={<TextLink href="/team">Meet the team</TextLink>}
            />
            <div className={cn("mt-14 grid grid-cols-2 gap-x-4 gap-y-12 md:mt-20 md:gap-x-5", team.length >= 5 ? "lg:grid-cols-5" : "lg:grid-cols-4")}>
              {team.map((member, index) => (
                <Reveal key={member.id} delay={index * 90}>
                  <TeamCard member={member} />
                </Reveal>
              ))}
            </div>
            {milestones.length > 0 ? (
              <p className="mt-14 text-ink-300">
                Want the whole story, year by year? <TextLink href="/journey">Read our journey</TextLink>
              </p>
            ) : null}
          </div>
        </section>
      ) : null}

      <StructureSection departments={departments} intro={company.structureIntro} />

      <ClosingCta headline={company.closingHeadline} body={company.closingBody} />
    </>
  );
}
