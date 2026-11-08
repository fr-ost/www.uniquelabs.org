import { CapabilityIconView } from "@/components/visuals/capability-icon";
import { cn } from "@/lib/utils";

/**
 * Geometric illustration panels for capability sections. Four variants built
 * from the same vocabulary as the logo: contours, rings, grids and the single
 * signal dot.
 */
export function CapabilityIllustration({
  icon,
  variant,
  className,
}: {
  icon: string;
  variant: number;
  className?: string;
}) {
  const v = variant % 4;
  return (
    <div
      className={cn(
        "relative aspect-[5/4] overflow-hidden rounded-[var(--radius-panel)] border border-white/[0.08] bg-ink-850",
        className,
      )}
      aria-hidden
    >
      <div className="grid-lines mask-fade-radial absolute inset-0 opacity-70" />
      <svg viewBox="0 0 500 400" className="absolute inset-0 h-full w-full" fill="none">
        {v === 0 ? (
          <g stroke="white">
            {[150, 120, 92, 66].map((r, i) => (
              <circle key={r} cx="250" cy="200" r={r} strokeOpacity={0.06 + i * 0.05} />
            ))}
            <circle cx="250" cy="50" r="7" fill="#ff6b35" stroke="none" />
          </g>
        ) : null}
        {v === 1 ? (
          <g stroke="white">
            {[0, 1, 2, 3].map((i) => {
              const size = 280 - i * 56;
              return (
                <rect
                  key={i}
                  x={250 - size / 2}
                  y={200 - size / 2}
                  width={size}
                  height={size}
                  rx={28 - i * 4}
                  strokeOpacity={0.06 + i * 0.05}
                  transform={`rotate(${i * 6} 250 200)`}
                />
              );
            })}
            <circle cx="390" cy="60" r="7" fill="#ff6b35" stroke="none" />
          </g>
        ) : null}
        {v === 2 ? (
          <g stroke="white">
            {[0, 1, 2, 3, 4].map((i) => {
              const r = 60 + i * 26;
              return (
                <path
                  key={i}
                  d={`M${250 - r} ${70 - i * 6}V230A${r} ${r} 0 0 0 ${250 + r} 230V${70 - i * 6}`}
                  strokeOpacity={0.05 + (4 - i) * 0.045}
                />
              );
            })}
            <circle cx="310" cy="96" r="7" fill="#ff6b35" stroke="none" />
          </g>
        ) : null}
        {v === 3 ? (
          <g>
            {Array.from({ length: 7 }).map((_, row) =>
              Array.from({ length: 9 }).map((__, col) => {
                const special = row === 2 && col === 6;
                return (
                  <circle
                    key={`${row}-${col}`}
                    cx={90 + col * 40}
                    cy={80 + row * 40}
                    r={special ? 7 : 2.4}
                    fill={special ? "#ff6b35" : "white"}
                    fillOpacity={special ? 1 : 0.18}
                  />
                );
              }),
            )}
          </g>
        ) : null}
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-[1.4rem] border border-white/12 bg-ink-900/90 text-ink-50 shadow-[0_20px_60px_-20px_rgba(255,107,53,0.45)] backdrop-blur md:h-24 md:w-24">
          <CapabilityIconView name={icon} className="h-8 w-8 md:h-9 md:w-9" />
        </div>
      </div>
    </div>
  );
}
