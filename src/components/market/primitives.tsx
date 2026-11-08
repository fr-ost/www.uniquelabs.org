"use client";

import { useId, useState } from "react";
import { formatPercent, trendOf } from "@/lib/market/format";
import { cn } from "@/lib/utils";

/** Coin logo through our same-origin proxy, with a monogram underneath as fallback. */
export function AssetLogo({ id, symbol, size = 28, className }: { id: number; symbol: string; size?: number; className?: string }) {
  const [failed, setFailed] = useState(false);
  return (
    <span
      className={cn("relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-ink-750 ring-1 ring-white/10", className)}
      style={{ width: size, height: size }}
    >
      <span aria-hidden className="font-mono text-[0.55rem] font-semibold uppercase text-ink-300">
        {symbol.slice(0, 3)}
      </span>
      {!failed ? (
        // eslint-disable-next-line @next/next/no-img-element -- tiny proxied icons; next/image adds nothing here
        <img
          src={`/api/market/logo/${id}`}
          alt=""
          width={size}
          height={size}
          loading="lazy"
          decoding="async"
          onError={() => setFailed(true)}
          className="absolute inset-0 h-full w-full object-cover"
        />
      ) : null}
    </span>
  );
}

/** Percentage change with arrow + sign + colour (never colour alone). */
export function Change({ value, className, digits = 2, pill = false }: { value: number | null | undefined; className?: string; digits?: number; pill?: boolean }) {
  const trend = trendOf(value);
  return (
    <span
      className={cn(
        "tabular inline-flex items-center gap-1 whitespace-nowrap font-medium",
        trend === "up" && "text-up",
        trend === "down" && "text-down",
        trend === "flat" && "text-ink-300",
        pill && "rounded-full px-2 py-0.5 text-xs",
        pill && trend === "up" && "bg-up/10",
        pill && trend === "down" && "bg-down/10",
        pill && trend === "flat" && "bg-white/5",
        className,
      )}
    >
      {trend !== "flat" ? (
        <svg aria-hidden viewBox="0 0 10 10" className={cn("h-2 w-2 shrink-0", trend === "down" && "rotate-180")}>
          <path d="M5 1.5 9 8H1z" fill="currentColor" />
        </svg>
      ) : null}
      {formatPercent(value, { digits })}
    </span>
  );
}

/** Minimal area sparkline for a numeric series. */
export function Sparkline({
  values,
  className,
  stroke = "var(--color-signal-400)",
  label,
}: {
  values: number[];
  className?: string;
  stroke?: string;
  label?: string;
}) {
  const id = useId().replace(/:/g, "");
  if (values.length < 2) return null;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = max - min || 1;
  const w = 100;
  const h = 32;
  const points = values.map((v, i) => [(i / (values.length - 1)) * w, h - 2 - ((v - min) / span) * (h - 4)] as const);
  const line = points.map(([x, y], i) => `${i === 0 ? "M" : "L"}${x.toFixed(2)},${y.toFixed(2)}`).join(" ");
  const area = `${line} L${w},${h} L0,${h} Z`;
  return (
    <svg viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" className={cn("h-10 w-full overflow-visible", className)} role={label ? "img" : undefined} aria-label={label} aria-hidden={label ? undefined : true}>
      <defs>
        <linearGradient id={`spark-${id}`} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor={stroke} stopOpacity="0.35" />
          <stop offset="100%" stopColor={stroke} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill={`url(#spark-${id})`} />
      <path d={line} fill="none" stroke={stroke} strokeWidth="1.6" vectorEffect="non-scaling-stroke" strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  );
}

const GAUGE_STOPS = ["#fb7185", "#ff8a62", "#ffb547", "#a3e635", "#34d399"];

/** Semicircle gauge (0–100) with an animated needle. */
export function Gauge({ value, label, sublabel, size = "md" }: { value: number; label: string; sublabel?: string; size?: "sm" | "md" }) {
  const id = useId().replace(/:/g, "");
  const clamped = Math.max(0, Math.min(100, value));
  const angle = -90 + clamped * 1.8;
  const r = 80;
  const arc = `M ${100 - r} 100 A ${r} ${r} 0 0 1 ${100 + r} 100`;
  return (
    <div className={cn("relative mx-auto", size === "sm" ? "w-40" : "w-56")}>
      <svg viewBox="0 0 200 112" className="w-full overflow-visible" role="img" aria-label={`${label}: ${clamped} out of 100`}>
        <defs>
          <linearGradient id={`gauge-${id}`} x1="0" x2="1" y1="0" y2="0">
            {GAUGE_STOPS.map((color, i) => (
              <stop key={color} offset={`${(i / (GAUGE_STOPS.length - 1)) * 100}%`} stopColor={color} />
            ))}
          </linearGradient>
        </defs>
        <path d={arc} fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="14" strokeLinecap="round" />
        <path d={arc} fill="none" stroke={`url(#gauge-${id})`} strokeWidth="14" strokeLinecap="round" opacity="0.9" />
        <g style={{ transform: `rotate(${angle}deg)`, transformOrigin: "100px 100px", transition: "transform 1.4s cubic-bezier(0.16, 1, 0.3, 1)" }}>
          <line x1="100" y1="100" x2="100" y2="34" stroke="#f5f5f7" strokeWidth="3" strokeLinecap="round" />
        </g>
        <circle cx="100" cy="100" r="7" fill="#f5f5f7" />
        <circle cx="100" cy="100" r="3" fill="#08080a" />
      </svg>
      <div className="-mt-1 text-center">
        <p className="tabular font-display text-4xl font-medium tracking-[-0.04em] text-ink-50">{clamped}</p>
        <p className="mt-0.5 text-sm font-medium text-ink-200">{label}</p>
        {sublabel ? <p className="mt-0.5 text-xs text-ink-400">{sublabel}</p> : null}
      </div>
    </div>
  );
}

/** Horizontal meter between two named extremes. */
export function Meter({ value, left, right, className }: { value: number; left: string; right: string; className?: string }) {
  const clamped = Math.max(0, Math.min(100, value));
  return (
    <div className={className}>
      <div className="relative h-2.5 rounded-full bg-[linear-gradient(90deg,#f7931a,#ffb547_45%,#a78bfa_70%,#8b5cf6)]">
        <span
          aria-hidden
          className="absolute top-1/2 h-5 w-5 -translate-x-1/2 -translate-y-1/2 rounded-full border-[3px] border-ink-950 bg-ink-50 shadow-[0_0_0_4px_rgba(255,255,255,0.08)] transition-[left] duration-1000 ease-[var(--ease-out-expo)]"
          style={{ left: `${clamped}%` }}
        />
      </div>
      <div className="mt-2 flex justify-between text-xs text-ink-400">
        <span>{left}</span>
        <span>{right}</span>
      </div>
    </div>
  );
}

/** Pulsing "live" dot. */
export function LiveDot({ stale = false, className }: { stale?: boolean; className?: string }) {
  return (
    <span className={cn("relative inline-flex h-2 w-2", className)} aria-hidden>
      {!stale ? <span className="absolute inset-0 animate-ping-slow rounded-full bg-up/70" /> : null}
      <span className={cn("relative inline-flex h-2 w-2 rounded-full", stale ? "bg-beta" : "bg-up")} />
    </span>
  );
}
