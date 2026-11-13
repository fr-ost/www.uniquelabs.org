"use client";

import { useEffect, useRef, type CSSProperties, type ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Card wrapper with a soft glow and a bright edge that follow the pointer
 * (mouse only).
 *
 * Performance: the glow is two fixed-size gradient discs that are moved with
 * `transform` once per frame. Nothing is repainted and no styles are
 * recalculated while the pointer moves; the browser only re-positions two
 * layers. The discs exist as layers only while the card is hovered.
 */
export function PointerGlow({
  children,
  className,
  accent,
  as: Tag = "div",
}: {
  children: ReactNode;
  className?: string;
  accent?: string | null;
  as?: "div" | "article" | "li";
}) {
  const ref = useRef<HTMLElement | null>(null);
  const style: CSSProperties | undefined = accent ? ({ "--card-accent": accent } as CSSProperties) : undefined;

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    const discs = el.querySelectorAll<HTMLElement>(":scope > .glow-card__fill > i, :scope > .glow-card__ring > i");

    let frame = 0;
    let clientX = 0;
    let clientY = 0;
    const place = () => {
      frame = 0;
      const rect = el.getBoundingClientRect();
      const transform = `translate3d(${Math.round(clientX - rect.left)}px, ${Math.round(clientY - rect.top)}px, 0)`;
      for (const disc of discs) disc.style.transform = transform;
    };
    const onMove = (event: PointerEvent) => {
      if (event.pointerType !== "mouse") return;
      clientX = event.clientX;
      clientY = event.clientY;
      if (!el.hasAttribute("data-glow")) {
        // First contact: put the discs under the pointer before they fade in.
        place();
        el.setAttribute("data-glow", "");
      } else if (!frame) {
        frame = requestAnimationFrame(place);
      }
    };
    const onLeave = () => el.removeAttribute("data-glow");

    el.addEventListener("pointermove", onMove, { passive: true });
    el.addEventListener("pointerleave", onLeave, { passive: true });
    return () => {
      if (frame) cancelAnimationFrame(frame);
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerleave", onLeave);
    };
  }, []);

  return (
    <Tag ref={ref as never} className={cn("glow-card", className)} style={style}>
      <span aria-hidden className="glow-card__fill">
        <i />
      </span>
      <span aria-hidden className="glow-card__ring">
        <i />
      </span>
      {children}
    </Tag>
  );
}
