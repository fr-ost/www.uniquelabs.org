"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

const format = (value: number) => Math.round(value).toLocaleString("en-US");

/**
 * A number that counts up when it scrolls into view.
 *
 * The server renders the final value, so it is correct without JavaScript and
 * for search engines. Numbers already on screen when the page loads are left
 * alone (no flicker) unless `startOnMount` is set — use that only where the
 * element is still invisible at load (e.g. inside a delayed fade-in).
 */
export function CountUp({
  value,
  suffix = "",
  duration = 1800,
  delay = 0,
  startOnMount = false,
  className,
}: {
  value: number;
  suffix?: string;
  /** Milliseconds. */
  duration?: number;
  /** Milliseconds before the count starts (with `startOnMount`). */
  delay?: number;
  startOnMount?: boolean;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = ref.current;
    const text = el?.firstChild;
    if (!el || !text) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const finalText = format(value) + suffix;
    // Update the existing text node (and only when the number changes).
    const show = (next: string) => {
      if (text.nodeValue !== next) text.nodeValue = next;
    };
    let frame = 0;
    let timer = 0;
    let observer: IntersectionObserver | null = null;

    const run = () => {
      const start = performance.now();
      const tick = (now: number) => {
        const progress = Math.min(1, (now - start) / duration);
        const eased = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
        show(format(value * eased) + suffix);
        if (progress < 1) frame = requestAnimationFrame(tick);
      };
      frame = requestAnimationFrame(tick);
    };

    if (startOnMount) {
      show(format(0) + suffix);
      timer = window.setTimeout(run, delay);
    } else {
      const rect = el.getBoundingClientRect();
      const onScreen = rect.top < window.innerHeight && rect.bottom > 0;
      if (onScreen) return;
      show(format(0) + suffix);
      observer = new IntersectionObserver(
        (entries) => {
          if (entries.some((entry) => entry.isIntersecting)) {
            observer?.disconnect();
            run();
          }
        },
        { threshold: 0.6 },
      );
      observer.observe(el);
    }

    return () => {
      window.clearTimeout(timer);
      cancelAnimationFrame(frame);
      observer?.disconnect();
      show(finalText);
    };
  }, [value, suffix, duration, delay, startOnMount]);

  return (
    <span ref={ref} className={cn("tabular", className)}>
      {format(value) + suffix}
    </span>
  );
}
