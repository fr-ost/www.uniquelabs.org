"use client";

import Link from "next/link";
import { useRef } from "react";
import { useScroll, useSpring } from "motion/react";
import * as m from "motion/react-m";
import { ArrowUpRight } from "lucide-react";
import Image from "next/image";
import { Reveal } from "@/components/motion/reveal";
import type { MilestoneDTO } from "@/lib/content/types";
import { MILESTONE_KIND_LABELS } from "@/lib/labels";
import { cn, formatDate, yearOf } from "@/lib/utils";

/**
 * Interactive vertical timeline: a progress line fills as you scroll and
 * year markers anchor each period. Single column on mobile, alternating
 * columns on desktop.
 */
export function JourneyTimeline({ milestones }: { milestones: MilestoneDTO[] }) {
  const ref = useRef<HTMLOListElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 70%", "end 60%"] });
  const progress = useSpring(scrollYProgress, { stiffness: 120, damping: 30, restDelta: 0.001 });

  let lastYear: number | null = null;

  return (
    <ol ref={ref} className="relative">
      {/* Track + animated progress */}
      <div aria-hidden className="absolute top-0 bottom-0 left-[0.6875rem] w-px bg-white/10 md:left-1/2 md:-translate-x-1/2" />
      <m.div
        aria-hidden
        style={{ scaleY: progress }}
        className="absolute top-0 bottom-0 left-[0.6875rem] w-px origin-top bg-gradient-to-b from-signal-500 via-signal-400 to-signal-500/40 md:left-1/2 md:-translate-x-1/2"
      />

      {milestones.map((milestone, index) => {
        const year = yearOf(milestone.date);
        const showYear = year !== lastYear;
        lastYear = year;
        const right = index % 2 === 1;
        return (
          <li key={milestone.id} id={showYear ? `year-${year}` : undefined} className="relative scroll-mt-40">
            {showYear ? (
              <div className="relative z-10 mb-8 pl-10 md:mb-12 md:pl-0 md:text-center">
                <span className="inline-flex items-center rounded-full border border-white/12 bg-ink-900 px-4 py-1.5 font-display text-lg tracking-[-0.03em] text-ink-50">
                  {year}
                </span>
              </div>
            ) : null}
            <div className="relative grid pb-14 md:grid-cols-2 md:gap-16 md:pb-20">
              <span
                aria-hidden
                className="absolute top-2 left-[0.6875rem] z-10 flex h-5 w-5 -translate-x-1/2 items-center justify-center rounded-full border border-signal-500/60 bg-ink-900 md:left-1/2"
              >
                <span className="h-2 w-2 rounded-full bg-signal-500" />
              </span>
              <Reveal
                as="article"
                className={cn("pl-10 md:pl-0", right ? "md:col-start-2" : "md:col-start-1 md:text-right")}
              >
                <p className="text-eyebrow text-ink-500">
                  <span className="text-signal-400">{MILESTONE_KIND_LABELS[milestone.kind]}</span>
                  <span className="mx-2 text-ink-700">/</span>
                  <time dateTime={milestone.date.slice(0, 10)}>{formatDate(milestone.date, milestone.precision)}</time>
                </p>
                <h3 className="mt-4 font-display text-2xl font-medium tracking-[-0.035em] text-ink-50 md:text-3xl">
                  {milestone.title}
                </h3>
                {milestone.description ? <p className="mt-3 text-ink-300">{milestone.description}</p> : null}
                {milestone.image ? (
                  <div className={cn("mt-6 overflow-hidden rounded-2xl border border-white/10", right ? "" : "md:ml-auto")}>
                    <Image
                      src={milestone.image.url}
                      alt={milestone.image.alt}
                      width={milestone.image.width ?? 1200}
                      height={milestone.image.height ?? 800}
                      sizes="(min-width: 768px) 40vw, 90vw"
                      unoptimized={milestone.image.mimeType === "image/svg+xml"}
                      className="h-auto w-full"
                    />
                  </div>
                ) : null}
                <div className={cn("mt-5 flex flex-wrap gap-x-5 gap-y-2 text-sm", right ? "" : "md:justify-end")}>
                  {milestone.product ? (
                    <Link href={`/products/${milestone.product.slug}`} className="text-ink-200 underline decoration-white/20 underline-offset-4 hover:text-white hover:decoration-signal-500">
                      {milestone.product.name}
                    </Link>
                  ) : null}
                  {milestone.collaboration ? (
                    <Link href={`/collaborations/${milestone.collaboration.slug}`} className="text-ink-200 underline decoration-white/20 underline-offset-4 hover:text-white hover:decoration-signal-500">
                      {milestone.collaboration.title}
                    </Link>
                  ) : null}
                  {milestone.sourceUrl ? (
                    <a href={milestone.sourceUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-ink-400 hover:text-ink-50">
                      {milestone.sourceLabel ?? "Source"} <ArrowUpRight aria-hidden className="h-3.5 w-3.5" />
                      <span className="sr-only"> (opens in a new tab)</span>
                    </a>
                  ) : null}
                  {milestone.isPlaceholder ? (
                    <span className="rounded border border-dashed border-beta/60 px-1.5 font-mono text-[0.625rem] uppercase tracking-[0.14em] text-beta">
                      Sample
                    </span>
                  ) : null}
                </div>
              </Reveal>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
