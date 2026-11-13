import type { ReleaseStage } from "@/lib/content/enums";
import { RELEASE_STAGE_LABELS } from "@/lib/labels";
import { cn } from "@/lib/utils";

const stageStyles: Record<ReleaseStage, { dot: string; text: string }> = {
  AVAILABLE: { dot: "bg-live shadow-[0_0_0_3px_rgba(116,217,182,0.18)]", text: "text-live" },
  BETA: { dot: "bg-beta shadow-[0_0_0_3px_rgba(242,196,90,0.18)]", text: "text-beta" },
  COMING_SOON: { dot: "bg-soon shadow-[0_0_0_3px_rgba(156,184,242,0.18)]", text: "text-soon" },
  DISCONTINUED: { dot: "bg-archived", text: "text-archived" },
};

export function StageBadge({ stage, className }: { stage: ReleaseStage; className?: string }) {
  const style = stageStyles[stage];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 rounded-full border border-white/10 bg-ink-950/70 px-2.5 py-1 text-[0.6875rem] font-medium uppercase tracking-[0.12em]",
        style.text,
        className,
      )}
    >
      <span aria-hidden className={cn("h-1.5 w-1.5 rounded-full", style.dot)} />
      {RELEASE_STAGE_LABELS[stage]}
    </span>
  );
}

export function Chip({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border border-white/10 px-2.5 py-1 text-xs text-ink-200",
        className,
      )}
    >
      {children}
    </span>
  );
}

