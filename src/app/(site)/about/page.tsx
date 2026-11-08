import type { Metadata } from "next";
import { Reveal } from "@/components/motion/reveal";
import { ClosingCta, DirectionStrip, PrinciplesSection } from "@/components/sections/shared-sections";
import { Markdown } from "@/components/ui/markdown";
import { PageHero } from "@/components/ui/section";
import { getCompany, getPrinciples } from "@/lib/content/public";
import { clampDescription, pageMetadata } from "@/lib/seo/metadata";
import { formatDate, indexLabel } from "@/lib/utils";

export async function generateMetadata(): Promise<Metadata> {
  const company = await getCompany();
  return pageMetadata({
    title: "About",
    description: clampDescription(
      `${company.name}: who we are, why we exist, and the principles behind every product we build. ${company.shortDescription}`,
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
  const [company, principles] = await Promise.all([getCompany(), getPrinciples()]);

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
            Useful technology, made accessible<span className="text-signal-500">.</span>
          </>
        }
        description={company.shortDescription}
        aside={
          company.founded ? (
            <dl className="surface-card p-6">
              <dt className="text-eyebrow text-ink-400">Established</dt>
              <dd className="mt-3 font-display text-3xl tracking-[-0.04em] text-ink-50">
                {formatDate(company.founded.date, company.founded.precision)}
              </dd>
            </dl>
          ) : undefined
        }
      />

      <div className="container-site">
        <div className="grid gap-10 py-10 lg:grid-cols-12 lg:py-16">
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
                <div className="mt-6 grid gap-4 md:grid-cols-2">
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
          <div className="grid gap-10 py-10 lg:grid-cols-12 lg:py-16">
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

      <ClosingCta headline={company.closingHeadline} body={company.closingBody} />
    </>
  );
}
