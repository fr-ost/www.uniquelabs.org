"use client";

import { useEffect, useRef } from "react";

/**
 * Signature hero composition, derived from the logo geometry: the bold "U",
 * concentric contour lines (like an engineering drawing), the signal dot with
 * an orbit, graduation ticks and annotation callouts.
 *
 * Layers drift subtly with the pointer on fine-pointer devices. Everything is
 * static for touch devices and users who prefer reduced motion.
 */

// Geometry on a 11-unit grid scaled from the 40-unit logo.
const CX = 300;
const BOWL_Y = 400;
const R = 115.5;
const STROKE = 55;
const LEFT_X = CX - R;
const RIGHT_X = CX + R;
const LEFT_TOP = 240.5;
const RIGHT_TOP = 358.75;
const DOT_Y = 274.6;
const DOT_R = 36.85;

function contour(offset: number, lift: number) {
  const r = R + offset;
  const top = LEFT_TOP - lift;
  return `M${CX - r} ${top}V${BOWL_Y}A${r} ${r} 0 0 0 ${CX + r} ${BOWL_Y}V${top}`;
}

const CONTOURS = Array.from({ length: 6 }, (_, i) => ({
  d: contour(STROKE / 2 + 20 + i * 22, 24 + i * 16),
  opacity: 0.2 - i * 0.025,
  delay: 200 + i * 90,
}));

const INNER_CONTOURS = [52, 30].map((inset, i) => ({
  d: contour(-STROKE / 2 - inset + 20, -60 - i * 30),
  opacity: 0.12,
  delay: 900 + i * 100,
}));

const TICKS = Array.from({ length: 9 }, (_, i) => LEFT_TOP + 24 + i * 15);

