import { cn } from "@/lib/utils";

/**
 * The Unique Labs mark: a geometric "U" whose right arm releases a single
 * signal-coloured dot — the one distinct element. Built on a 40-unit grid.
 */
export function LogoMark({
  className,
  dotClassName,
  title,
}: {
  className?: string;
  dotClassName?: string;
  title?: string;
}) {
  return (
    <svg
      viewBox="0 0 40 40"
      fill="none"
      className={cn("shrink-0", className)}
      role={title ? "img" : undefined}
      aria-hidden={title ? undefined : true}
      aria-label={title}
    >
      {title ? <title>{title}</title> : null}
      <path
        d="M9.5 6.5V21a10.5 10.5 0 0 0 21 0v-3.75"
        stroke="currentColor"
        strokeWidth="5"
        strokeLinecap="butt"
        strokeLinejoin="round"
      />
      <circle cx="30" cy="9.6" r="3.35" className={cn("fill-signal-500", dotClassName)} />
    </svg>
  );
}

export function Wordmark({
  className,
  markClassName,
  showText = true,
  name = "Unique Labs",
}: {
  className?: string;
  markClassName?: string;
  showText?: boolean;
  name?: string;
}) {
  const [first, ...rest] = name.split(" ");
  return (
    <span className={cn("inline-flex items-center gap-2.5 text-ink-50", className)}>
      <LogoMark className={cn("h-7 w-7", markClassName)} />
      {showText ? (
        <span className="font-display text-[1.1875rem] leading-none tracking-[-0.04em]">
          <span className="font-semibold">{first}</span>
          {rest.length > 0 ? <span className="font-normal text-ink-300"> {rest.join(" ")}</span> : null}
        </span>
      ) : null}
    </span>
  );
}
