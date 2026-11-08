import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/** Mono label with an index number, e.g. "01 — Products". */
export function Eyebrow({
  index,
  children,
  className,
  tone = "dark",
}: {
  index?: string;
  children: ReactNode;
  className?: string;
  tone?: "dark" | "paper";
}) {
  return (
    <p
      className={cn(
        "text-eyebrow flex items-center gap-3",
        tone === "dark" ? "text-ink-300" : "text-paper-600",
        className,
      )}
    >
      {index ? (
        <span className={tone === "dark" ? "text-signal-500" : "text-signal-700"}>{index}</span>
      ) : (
        <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-signal-500" />
      )}
      <span
        aria-hidden
        className={cn("h-px w-8", tone === "dark" ? "bg-white/15" : "bg-paper-900/15")}
      />
      <span>{children}</span>
    </p>
  );
}

/**
 * Asymmetric section header: label column on the left (desktop), statement
 * and supporting copy on the right.
 */
export function SectionHeader({
  index,
  eyebrow,
  title,
  description,
  action,
  tone = "dark",
  className,
  titleAs: TitleTag = "h2",
}: {
  index?: string;
  eyebrow: string;
  title: ReactNode;
  description?: ReactNode;
  action?: ReactNode;
  tone?: "dark" | "paper";
  className?: string;
  titleAs?: "h1" | "h2";
}) {
  return (
    <div className={cn("grid gap-6 lg:grid-cols-12 lg:gap-10", className)}>
      <div className="lg:col-span-3 lg:pt-3">
        <Eyebrow index={index} tone={tone}>
          {eyebrow}
        </Eyebrow>
      </div>
      <div className="lg:col-span-9">
        <TitleTag
          className={cn("text-display-md max-w-[18ch]", tone === "dark" ? "text-ink-50" : "text-paper-900")}
        >
          {title}
        </TitleTag>
        {description || action ? (
          <div className="mt-6 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            {description ? (
              <div
                className={cn(
                  "text-lede max-w-2xl",
                  tone === "dark" ? "text-ink-300" : "text-paper-600",
                )}
              >
                {description}
              </div>
            ) : null}
            {action ? <div className="shrink-0">{action}</div> : null}
          </div>
        ) : null}
      </div>
    </div>
  );
}

/** Page-level hero used by inner pages. */
export function PageHero({
  eyebrow,
  title,
  description,
  children,
  aside,
}: {
  eyebrow: string;
  title: ReactNode;
  description?: ReactNode;
  children?: ReactNode;
  aside?: ReactNode;
}) {
  return (
    <section className="relative overflow-hidden border-b border-white/[0.07] pt-[calc(var(--header-height)+3.5rem)] pb-16 md:pt-[calc(var(--header-height)+6rem)] md:pb-24">
      <div aria-hidden className="grid-lines mask-fade-radial pointer-events-none absolute inset-0 opacity-60" />
      <div
        aria-hidden
        className="pointer-events-none absolute -top-40 right-[-10%] h-[36rem] w-[36rem] rounded-full bg-[radial-gradient(circle,rgba(255,107,53,0.16),transparent_62%)] blur-2xl"
      />
      <div className="container-site relative">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-12">
          <div className={aside ? "lg:col-span-8" : "lg:col-span-10"}>
            <Eyebrow className="animate-fade-in">{eyebrow}</Eyebrow>
            <h1 className="text-display-lg mt-7 max-w-[16ch] animate-fade-up text-ink-50 [animation-delay:80ms]">
              {title}
            </h1>
            {description ? (
              <div className="text-lede mt-7 max-w-2xl animate-fade-up text-ink-300 [animation-delay:180ms]">
                {description}
              </div>
            ) : null}
            {children ? <div className="mt-9 animate-fade-up [animation-delay:260ms]">{children}</div> : null}
          </div>
          {aside ? (
            <div className="animate-fade-in lg:col-span-4 lg:self-end [animation-delay:300ms]">{aside}</div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