export function HeroVisual({ labels }: { labels: [string, string, string] }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!fine || reduced) return;

    let frame = 0;
    let targetX = 0;
    let targetY = 0;
    let x = 0;
    let y = 0;

    const onMove = (event: PointerEvent) => {
      targetX = (event.clientX / window.innerWidth) * 2 - 1;
      targetY = (event.clientY / window.innerHeight) * 2 - 1;
      if (!frame) frame = requestAnimationFrame(tick);
    };

    const tick = () => {
      x += (targetX - x) * 0.07;
      y += (targetY - y) * 0.07;
      el.style.setProperty("--px", x.toFixed(4));
      el.style.setProperty("--py", y.toFixed(4));
      if (Math.abs(targetX - x) > 0.001 || Math.abs(targetY - y) > 0.001) {
        frame = requestAnimationFrame(tick);
      } else {
        frame = 0;
      }
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    return () => {
      window.removeEventListener("pointermove", onMove);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  const layer = (depth: number) => ({
    transform: `translate3d(calc(var(--px, 0) * ${depth}px), calc(var(--py, 0) * ${depth}px), 0)`,
  });

  return (
    <div ref={ref} className="relative aspect-[600/640] w-full select-none" aria-hidden>
      {/* Ambient light behind the signal dot */}
      <div
        className="absolute rounded-full bg-[radial-gradient(circle,rgba(255,107,53,0.42),rgba(255,107,53,0.08)_45%,transparent_70%)] blur-2xl animate-fade-in [animation-delay:600ms]"
        style={{
          left: `${((RIGHT_X - 170) / 600) * 100}%`,
          top: `${((DOT_Y - 170) / 640) * 100}%`,
          width: `${(340 / 600) * 100}%`,
          height: `${(340 / 640) * 100}%`,
          ...layer(-18),
        }}
      />

      <svg viewBox="0 0 600 640" className="absolute inset-0 h-full w-full overflow-visible" fill="none">
        <defs>
          <linearGradient id="hv-mark" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="100%" stopColor="#a7a7b1" />
          </linearGradient>
          <radialGradient id="hv-dot" cx="38%" cy="32%" r="75%">
            <stop offset="0%" stopColor="#ffb196" />
            <stop offset="55%" stopColor="#ff6b35" />
            <stop offset="100%" stopColor="#e2471a" />
          </radialGradient>
        </defs>

        {/* Outer contours */}
        <g style={layer(10)}>
          {CONTOURS.map((c, i) => (
            <path
              key={i}
              d={c.d}
              stroke="white"
              strokeOpacity={c.opacity}
              strokeWidth={1}
              pathLength={1}
              strokeDasharray={1}
              className="animate-draw"
              style={{ ["--dash" as string]: 1, animationDelay: `${c.delay}ms` }}
            />
          ))}
        </g>

        {/* Graduation ticks along the left stem */}
        <g style={layer(6)} className="animate-fade-in [animation-delay:1100ms]">
          {TICKS.map((y, i) => (
            <line
              key={y}
              x1={LEFT_X - STROKE / 2 - (i % 4 === 0 ? 22 : 12)}
              x2={LEFT_X - STROKE / 2 - 4}
              y1={y}
              y2={y}
              stroke="white"
              strokeOpacity={i % 4 === 0 ? 0.45 : 0.2}
            />
          ))}
        </g>

        {/* The mark */}
        <g style={layer(0)}>
          <path
            d={`M${LEFT_X} ${LEFT_TOP}V${BOWL_Y}A${R} ${R} 0 0 0 ${RIGHT_X} ${BOWL_Y}V${RIGHT_TOP}`}
            stroke="url(#hv-mark)"
            strokeWidth={STROKE}
            pathLength={1}
            strokeDasharray={1}
            className="animate-draw"
            style={{ ["--dash" as string]: 1, animationDuration: "2.4s", animationDelay: "120ms" }}
          />
          {INNER_CONTOURS.map((c, i) => (
            <path
              key={i}
              d={c.d}
              stroke="white"
              strokeOpacity={c.opacity}
              strokeDasharray="4 7"
              className="animate-fade-in"
              style={{ animationDelay: `${c.delay}ms` }}
            />
          ))}
        </g>

        {/* Orbit + signal dot */}
        <g style={layer(-14)}>
          <circle
            cx={RIGHT_X}
            cy={DOT_Y}
            r={88}
            stroke="white"
            strokeOpacity={0.16}
            strokeDasharray="2 7"
            className="animate-fade-in [animation-delay:1300ms]"
          />
          <g
            className="animate-orbit motion-reduce:animate-none"
            style={{ transformOrigin: `${RIGHT_X}px ${DOT_Y}px` }}
          >
            <circle cx={RIGHT_X + 88} cy={DOT_Y} r={4.5} fill="#f5f5f7" className="animate-fade-in [animation-delay:1500ms]" />
          </g>
          <g className="animate-fade-up [animation-delay:900ms]">
            <circle cx={RIGHT_X} cy={DOT_Y} r={DOT_R} fill="url(#hv-dot)" />
            <circle cx={RIGHT_X} cy={DOT_Y} r={DOT_R + 10} stroke="#ff6b35" strokeOpacity={0.35} />
          </g>
        </g>

        {/* Crosshair registration marks */}
        <g stroke="white" strokeOpacity={0.35} style={layer(4)} className="animate-fade-in [animation-delay:1400ms]">
          {[
            [70, 112],
            [540, 96],
            [566, 500],
            [48, 560],
          ].map(([x, y]) => (
            <g key={`${x}-${y}`}>
              <line x1={x! - 7} x2={x! + 7} y1={y} y2={y} />
              <line x1={x} x2={x} y1={y! - 7} y2={y! + 7} />
            </g>
          ))}
        </g>

        {/* Leader lines for annotations */}
        <g stroke="white" strokeOpacity={0.3} style={layer(4)} className="animate-fade-in [animation-delay:1600ms]">
          <polyline points={`${RIGHT_X + 8},${DOT_Y - DOT_R - 12} ${RIGHT_X + 8},${150} ${RIGHT_X + 26},${150}`} />
          <polyline points={`${LEFT_X - STROKE / 2 - 6},${LEFT_TOP + 8} ${LEFT_X - 52},${196} ${LEFT_X - 52},${190}`} />
          <polyline points={`${CX},${BOWL_Y + R + STROKE / 2 + 10} ${CX + 40},${600} ${CX + 78},${600}`} />
        </g>
      </svg>

      {/* Annotation labels (HTML for crisp mono type) */}
      <div className="pointer-events-none absolute inset-0 hidden whitespace-nowrap font-mono text-[10px] uppercase leading-none tracking-[0.16em] text-ink-300 sm:block">
        <span
          className="absolute -translate-y-1/2 animate-fade-in [animation-delay:1700ms]"
          style={{ left: `${((RIGHT_X + 32) / 600) * 100}%`, top: `${(150 / 640) * 100}%`, ...layer(4) }}
        >
          <span className="text-signal-400">01</span> {labels[0]}
        </span>
        <span
          className="absolute -translate-y-full animate-fade-in rounded-sm bg-ink-900/70 py-0.5 [animation-delay:1800ms]"
          style={{ left: `${((LEFT_X - 64) / 600) * 100}%`, top: `${(184 / 640) * 100}%`, ...layer(4) }}
        >
          <span className="text-signal-400">02</span> {labels[1]}
        </span>
        <span
          className="absolute -translate-y-1/2 animate-fade-in [animation-delay:1900ms]"
          style={{ left: `${((CX + 84) / 600) * 100}%`, top: `${(600 / 640) * 100}%`, ...layer(4) }}
        >
          <span className="text-signal-400">03</span> {labels[2]}
        </span>
        <span
          className="absolute text-ink-400 animate-fade-in [animation-delay:1500ms]"
          style={{ left: `${(40 / 600) * 100}%`, top: `${(64 / 640) * 100}%` }}
        >
          Fig. 01 — The unique one
        </span>
      </div>
    </div>
  );
}
