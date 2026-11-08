import Link from "next/link";
import { Fragment } from "react";
import { ArrowRight } from "lucide-react";
import { MarketPulse } from "@/components/market/sections";
import { ButtonLink } from "@/components/ui/button";
import { Eyebrow } from "@/components/ui/section";
import { Aurora } from "@/components/visuals/aurora";
import { HeroVisual } from "@/components/visuals/hero-visual";
import type { CompanyDTO } from "@/lib/content/types";
import { cn } from "@/lib/utils";

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
  { term: "Starting with", detail: "Chrome extensions" },
  { term: "Core products", detail: "Free, without artificial paywalls" },
  { term: "Data", detail: "Local-first wherever practical" },
  { term: "Standard", detail: "Quality over quantity" },
];

export function HomeHero({
  company,
  intelligence,
  marketLive,
  watchlist = [],
}: {
  company: CompanyDTO;
  /** Intelligence section is enabled (announcement + CTA). */
  intelligence: boolean;
  /** Live market widget can be shown in the hero. */
  marketLive: boolean;
  watchlist?: string[];
}) {
  return (
    <section className="relative isolate overflow-hidden" aria-labelledby="hero-title">
      <Aurora />
      <div aria-hidden className="grid-lines mask-fade-radial pointer-events-none absolute inset-0 opacity-60" />
      <div className="grain pointer-events-none absolute inset-0" aria-hidden />

      <div className="container-site relative grid min-h-[min(100svh,64rem)] grid-cols-1 items-center gap-12 pt-[calc(var(--header-height)+2.5rem)] pb-12 lg:grid-cols-12 lg:gap-10 lg:pb-16">
        <div className="relative z-10 lg:col-span-7">
          {intelligence ? (
            <Link
              href="/intelligence"
              className="group inline-flex max-w-full animate-fade-in items-center gap-2.5 rounded-full border border-white/12 bg-white/[0.05] py-1 pr-3 pl-1 text-xs text-ink-200 backdrop-blur transition-colors hover:border-white/25 hover:bg-white/[0.08] sm:text-sm"
            >
              <span className="shrink-0 rounded-full bg-[linear-gradient(110deg,var(--color-signal-500),var(--color-iris-500))] px-2.5 py-0.5 text-[0.7rem] font-semibold text-white">New</span>
              <span className="truncate">Unique Labs Intelligence — live crypto markets</span>
              <ArrowRight aria-hidden className="h-3.5 w-3.5 shrink-0 transition-transform group-hover:translate-x-0.5" />
            </Link>
          ) : company.heroEyebrow ? (
            <Eyebrow className="animate-fade-in">{company.heroEyebrow}</Eyebrow>
          ) : null}
          <h1 id="hero-title" className="text-display-xl mt-8 max-w-[11.5ch] text-ink-50">
            <AnimatedHeadline text={company.heroHeadline} />
          </h1>
          <p className="text-lede mt-8 max-w-[34rem] animate-fade-up text-ink-300 [animation-delay:520ms]">{company.heroDescription}</p>
          <div className="mt-10 flex animate-fade-up flex-col gap-3 [animation-delay:640ms] sm:flex-row">
            <ButtonLink href="/products" size="lg" arrow>
              {company.primaryCtaLabel}
            </ButtonLink>
            {intelligence ? (
              <ButtonLink href="/intelligence" size="lg" variant="secondary">
                Market Intelligence
              </ButtonLink>
            ) : (
              <ButtonLink href="/about" size="lg" variant="secondary">
                {company.secondaryCtaLabel}
              </ButtonLink>
            )}
          </div>
        </div>

        <div className="relative lg:col-span-5">
          <div className={cn("mx-auto w-full max-w-[30rem] sm:max-w-[34rem] lg:max-w-none", marketLive && "hidden lg:block lg:translate-x-12 lg:opacity-60")}>
            <HeroVisual labels={["Local-first", "Private by design", "Free at the core"]} annotations={!marketLive} />
          </div>
          {marketLive ? (
            <div className="relative mx-auto w-full max-w-[26rem] animate-fade-up [animation-delay:700ms] lg:absolute lg:bottom-[6%] lg:left-[-1.5rem] lg:w-[22.5rem]">
              <div className="motion-safe:animate-float">
                <MarketPulse symbols={watchlist} className="bg-ink-900/80" />
              </div>
            </div>
          ) : null}
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
