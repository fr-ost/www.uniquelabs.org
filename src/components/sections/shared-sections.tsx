import { Reveal } from "@/components/motion/reveal";
import { PauseOffscreen } from "@/components/motion/pause-offscreen";
import { Spotlight } from "@/components/motion/spotlight";
import { LogoMark } from "@/components/brand/logo";
import { ButtonLink } from "@/components/ui/button";
import { Eyebrow, SectionHeader } from "@/components/ui/section";
import type { PrincipleDTO } from "@/lib/content/types";
import { cn, indexLabel } from "@/lib/utils";

/**
 * How Unique Labs helps (from the owner's positioning: helping brands and Web3
 * projects build, launch and grow).
 */
const DIRECTION = [
  {
    label: "Build",
    title: "Blockchain, software & AI",
    body: "Smart contracts, dApps, extensions, websites and AI-powered tools.",
  },
  {
    label: "Launch",
    title: "Strategy & KOC",
    body: "Consultancy and KOC campaigns that put the right message in front of the right people.",
  },
  {
    label: "Grow",
    title: "Digital marketing",
    body: "Content, community and campaigns that keep momentum going.",
  },
];

export function DirectionStrip({ className }: { className?: string }) {
  return (
    <div className={cn("relative", className)}>
      <div
        aria-hidden
        className="absolute top-[0.6875rem] right-0 left-0 hidden h-px bg-gradient-to-r from-signal-500 via-white/15 to-white/5 md:block"
      />
      <ol className="grid grid-cols-1 gap-10 md:grid-cols-3 md:gap-8">
        {DIRECTION.map((step, index) => (
          <Reveal as="li" key={step.title} delay={index * 120} className="relative">
            <span
              aria-hidden
              className={cn(
                "relative z-10 flex h-[1.375rem] w-[1.375rem] items-center justify-center rounded-full border",
                index === 0 ? "border-signal-500 bg-signal-500" : "border-white/25 bg-ink-900",
              )}
            >
              <span className={cn("h-1.5 w-1.5 rounded-full", index === 0 ? "bg-ink-950" : "bg-white/40")} />
            </span>
            <p className="text-eyebrow mt-6 text-ink-400">{step.label}</p>
            <p className="mt-3 font-display text-2xl font-medium tracking-[-0.035em] text-ink-50">{step.title}</p>
            <p className="mt-2 max-w-xs text-[0.9375rem] text-ink-300">{step.body}</p>
          </Reveal>
        ))}
      </ol>
    </div>
  );
}

/** Editorial philosophy section on a warm paper surface. */
export function PrinciplesSection({
  principles,
  index,
  intro,
  title = "Principles we build by.",
}: {
  principles: PrincipleDTO[];
  index?: string;
  intro?: string | null;
  title?: string;
}) {
  if (principles.length === 0) return null;
  return (
    <section className="relative overflow-hidden bg-paper-100 text-paper-900" aria-labelledby="principles-title">
      <div aria-hidden className="grid-lines-paper mask-fade-radial pointer-events-none absolute inset-0 opacity-70" />
      <div className="container-site relative py-24 md:py-36">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 lg:gap-10">
          <div className="lg:col-span-3 lg:pt-3">
            <Eyebrow index={index} tone="paper">
              Our philosophy
            </Eyebrow>
          </div>
          <div className="lg:col-span-9">
            <h2 id="principles-title" className="text-display-md max-w-[16ch] text-paper-900">
              {title}
            </h2>
            {intro ? <p className="text-lede mt-6 max-w-2xl text-paper-600">{intro}</p> : null}
          </div>
        </div>

        <ol className="mt-16 grid grid-cols-1 gap-px overflow-hidden rounded-[var(--radius-panel)] border border-paper-900/12 bg-paper-900/12 sm:grid-cols-2 lg:mt-24 lg:grid-cols-4">
          {principles.map((principle, i) => (
            <Reveal
              as="li"
              key={principle.id}
              delay={(i % 4) * 90}
              className="group relative bg-paper-100 p-7 transition-colors duration-200 hover:bg-paper-50 md:p-8"
            >
              <span className="font-display text-5xl font-light tracking-[-0.05em] text-paper-400 transition-colors duration-500 group-hover:text-signal-600 md:text-6xl">
                {indexLabel(i + 1)}
              </span>
              <h3 className="mt-10 font-display text-xl font-medium tracking-[-0.03em] text-paper-900">
                {principle.title}
              </h3>
              <p className="mt-3 text-[0.9375rem] leading-relaxed text-paper-600">{principle.description}</p>
            </Reveal>
          ))}
        </ol>
      </div>
    </section>
  );
}

/** Closing call to action, built around the creative-direction statement. */
export function ClosingCta({
  headline,
  body,
  primary = { href: "/services", label: "Explore our services" },
  secondary = { href: "/contact", label: "Get in touch" },
}: {
  headline: string | null;
  body: string | null;
  primary?: { href: string; label: string };
  secondary?: { href: string; label: string };
}) {
  return (
    <section className="relative overflow-hidden border-t border-white/[0.07]" aria-labelledby="closing-title">
      <PauseOffscreen />
      <div aria-hidden className="grid-lines mask-fade-radial pointer-events-none absolute inset-0 opacity-50" />
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-full h-[48rem] w-[48rem] -translate-x-1/2 -translate-y-1/2 animate-glow-pulse rounded-full bg-[radial-gradient(closest-side,rgba(255,107,53,0.22),rgba(255,107,53,0.07)_55%,transparent)]"
      />
      <Spotlight />
      <div className="container-site relative py-28 text-center md:py-40">
        <Reveal>
          <LogoMark className="mx-auto h-12 w-12 text-ink-50" />
        </Reveal>
        <Reveal delay={80} kind="soft">
          <h2 id="closing-title" className="text-display-lg mx-auto mt-10 max-w-[20ch] text-ink-50">
            {headline ?? "Let's build something genuinely useful."}
          </h2>
        </Reveal>
        {body ? (
          <Reveal delay={160}>
            <p className="text-display-sm mx-auto mt-6 max-w-[26ch] text-signal-400">{body}</p>
          </Reveal>
        ) : null}
        <Reveal delay={240}>
          <div className="mt-12 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <ButtonLink href={primary.href} size="lg" arrow>
              {primary.label}
            </ButtonLink>
            <ButtonLink href={secondary.href} size="lg" variant="secondary">
              {secondary.label}
            </ButtonLink>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

export function EmptyState({
  title,
  body,
  action,
  className,
}: {
  title: string;
  body: string;
  action?: { href: string; label: string };
  className?: string;
}) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-[var(--radius-panel)] border border-dashed border-white/12 px-6 py-16 text-center md:py-24",
        className,
      )}
    >
      <div aria-hidden className="grid-lines mask-fade-radial pointer-events-none absolute inset-0 opacity-60" />
      <div className="relative">
        <LogoMark className="mx-auto h-10 w-10 text-ink-500" dotClassName="fill-ink-400" />
        <p className="mt-8 font-display text-2xl font-medium tracking-[-0.035em] text-ink-100">{title}</p>
        <p className="mx-auto mt-3 max-w-md text-ink-400">{body}</p>
        {action ? (
          <div className="mt-8">
            <ButtonLink href={action.href} variant="secondary" arrow>
              {action.label}
            </ButtonLink>
          </div>
        ) : null}
      </div>
    </div>
  );
}

export { SectionHeader };
