import Link from "next/link";
import type { ReactNode } from "react";
import { ChevronRight } from "lucide-react";
import type { PublishStatus } from "@/generated/prisma/enums";
import { cn } from "@/lib/utils";

export function AdminPageHeader({
  title,
  description,
  actions,
  breadcrumbs,
}: {
  title: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
  breadcrumbs?: Array<{ label: string; href?: string }>;
}) {
  return (
    <header className="flex flex-col gap-5 border-b border-white/[0.07] pb-6 md:flex-row md:items-end md:justify-between">
      <div className="min-w-0">
        {breadcrumbs && breadcrumbs.length > 0 ? (
          <nav aria-label="Breadcrumb" className="mb-3">
            <ol className="flex flex-wrap items-center gap-1 text-xs text-ink-400">
              {breadcrumbs.map((crumb, index) => (
                <li key={`${crumb.label}-${index}`} className="flex items-center gap-1">
                  {crumb.href ? (
                    <Link href={crumb.href} className="hover:text-ink-100">
                      {crumb.label}
                    </Link>
                  ) : (
                    <span className="text-ink-300">{crumb.label}</span>
                  )}
                  {index < breadcrumbs.length - 1 ? <ChevronRight aria-hidden className="h-3 w-3 text-ink-600" /> : null}
                </li>
              ))}
            </ol>
          </nav>
        ) : null}
        <h1 className="truncate font-display text-2xl font-medium tracking-[-0.03em] text-ink-50 md:text-[1.75rem]">{title}</h1>
        {description ? <p className="mt-2 max-w-3xl text-sm text-ink-400">{description}</p> : null}
      </div>
      {actions ? <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div> : null}
    </header>
  );
}

export function Panel({
  title,
  description,
  children,
  actions,
  className,
  id,
}: {
  title?: ReactNode;
  description?: ReactNode;
  children: ReactNode;
  actions?: ReactNode;
  className?: string;
  id?: string;
}) {
  return (
    <section id={id} className={cn("rounded-2xl border border-white/[0.08] bg-ink-900/60", className)}>
      {title || actions ? (
        <div className="flex flex-col gap-3 border-b border-white/[0.06] px-5 py-4 sm:flex-row sm:items-center sm:justify-between md:px-6">
          <div>
            {title ? <h2 className="text-[0.9375rem] font-semibold text-ink-50">{title}</h2> : null}
            {description ? <p className="mt-1 text-xs text-ink-400">{description}</p> : null}
          </div>
          {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
        </div>
      ) : null}
      <div className="p-5 md:p-6">{children}</div>
    </section>
  );
}

const STATUS_STYLE: Record<PublishStatus, string> = {
  DRAFT: "border-white/15 text-ink-300",
  PUBLISHED: "border-live/40 bg-live/10 text-live",
  ARCHIVED: "border-white/10 text-ink-500",
};

export function StatusBadge({ status }: { status: PublishStatus }) {
  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[0.6875rem] font-medium", STATUS_STYLE[status])}>
      <span aria-hidden className={cn("h-1.5 w-1.5 rounded-full", status === "PUBLISHED" ? "bg-live" : status === "DRAFT" ? "bg-ink-400" : "bg-ink-600")} />
      {status === "PUBLISHED" ? "Published" : status === "DRAFT" ? "Draft" : "Archived"}
    </span>
  );
}

export function Pill({
  children,
  tone = "neutral",
  className,
  title,
}: {
  children: ReactNode;
  tone?: "neutral" | "good" | "warn" | "bad" | "info" | "accent";
  className?: string;
  title?: string;
}) {
  const tones = {
    neutral: "border-white/12 text-ink-300",
    good: "border-live/40 bg-live/10 text-live",
    warn: "border-beta/40 bg-beta/10 text-beta",
    bad: "border-danger/40 bg-danger/10 text-danger",
    info: "border-soon/40 bg-soon/10 text-soon",
    accent: "border-signal-500/40 bg-signal-500/10 text-signal-400",
  };
  return (
    <span title={title} className={cn("inline-flex items-center gap-1 whitespace-nowrap rounded-full border px-2 py-0.5 text-[0.6875rem] font-medium", tones[tone], className)}>
      {children}
    </span>
  );
}

