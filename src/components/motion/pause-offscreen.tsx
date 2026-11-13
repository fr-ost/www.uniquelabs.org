"use client";

import { useEffect, useRef } from "react";

/**
 * Pauses the looping decoration (aurora, marquee rows, pulsing glows) of its
 * parent section while that section is off screen, so a section nobody is
 * looking at costs nothing. Renders nothing visible.
 */
export function PauseOffscreen() {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const host = ref.current?.parentElement;
    if (!host || typeof IntersectionObserver === "undefined") return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry) return;
        if (entry.isIntersecting) host.removeAttribute("data-offscreen");
        else host.setAttribute("data-offscreen", "");
      },
      { rootMargin: "120px 0px" },
    );
    observer.observe(host);
    return () => {
      observer.disconnect();
      host.removeAttribute("data-offscreen");
    };
  }, []);

  return <span ref={ref} hidden />;
}
