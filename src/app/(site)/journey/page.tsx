import type { Metadata } from "next";
import { JourneyTimeline } from "@/components/sections/journey-timeline";
import { ClosingCta, EmptyState } from "@/components/sections/shared-sections";
import { PageHero } from "@/components/ui/section";
import { getCompany, getMilestones } from "@/lib/content/public";
import { pageMetadata } from "@/lib/seo/metadata";
import { yearOf } from "@/lib/utils";

export async function generateMetadata(): Promise<Metadata> {
  const company = await getCompany();
  return pageMetadata({
    title: "Our Journey",
    description: `How ${company.name} grew from a group of friends hunting airdrops in 2019 into a Web3 growth and software company.`,
    path: "/journey",
  });
}

export default async function JourneyPage() {
  const [milestones, company] = await Promise.all([getMilestones(), getCompany()]);
  const years = [...new Set(milestones.map((m) => yearOf(m.date)))];

  return (
    <>
      <PageHero
        eyebrow="Our journey"
        title={
          <>
            The story so far<span className="text-signal-500">.</span>
          </>
        }
        description={`${company.name} started in 2019 as a group of friends hunting airdrops and doing pay-to-work jobs. We kept exploring — and this is where it led.`}
      >
        {years.length > 1 ? (
          <nav aria-label="Jump to year">
            <ul className="flex flex-wrap gap-2">
              {years.map((year) => (
                <li key={year}>
                  <a
                    href={`#year-${year}`}
                    className="inline-flex h-9 items-center rounded-full border border-white/10 px-4 font-mono text-xs tracking-[0.1em] text-ink-300 transition-colors hover:border-white/25 hover:text-ink-50"
                  >
                    {year}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        ) : null}
      </PageHero>

      <section className="container-site py-16 md:py-28" aria-label="Timeline">
        {milestones.length === 0 ? (
          <EmptyState
            title="No milestones published yet"
            body="Verified milestones — launches, collaborations and important moments — will appear here."
            action={{ href: "/about", label: `About ${company.name}` }}
          />
        ) : (
          <div className="mx-auto max-w-5xl">
            <JourneyTimeline milestones={milestones} />
          </div>
        )}
      </section>

      <ClosingCta headline={company.closingHeadline} body={company.closingBody} />
    </>
  );
}
