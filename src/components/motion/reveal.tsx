"use client";

import { useEffect, useRef, type CSSProperties, type ElementType, type ReactNode } from "react";

/**
 * Scroll-triggered reveal that degrades gracefully:
 * - Server HTML is fully visible (no-JS users, crawlers and failed bundles
 *   all see the content).
 * - After hydration, elements that are still below the fold are hidden and
 *   revealed as they enter the viewport. Elements already on screen are left
 *   untouched, so nothing flickers.
 * - Reduced-motion users never see the effect (see globals.css).
 */

let revealObserver: IntersectionObserver | null = null;
let startObserver: IntersectionObserver | null = null;

/** Reveals hidden elements as they scroll into view. */
function getRevealObserver() {
  revealObserver ??= new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          const el = entry.target as HTMLElement;
          el.dataset.reveal = "visible";
          revealObserver?.unobserve(el);
        }
      }
    },
    { rootMargin: "0px 0px -8% 0px", threshold: 0.12 },
  );
  return revealObserver;
}

/**
 * Sorts elements once, right after the page becomes interactive: anything
 * already on screen is left alone; the rest is hidden and handed to the reveal
 * observer. The browser reports positions for all elements in one batch, so
 * no layout is forced while the page is starting up.
 */
function getStartObserver() {
  startObserver ??= new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        const el = entry.target as HTMLElement;
        startObserver?.unobserve(el);
        if (entry.isIntersecting) continue;
        el.dataset.reveal = "hidden";
        getRevealObserver().observe(el);
      }
    },
    { rootMargin: "0px 0px -8% 0px", threshold: 0 },
  );
  return startObserver;
}

export function Reveal({
  children,
  className,
  delay = 0,
  as,
  style,
  kind = "up",
}: {
  children: ReactNode;
  className?: string;
  /** Delay in milliseconds. */
  delay?: number;
  as?: ElementType;
  style?: CSSProperties;
  /** `up` rises into place (default), `soft` rises a shorter distance, `scale` grows slightly, `fade` only fades. */
  kind?: "up" | "soft" | "scale" | "fade";
}) {
  const ref = useRef<HTMLElement>(null);
  const Component = (as ?? "div") as ElementType;

  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    getStartObserver().observe(el);
    return () => {
      startObserver?.unobserve(el);
      revealObserver?.unobserve(el);
    };
  }, []);

  return (
    <Component
      ref={ref}
      className={className}
      data-reveal-kind={kind === "up" ? undefined : kind}
      style={delay ? { ...style, ["--reveal-delay" as string]: `${delay}ms` } : style}
    >
      {children}
    </Component>
  );
}
