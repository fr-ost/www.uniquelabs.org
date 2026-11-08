import { HeroVisual } from "@/components/visuals/hero-visual";
import { ButtonLink } from "@/components/ui/button";
import { Eyebrow } from "@/components/ui/section";
import type { CompanyDTO } from "@/lib/content/types";

/** Splits a headline into words that rise into view; a trailing "." becomes the signal dot. */
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
            <span key={`${word}-${index}`} className="-mb-[0.16em] inline-block overflow-hidden pb-[0.16em] align-bottom">
              <span
                className="inline-block animate-word-rise"
                style={{ animationDelay: `${120 + index * 70}ms` }}
              >
                {word}
                {last && endsWithPeriod ? <span className="text-signal-500">.</span> : null}
              </span>
              {last ? null : " "}
            </span>
          );
        })}
      </span>
    </>
  );
}

const FACTS: Array<{ term: string; detail: string }> = [
  { term: "Starting with", detail: "Chrome extensions" },
  { term: "Core products", detail: "Free, without artificial paywalls" },
  { term: "Data", detail: "Local-first wherever practical" },
  { term: "Standard", detail: "Quality over quantity" },
];

export function HomeHero({ company }: { company: CompanyDTO }) {
  return (
    <section className="relative isolate overflow-hidden" aria-labelledby="hero-title">
      <div aria-hidden className="grid-lines mask-fade-radial pointer-events-none absolute inset-0 opacity-80" />
      <div
        aria-hidden
        className="pointer-events-none absolute -top-[22rem] left-[8%] h-[46rem] w-[46rem] rounded-full bg-[radial-gradient(circle,rgba(156,184,242,0.07),transparent_62%)] blur-2xl"
      />
      <div className="grain pointer-events-none absolute inset-0" aria-hidden />

      <div className="container-site relative grid min-h-[min(100svh,62rem)] items-center gap-6 pt-[calc(var(--header-height)+2.5rem)] pb-10 lg:grid-cols-12 lg:gap-10 lg:pb-16">
        <div className="relative z-10 lg:col-span-7">
          {company.heroEyebrow ? (
            <Eyebrow className="animate-fade-in">{company.heroEyebrow}</Eyebrow>
          ) : null}
          <h1 id="hero-title" className="text-display-xl mt-8 max-w-[11.5ch] text-ink-50">
            <AnimatedHeadline text={company.heroHeadline} />
          </h1>
          <p className="text-lede mt-8 max-w-[34rem] animate-fade-up text-ink-300 [animation-delay:520ms]">
            {company.heroDescription}
          </p>
          <div className="mt-10 flex animate-fade-up flex-col gap-3 [animation-delay:640ms] sm:flex-row">
            <ButtonLink href="/products" size="lg" arrow>
              {company.primaryCtaLabel}
            </ButtonLink>
            <ButtonLink href="/about" size="lg" variant="secondary">
              {company.secondaryCtaLabel}
            </ButtonLink>
          </div>
        </div>

        <div className="relative lg:col-span-5">
          <div className="mx-auto w-full max-w-[30rem] sm:max-w-[34rem] lg:max-w-none lg:scale-[1.04] xl:scale-[1.08]">
            <HeroVisual labels={["Local-first", "Private by design", "Free at the core"]} />
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
