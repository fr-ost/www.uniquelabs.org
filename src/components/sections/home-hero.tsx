import Link from "next/link";
import { Fragment } from "react";
import { ArrowRight } from "lucide-react";
import { CountUp } from "@/components/motion/count-up";
import { Spotlight } from "@/components/motion/spotlight";
import { ButtonLink } from "@/components/ui/button";
import { MediaImage } from "@/components/ui/media-image";
import { Aurora } from "@/components/visuals/aurora";
import { HeroVisual } from "@/components/visuals/hero-visual";
import type { CompanyDTO, PartnerDTO } from "@/lib/content/types";

/**
 * Splits a headline into words that rise into view. The final word gets the
 * brand gradient; a trailing "." becomes the signal dot.
 */
function AnimatedHeadline({ text }: { text: string }) {
  const trimmed = text.trim();
  const endsWithPeriod = trimmed.endsWith(".");
  const words = (endsWithPeriod ? trimmed.slice(0, -1) : trimmed).split(/\s+/);
  return (
    <>
      <span className="sr-only">{trimmed}</span>
      <span aria-hidden>
        {words.map((word, index) => {
          const last = index === words.length - 1;
          return (
            <Fragment key={`${word}-${index}`}>
              <span className="-mb-[0.16em] inline-block overflow-hidden pb-[0.16em] align-bottom">
                <span className="inline-block animate-word-rise" style={{ animationDelay: `${120 + index * 70}ms` }}>
                  <span className={last ? "text-gradient animate-shimmer" : undefined}>{word}</span>
                  {last && endsWithPeriod ? <span className="text-signal-500">.</span> : null}
                </span>
              </span>
              {/* The space lives between the word boxes: inside an inline-block it would be dropped. */}
              {last ? null : " "}
            </Fragment>
          );
        })}
      </span>
    </>
  );
}

export interface HeroStat {
  label: string;
  value: number;
}

export function HomeHero({
  company,
  stats,
  partners,
  partnerCount,
}: {
  company: CompanyDTO;
  /** Real counts taken from the content files (partners, products, services…). */
  stats: HeroStat[];
  /** A few partners whose logos are shown next to the count. */
  partners: PartnerDTO[];
  partnerCount: number;
}) {
  return (
    <section className="relative isolate overflow-hidden" aria-labelledby="hero-title">
      <Aurora />
      <div aria-hidden className="grid-lines mask-fade-radial pointer-events-none absolute inset-0 opacity-60" />
      <div className="grain pointer-events-none absolute inset-0" aria-hidden />
      <Spotlight />

      <div className="container-site relative grid min-h-[min(100svh,62rem)] grid-cols-1 items-center gap-12 pt-[calc(var(--header-height)+2.5rem)] pb-12 lg:grid-cols-12 lg:gap-10 lg:pb-14">
        <div className="relative z-10 lg:col-span-7">
          {company.heroEyebrow ? (
            <p className="inline-flex max-w-full animate-fade-in items-center gap-2.5 rounded-full border border-white/10 bg-white/[0.045] py-2 pr-4 pl-3 font-mono text-[0.625rem] leading-relaxed font-medium tracking-[0.14em] text-ink-200 uppercase shadow-[0_1px_0_0_rgba(255,255,255,0.06)_inset] backdrop-blur-md sm:text-[0.6875rem] sm:tracking-[0.16em]">
              <span aria-hidden className="relative flex h-2 w-2 shrink-0">
                <span className="absolute inline-flex h-full w-full animate-ping-slow rounded-full bg-signal-500/70" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-signal-500" />
              </span>
              {company.heroEyebrow}
            </p>
          ) : null}
          <h1 id="hero-title" className="text-display-xl mt-8 max-w-[11.5ch] text-ink-50">
            <AnimatedHeadline text={company.heroHeadline} />
          </h1>
          <p className="text-lede mt-8 max-w-[34rem] animate-blur-in text-ink-300 [animation-delay:520ms]">{company.heroDescription}</p>
          <div className="mt-10 flex animate-fade-up flex-col gap-3 [animation-delay:640ms] sm:flex-row">
            <ButtonLink href="/services" size="lg" arrow>
              {company.primaryCtaLabel}
            </ButtonLink>
            <ButtonLink href="/about" size="lg" variant="secondary">
              {company.secondaryCtaLabel}
            </ButtonLink>
          </div>

          {partnerCount > 0 ? (
            <Link
              href="/partnerships"
              className="group mt-10 inline-flex animate-fade-up items-center gap-4 rounded-full [animation-delay:780ms]"
            >
              <span aria-hidden className="flex shrink-0 -space-x-2.5">
                {partners.map((partner) =>
                  partner.logo ? (
                    <span
                      key={partner.slug}
                      className="relative h-9 w-9 overflow-hidden rounded-full border-2 border-ink-900 bg-ink-800 transition-transform duration-500 ease-[var(--ease-out-expo)] group-hover:-translate-y-0.5"
                    >
                      <MediaImage media={partner.logo} alt="" fill sizes="36px" priority />
                    </span>
                  ) : null,
                )}
              </span>
              <span className="text-sm text-ink-300">
                <span className="font-medium text-ink-50">{partnerCount} partners</span> across exchanges, launchpads and chains
                <ArrowRight
                  aria-hidden
                  className="ml-1.5 inline h-3.5 w-3.5 align-[-0.15em] text-ink-400 transition-transform duration-300 group-hover:translate-x-1 group-hover:text-signal-400"
                />
              </span>
            </Link>
          ) : null}
        </div>

        <div className="relative lg:col-span-5">
          <div className="mx-auto w-full max-w-[30rem] sm:max-w-[34rem] lg:max-w-none lg:scale-[1.04] xl:scale-[1.08]">
            <HeroVisual labels={["KOC & consultancy", "Digital marketing", "Blockchain"]} />
          </div>
        </div>
      </div>

      {stats.length > 0 ? (
        <div className="container-site relative pb-12 md:pb-14">
          {/* Invisible for the first 900ms (fade-in delay), so the numbers can start from zero without a flicker. */}
          <dl className="grid animate-fade-in grid-cols-2 gap-x-6 gap-y-8 border-t border-white/[0.08] pt-8 [animation-delay:900ms] md:grid-cols-4">
            {stats.map((stat, index) => (
              <div key={stat.label} className="flex flex-col-reverse">
                <dt className="text-eyebrow mt-3 text-ink-400">{stat.label}</dt>
                <dd className="font-display text-4xl font-medium tracking-[-0.05em] text-ink-50 md:text-5xl">
                  <CountUp value={stat.value} startOnMount delay={950 + index * 120} />
                </dd>
              </div>
            ))}
          </dl>
        </div>
      ) : null}
    </section>
  );
}
