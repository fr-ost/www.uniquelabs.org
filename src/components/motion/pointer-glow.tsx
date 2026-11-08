"use client";

import { useRef, type CSSProperties, type ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Card wrapper with a soft glow that follows the pointer (desktop only; the
 * effect is pure CSS driven by two custom properties).
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

  return (
    <Tag
      ref={ref as never}
      className={cn("glow-card", className)}
      style={style}
      onPointerMove={(event) => {
        const el = ref.current;
        if (!el || event.pointerType !== "mouse") return;
        const rect = el.getBoundingClientRect();
        el.style.setProperty("--pointer-x", `${event.clientX - rect.left}px`);
        el.style.setProperty("--pointer-y", `${event.clientY - rect.top}px`);
      }}
    >
      {children}
    </Tag>
  );
}
