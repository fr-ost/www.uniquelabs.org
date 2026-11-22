import type { CSSProperties, ReactNode } from "react";
import { MarqueeClone } from "@/components/motion/marquee-clone";
import { cn } from "@/lib/utils";

/**
 * Infinite horizontal marquee (pure CSS). The items are rendered once on the
 * server; a second, decorative copy is added in the browser so the loop is
 * seamless (hidden from assistive technology and out of the tab order). It pauses on hover and keyboard focus, and becomes a plain
 * scrollable row for people who prefer reduced motion.
 */
export function Marquee<T>({
  items,
  renderItem,
  getKey,
  label,
  reverse = false,
  duration = 60,
  gap = "1rem",
  className,
}: {
  items: T[];
  renderItem: (item: T) => ReactNode;
  getKey: (item: T) => string;
  /** Accessible name for the list. */
  label: string;
  reverse?: boolean;
  /** Seconds for one full loop. */
  duration?: number;
  gap?: string;
  className?: string;
}) {
  if (items.length === 0) return null;
  const style = { "--marquee-duration": `${duration}s`, "--marquee-gap": gap } as CSSProperties;
  return (
    <div className={cn("marquee", className)} data-reverse={reverse ? "" : undefined} style={style}>
      {/* Both copies sit in one moving strip, so they can never drift apart. */}
      <div className="marquee__strip">
      <ul className="marquee__track" aria-label={label}>
        {items.map((item) => (
          <li key={getKey(item)} className="shrink-0">
            {renderItem(item)}
          </li>
        ))}
      </ul>
      {/* The second copy is added in the browser (see marquee-clone.tsx). */}
      <MarqueeClone />
      </div>
    </div>
  );
}
