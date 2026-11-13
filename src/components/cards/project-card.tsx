import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { PointerGlow } from "@/components/motion/pointer-glow";
import { MediaImage } from "@/components/ui/media-image";
import type { ProjectCardDTO } from "@/lib/content/types";
import { PROJECT_STATUS_LABELS } from "@/lib/labels";
import { cn, formatDate } from "@/lib/utils";

const STATUS_TONE: Record<ProjectCardDTO["status"], string> = {
  COMPLETED: "border-live/30 bg-live/10 text-live",
  ONGOING: "border-signal-500/30 bg-signal-500/10 text-signal-300",
  IN_PROGRESS: "border-beta/30 bg-beta/10 text-beta",
  CONCEPT: "border-soon/30 bg-soon/10 text-soon",
};

export function ProjectStatus({ status, className }: { status: ProjectCardDTO["status"]; className?: string }) {
  return (
    <span className={cn("inline-flex items-center rounded-full border px-2.5 py-1 text-[0.7rem] font-medium", STATUS_TONE[status], className)}>
      {PROJECT_STATUS_LABELS[status]}
    </span>
  );
}

/**
 * Case-study card: cover (or a branded panel), status, summary, client and services.
 * `feature` is a larger stacked card; `wide` is a full-width card that splits into
 * image + text side by side on large screens (used when a single project is shown).
 */
export function ProjectCard({
  project,
  variant = "default",
  priority = false,
}: {
  project: ProjectCardDTO;
  variant?: "default" | "feature" | "wide";
  priority?: boolean;
}) {
  const accent = project.accentColor ?? "#ff6b35";
  const feature = variant !== "default";
  const wide = variant === "wide";
  const meta = [project.client, project.date ? formatDate(project.date.date, project.date.precision, "short") : null].filter(Boolean).join(" · ");
  return (
    <PointerGlow
      as="article"
      accent={project.accentColor}
      className={cn(
        "surface-card lift group relative flex h-full flex-col overflow-hidden hover:border-white/20",
        wide && "lg:flex-row",
      )}
    >
      <div
        className={cn(
          "relative overflow-hidden border-b border-white/[0.07] bg-ink-800",
          feature ? "aspect-[16/9]" : "aspect-[16/10]",
          wide && "lg:aspect-auto lg:min-h-[26rem] lg:w-[58%] lg:shrink-0 lg:border-r lg:border-b-0",
        )}
      >
        {project.cover ? (
          <MediaImage
            media={project.cover}
            fill
            priority={priority}
            sizes={feature ? "(min-width: 1024px) 60vw, 100vw" : "(min-width: 1024px) 33vw, 100vw"}
            className="transition-transform duration-700 ease-[var(--ease-out-expo)] group-hover:scale-[1.03]"
          />
        ) : (
          <div className="absolute inset-0" style={{ background: `radial-gradient(120% 120% at 15% 10%, ${accent}40, transparent 60%), #121216` }}>
            <div aria-hidden className="grid-lines mask-fade-radial absolute inset-0 opacity-50" />
            <span aria-hidden className="absolute bottom-5 left-6 font-display text-6xl font-medium tracking-[-0.05em] text-white/15 md:text-7xl">
              {project.title.charAt(0)}
            </span>
          </div>
        )}
        <ProjectStatus status={project.status} className="absolute top-4 left-4" />
      </div>
      <div className={cn("flex flex-1 flex-col", feature ? "p-7 md:p-9" : "p-6 md:p-7", wide && "lg:p-10")}>
        {meta ? <p className="text-eyebrow text-ink-400">{meta}</p> : null}
        <h3 className={cn("mt-3 font-display font-medium tracking-[-0.035em] text-ink-50", feature ? "text-3xl md:text-4xl" : "text-2xl")}>{project.title}</h3>
        <p className={cn("mt-3 text-ink-300", feature ? "text-lede max-w-xl" : "line-clamp-3 text-[0.9375rem]")}>{project.summary}</p>
        <div className="mt-auto flex items-end justify-between gap-4 pt-7">
          {project.services.length > 0 ? (
            <ul className="flex flex-wrap gap-1.5">
              {project.services.slice(0, 3).map((service) => (
                <li key={service} className="rounded-full border border-white/10 px-2.5 py-1 text-xs text-ink-300">
                  {service}
                </li>
              ))}
            </ul>
          ) : (
            <span />
          )}
          <span
            aria-hidden
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/12 text-ink-100 transition-all duration-500 ease-[var(--ease-out-expo)] group-hover:border-signal-500 group-hover:bg-signal-500 group-hover:text-ink-950"
          >
            <ArrowRight className="h-4 w-4 transition-transform duration-500 group-hover:-rotate-45" />
          </span>
        </div>
      </div>
      <Link href={`/projects/${project.slug}`} className="absolute inset-0 z-0 rounded-[inherit]">
        <span className="sr-only">Read about {project.title}</span>
      </Link>
    </PointerGlow>
  );
}
