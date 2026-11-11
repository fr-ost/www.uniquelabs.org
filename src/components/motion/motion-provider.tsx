"use client";

import { LazyMotion, MotionConfig, domAnimation } from "motion/react";
import type { ReactNode } from "react";
import { SmoothScroll } from "@/components/motion/smooth-scroll";

/**
 * Loads only the DOM animation feature set (~15 kB) and makes every motion
 * component respect the user's reduced-motion preference.
 */
export function MotionProvider({ children }: { children: ReactNode }) {
  return (
    <LazyMotion features={domAnimation} strict>
      <MotionConfig reducedMotion="user" transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}>
        <SmoothScroll />
        {children}
      </MotionConfig>
    </LazyMotion>
  );
}
