import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "ghost" | "paper" | "paper-outline";
type Size = "md" | "lg" | "sm";

const base =
  "group/btn relative inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full font-medium tracking-[-0.01em] transition-[background-color,color,border-color,box-shadow,transform] duration-300 ease-[var(--ease-out-expo)] active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50 [&_svg]:shrink-0";

const variants: Record<Variant, string> = {
  primary:
    "bg-ink-50 text-ink-950 shadow-[0_1px_0_0_rgba(255,255,255,0.4)_inset,0_10px_30px_-12px_rgba(255,107,53,0.55)] hover:bg-white hover:shadow-[0_1px_0_0_rgba(255,255,255,0.4)_inset,0_14px_40px_-12px_rgba(255,107,53,0.75)]",
  secondary:
    "border border-white/12 bg-white/[0.03] text-ink-50 backdrop-blur-sm hover:border-white/25 hover:bg-white/[0.07]",
  ghost: "text-ink-200 hover:text-ink-50",
  paper: "bg-paper-900 text-paper-50 hover:bg-black",
  "paper-outline": "border border-paper-900/20 text-paper-900 hover:border-paper-900/50 hover:bg-paper-900/[0.04]",
};

const sizes: Record<Size, string> = {
  sm: "h-9 px-4 text-sm",
  md: "h-11 px-5 text-[0.9375rem]",
  lg: "h-13 px-7 text-base",
};

export function buttonClasses(variant: Variant = "primary", size: Size = "md", className?: string) {
  return cn(base, variants[variant], sizes[size], className);
}

function ArrowIcon({ external }: { external?: boolean }) {
  const Icon = external ? ArrowUpRight : ArrowRight;
  return (
    <Icon
      aria-hidden
      className={cn(
        "h-4 w-4 transition-transform duration-300 ease-[var(--ease-out-expo)]",
        external
          ? "group-hover/btn:-translate-y-0.5 group-hover/btn:translate-x-0.5"
          : "group-hover/btn:translate-x-0.5",
      )}
    />
  );
}

export function ButtonLink({
  href,
  children,
  variant = "primary",
  size = "md",
  arrow = false,
  external = false,
  className,
  ...rest
}: {
  href: string;
  children: ReactNode;
  variant?: Variant;
  size?: Size;
  arrow?: boolean;
  external?: boolean;
  className?: string;
} & Omit<ComponentProps<"a">, "href" | "className" | "children">) {
  const classes = buttonClasses(variant, size, className);
  if (external) {
    return (
      <a href={href} className={classes} target="_blank" rel="noopener noreferrer" {...rest}>
        {children}
        {arrow ? <ArrowIcon external /> : null}
        <span className="sr-only"> (opens in a new tab)</span>
      </a>
    );
  }
  return (
    <Link href={href} className={classes} {...rest}>
      {children}
      {arrow ? <ArrowIcon /> : null}
    </Link>
  );
}

export function TextLink({
  href,
  children,
  className,
  external,
}: {
  href: string;
  children: ReactNode;
  className?: string;
  external?: boolean;
}) {
  const classes = cn(
    "group/btn inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap text-sm font-medium text-ink-100 transition-colors hover:text-white",
    className,
  );
  if (external) {
    return (
      <a href={href} className={classes} target="_blank" rel="noopener noreferrer">
        <span className="underline decoration-white/20 underline-offset-[0.3em] transition-colors group-hover/btn:decoration-signal-500">
          {children}
        </span>
        <ArrowIcon external />
        <span className="sr-only"> (opens in a new tab)</span>
      </a>
    );
  }
  return (
    <Link href={href} className={classes}>
      <span className="underline decoration-white/20 underline-offset-[0.3em] transition-colors group-hover/btn:decoration-signal-500">
        {children}
      </span>
      <ArrowIcon />
    </Link>
  );
}
