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

let observer: IntersectionObserver | null = null;

function getObserver() {
  if (observer || typeof window === "undefined") return observer;
  observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          const el = entry.target as HTMLElement;
          el.dataset.reveal = "visible";
          observer?.unobserve(el);
        }
      }
    },
    { rootMargin: "0px 0px -8% 0px", threshold: 0.12 },
  );
  return observer;
}

export function Reveal({
  children,
  className,
  delay = 0,
  as,
  style,
}: {
  children: ReactNode;
  className?: string;
  /** Delay in milliseconds. */
  delay?: number;
  as?: ElementType;
  style?: CSSProperties;
}) {
  const ref = useRef<HTMLElement>(null);
  const Component = (as ?? "div") as ElementType;

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const rect = el.getBoundingClientRect();
    const inView = rect.top < window.innerHeight * 0.92 && rect.bottom > 0;
    if (inView) return;
    el.dataset.reveal = "hidden";
    const io = getObserver();
    io?.observe(el);
    return () => io?.unobserve(el);
  }, []);

  return (
    <Component
      ref={ref}
      className={className}
      style={delay ? { ...style, ["--reveal-delay" as string]: `${delay}ms` } : style}
    >
      {children}
    </Component>
  );
}
