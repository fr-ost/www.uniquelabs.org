"use client";

import { useId, useState, type ReactNode } from "react";
import { ChevronDown } from "lucide-react";
import { buttonClasses } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/**
 * Shows the first part of a long block and reveals the rest on demand.
 * Everything stays in the page (good for search engines and find-in-page);
 * the hidden part is only clipped. Tabbing into the clipped part opens it.
 */
export function Expandable({
  children,
  collapsedHeight = 560,
  moreLabel,
  lessLabel = "Show less",
}: {
  children: ReactNode;
  /** Height of the collapsed block in pixels. */
  collapsedHeight?: number;
  moreLabel: string;
  lessLabel?: string;
}) {
  const [open, setOpen] = useState(false);
  const id = useId();
  return (
    <div>
      <div
        id={id}
        className={cn("relative", !open && "overflow-hidden")}
        style={open ? undefined : { maxHeight: collapsedHeight }}
        onFocusCapture={() => {
          if (!open) setOpen(true);
        }}
      >
        {children}
        {open ? null : (
          <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 h-44 bg-[linear-gradient(to_top,var(--color-ink-900)_8%,transparent)]" />
        )}
      </div>
      <div className={cn("flex justify-center", open ? "mt-10" : "-mt-2")}>
        <button
          type="button"
          aria-expanded={open}
          aria-controls={id}
          onClick={() => setOpen((value) => !value)}
          className={cn(buttonClasses("secondary", "md"), "relative z-10")}
        >
          {open ? lessLabel : moreLabel}
          <ChevronDown aria-hidden className={cn("h-4 w-4 transition-transform duration-500 ease-[var(--ease-out-expo)]", open && "rotate-180")} />
        </button>
      </div>
    </div>
  );
}
