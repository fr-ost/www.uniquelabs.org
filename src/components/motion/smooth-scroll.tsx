"use client";

import { useEffect } from "react";
import Lenis from "lenis";

/**
 * Inertia ("smooth") scrolling for mouse and trackpad users.
 *
 * - Pointer devices only: phones and tablets keep their native touch scrolling.
 * - Off for people who prefer reduced motion.
 * - It still scrolls the real page (no fake scroll container), so sticky
 *   headers, anchors, the keyboard and find-in-page keep working.
 */
export function SmoothScroll() {
  useEffect(() => {
    const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!finePointer || reducedMotion) return;

    const lenis = new Lenis({
      autoRaf: true,
      lerp: 0.115,
      // Same-page links (#tier-2, service chips) glide to their target.
      anchors: true,
      // Pauses itself while something locks the page (overflow: hidden).
      autoToggle: true,
      // Inner scroll areas (screenshot rails, menus) scroll natively.
      allowNestedScroll: true,
      // Don't keep coasting on the old page after a link is clicked.
      stopInertiaOnNavigate: true,
    });

    return () => lenis.destroy();
  }, []);

  return null;
}
