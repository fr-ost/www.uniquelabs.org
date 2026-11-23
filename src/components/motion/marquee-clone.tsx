"use client";

import { useEffect, useRef } from "react";

/**
 * Adds the second copy of a marquee track in the browser. The server HTML has
 * only one copy, so search engines and the page weight see each item once;
 * the copy (needed for a seamless loop) is decorative: hidden from assistive
 * technology, with no links of its own.
 */
export function MarqueeClone() {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const marker = ref.current;
    const track = marker?.previousElementSibling as HTMLElement | null;
    if (!marker || !track) return;
    const copy = track.cloneNode(true) as HTMLElement;
    copy.setAttribute("aria-hidden", "true");
    copy.removeAttribute("aria-label");
    // The copy is decoration: its links become plain elements (no duplicate
    // links for crawlers or keyboard users) and its images have no alt text.
    copy.querySelectorAll("a").forEach((link) => {
      const span = document.createElement("span");
      span.className = link.className;
      span.append(...Array.from(link.childNodes));
      link.replaceWith(span);
    });
    copy.querySelectorAll("button").forEach((el) => el.setAttribute("tabindex", "-1"));
    copy.querySelectorAll("img").forEach((img) => {
      img.setAttribute("alt", "");
      img.setAttribute("loading", "lazy");
    });
    marker.replaceWith(copy);
    return () => {
      copy.replaceWith(marker);
    };
  }, []);

  return <span ref={ref} hidden />;
}
