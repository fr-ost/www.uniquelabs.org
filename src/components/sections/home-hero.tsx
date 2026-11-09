import { Fragment } from "react";
import { ButtonLink } from "@/components/ui/button";
import { Eyebrow } from "@/components/ui/section";
import { Aurora } from "@/components/visuals/aurora";
import { HeroVisual } from "@/components/visuals/hero-visual";
import type { CompanyDTO } from "@/lib/content/types";

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

const FACTS: Array<{ term: string; detail: string }> = [
  { term: "Launch", detail: "KOC & consultancy" },
  { term: "Grow", detail: "Digital marketing" },
  { term: "Build", detail: "Blockchain development" },
  { term: "In-house", detail: "Software & AI products" },
];

export function HomeHero({ company }: { company: CompanyDTO }) {
  return (
    <section className="relative isolate overflow-hidden" aria-labelledby="hero-title">
      <Aurora />
      <div aria-hidden className="grid-lines mask-fade-radial pointer-events-none absolute inset-0 opacity-60" />
      <div className="grain pointer-events-none absolute inset-0" aria-hidden />

      <div className="container-site relative grid min-h-[min(100svh,64rem)] grid-cols-1 items-center gap-12 pt-[calc(var(--header-height)+2.5rem)] pb-12 lg:grid-cols-12 lg:gap-10 lg:pb-16">
        <div className="relative z-10 lg:col-span-7">
          {company.heroEyebrow ? <Eyebrow className="animate-fade-in">{company.heroEyebrow}</Eyebrow> : null}
          <h1 id="hero-title" className="text-display-xl mt-8 max-w-[11.5ch] text-ink-50">
            <AnimatedHeadline text={company.heroHeadline} />
          </h1>
          <p className="text-lede mt-8 max-w-[34rem] animate-fade-up text-ink-300 [animation-delay:520ms]">{company.heroDescription}</p>
          <div className="mt-10 flex animate-fade-up flex-col gap-3 [animation-delay:640ms] sm:flex-row">
            <ButtonLink href="/services" size="lg" arrow>
              {company.primaryCtaLabel}
            </ButtonLink>
            <ButtonLink href="/about" size="lg" variant="secondary">
              {company.secondaryCtaLabel}
            </ButtonLink>
          </div>
        </div>

        <div className="relative lg:col-span-5">
          <div className="mx-auto w-full max-w-[30rem] sm:max-w-[34rem] lg:max-w-none lg:scale-[1.04] xl:scale-[1.08]">
            <HeroVisual labels={["KOC & consultancy", "Digital marketing", "Blockchain"]} />
          </div>
        </div>
      </div>

      <div className="container-site relative pb-12">
        <dl className="grid animate-fade-in grid-cols-2 gap-x-6 gap-y-6 border-t border-white/[0.08] pt-6 [animation-delay:900ms] md:grid-cols-4">
          {FACTS.map((fact) => (
            <div key={fact.term}>
              <dt className="text-eyebrow text-ink-500">{fact.term}</dt>
              <dd className="mt-2.5 text-sm text-ink-200">{fact.detail}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
