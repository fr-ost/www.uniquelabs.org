import type { CSSProperties, ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Infinite horizontal marquee (pure CSS). The items are rendered twice so the
 * loop is seamless; the second copy is hidden from assistive technology and
 * `renderItem` receives `duplicate = true` for it so links can be taken out of
 * the tab order. It pauses on hover and keyboard focus, and becomes a plain
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
  renderItem: (item: T, duplicate: boolean) => ReactNode;
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
      <ul className="marquee__track" aria-label={label}>
        {items.map((item) => (
          <li key={getKey(item)} className="shrink-0">
            {renderItem(item, false)}
          </li>
        ))}
      </ul>
      <ul className="marquee__track" aria-hidden="true">
        {items.map((item) => (
          <li key={getKey(item)} className="shrink-0">
            {renderItem(item, true)}
          </li>
        ))}
      </ul>
    </div>
  );
}