export function StatCard({
  label,
  value,
  href,
  hint,
  tone,
}: {
  label: string;
  value: number | string;
  href?: string;
  hint?: string;
  tone?: "accent";
}) {
  const body = (
    <>
      <p className="text-xs text-ink-400">{label}</p>
      <p className={cn("mt-3 font-display text-3xl tracking-[-0.04em] tabular", tone === "accent" ? "text-signal-400" : "text-ink-50")}>{value}</p>
      {hint ? <p className="mt-1 text-xs text-ink-500">{hint}</p> : null}
    </>
  );
  const classes = "block rounded-2xl border border-white/[0.08] bg-ink-900/60 p-5 transition-colors";
  return href ? (
    <Link href={href} className={cn(classes, "hover:border-white/20 hover:bg-ink-850")}>
      {body}
    </Link>
  ) : (
    <div className={classes}>{body}</div>
  );
}

const TABLE_MIN_WIDTH = {
  md: "min-w-[640px]",
  lg: "min-w-[800px]",
  xl: "min-w-[960px]",
} as const;

/** Scrolls horizontally on small screens instead of squeezing columns. */
export function AdminTable({
  children,
  className,
  minWidth = "md",
}: {
  children: ReactNode;
  className?: string;
  minWidth?: keyof typeof TABLE_MIN_WIDTH;
}) {
  return (
    <div className={cn("overflow-x-auto overscroll-x-contain rounded-2xl border border-white/[0.08]", className)}>
      <table className={cn("w-full border-collapse text-left text-sm", TABLE_MIN_WIDTH[minWidth])}>{children}</table>
    </div>
  );
}

export function Th({ children, className }: { children?: ReactNode; className?: string }) {
  return (
    <th scope="col" className={cn("border-b border-white/[0.08] bg-ink-900/80 px-4 py-3 text-xs font-medium text-ink-400", className)}>
      {children}
    </th>
  );
}

export function Td({ children, className }: { children?: ReactNode; className?: string }) {
  return <td className={cn("border-b border-white/[0.05] px-4 py-3 align-middle text-ink-200", className)}>{children}</td>;
}

export function EmptyPanel({ title, body, action }: { title: string; body?: string; action?: ReactNode }) {
  return (
    <div className="rounded-2xl border border-dashed border-white/12 px-6 py-14 text-center">
      <p className="font-medium text-ink-100">{title}</p>
      {body ? <p className="mx-auto mt-2 max-w-md text-sm text-ink-400">{body}</p> : null}
      {action ? <div className="mt-6 flex justify-center">{action}</div> : null}
    </div>
  );
}

export function AdminButtonLink({
  href,
  children,
  variant = "secondary",
  size = "md",
  target,
}: {
  href: string;
  children: ReactNode;
  variant?: "primary" | "secondary" | "ghost";
  size?: "sm" | "md";
  target?: "_blank";
}) {
  return (
    <Link
      href={href}
      target={target}
      rel={target ? "noopener noreferrer" : undefined}
      className={adminButtonClasses(variant, size)}
    >
      {children}
    </Link>
  );
}

export function adminButtonClasses(variant: "primary" | "secondary" | "ghost" | "danger" = "secondary", size: "sm" | "md" = "md") {
  return cn(
    "inline-flex shrink-0 items-center justify-center gap-1.5 whitespace-nowrap rounded-lg font-medium transition-colors disabled:pointer-events-none disabled:opacity-50 [&_svg]:shrink-0",
    size === "sm" ? "h-8 px-3 text-xs" : "h-9 px-3.5 text-sm",
    variant === "primary" && "bg-ink-50 text-ink-950 hover:bg-white",
    variant === "secondary" && "border border-white/12 bg-white/[0.03] text-ink-100 hover:border-white/25 hover:bg-white/[0.06]",
    variant === "ghost" && "text-ink-300 hover:bg-white/[0.05] hover:text-ink-50",
    variant === "danger" && "border border-danger/40 text-danger hover:bg-danger/10",
  );
}
