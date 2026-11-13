"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

/**
 * A soft light that follows the pointer across its parent section (mouse
 * only). Purely decorative: it sits behind the content and ignores clicks.
 * The parent must be positioned (e.g. `relative`).
 *
 * Performance: one fixed-size gradient disc moved with `transform` once per
 * frame — the section is never repainted while the pointer moves.
 */
export function Spotlight({ className }: { className?: string }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    const host = el?.parentElement;
    const disc = el?.firstElementChild as HTMLElement | null;
    if (!el || !host || !disc) return;
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let frame = 0;
    let clientX = 0;
    let clientY = 0;
    const place = () => {
      frame = 0;
      const rect = host.getBoundingClientRect();
      disc.style.transform = `translate3d(${Math.round(clientX - rect.left)}px, ${Math.round(clientY - rect.top)}px, 0)`;
    };
    const onMove = (event: PointerEvent) => {
      if (event.pointerType !== "mouse") return;
      clientX = event.clientX;
      clientY = event.clientY;
      if (!el.hasAttribute("data-on")) {
        place();
        el.setAttribute("data-on", "");
      } else if (!frame) {
        frame = requestAnimationFrame(place);
      }
    };
    const onLeave = () => el.removeAttribute("data-on");

    host.addEventListener("pointermove", onMove, { passive: true });
    host.addEventListener("pointerleave", onLeave, { passive: true });
    return () => {
      if (frame) cancelAnimationFrame(frame);
      host.removeEventListener("pointermove", onMove);
      host.removeEventListener("pointerleave", onLeave);
    };
  }, []);

  return (
    <div ref={ref} aria-hidden className={cn("spotlight", className)}>
      <i />
    </div>
  );
}
