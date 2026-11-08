import Link from "next/link";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { PointerGlow } from "@/components/motion/pointer-glow";
import { SampleBadge } from "@/components/ui/badges";
import { CapabilityIconView } from "@/components/visuals/capability-icon";
import { MediaImage } from "@/components/ui/media-image";
import type { CapabilityDTO, CollaborationCardDTO, PartnerDTO, TeamMemberDTO } from "@/lib/content/types";
import { COLLABORATION_CATEGORY_LABELS } from "@/lib/labels";
import { cn, formatDate } from "@/lib/utils";

export function PartnerMark({ partner, className }: { partner: PartnerDTO; className?: string }) {
  if (partner.logo) {
    return (
      <MediaImage
        media={partner.logo}
        alt={`${partner.name} logo`}
        sizes="160px"
        className={cn("h-full w-full object-contain", className)}
      />
    );
  }
  return (
    <span className={cn("font-display text-lg font-medium tracking-[-0.03em] text-ink-100", className)}>
      {partner.name}
    </span>
  );
}

export function CollaborationCard({
  collaboration,
  variant = "default",
}: {
  collaboration: CollaborationCardDTO;
  variant?: "default" | "feature";
}) {
  const feature = variant === "feature";
  const partnerNames = collaboration.partners.map((p) => p.name).join(" × ");
  return (
    <PointerGlow
      as="article"
      className={cn(
        "surface-card group relative flex h-full flex-col overflow-hidden transition-colors duration-500 hover:border-white/20",
        feature ? "p-7 md:p-9" : "p-6 md:p-7",
      )}
    >
      <div className="flex items-center justify-between gap-4">
        <p className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1 text-eyebrow text-ink-400">
          <span>{COLLABORATION_CATEGORY_LABELS[collaboration.category]}</span>
          {collaboration.date ? (
            <>
              <span className="text-ink-600" aria-hidden>
                ·
              </span>
              <span className="whitespace-nowrap text-ink-500">
                {formatDate(collaboration.date.date, collaboration.date.precision, "short")}
              </span>
            </>
          ) : null}
        </p>
        {collaboration.isPlaceholder ? <SampleBadge /> : null}
      </div>

      {collaboration.cover ? (
        <div className="relative mt-6 aspect-[16/9] overflow-hidden rounded-xl border border-white/10">
          <MediaImage
            media={collaboration.cover}
            fill
            sizes="(min-width: 1024px) 40vw, 100vw"
            className="transition-transform duration-700 ease-[var(--ease-out-expo)] group-hover:scale-[1.03]"
          />
        </div>
      ) : collaboration.partners.length > 0 ? (
        <div className="mt-6 flex h-24 items-center gap-4 rounded-xl border border-white/[0.07] bg-ink-900/60 px-6">
          {collaboration.partners.slice(0, 3).map((partner) => (
            <div key={partner.slug} className="flex h-12 max-w-[9rem] items-center">
              <PartnerMark partner={partner} />
            </div>
          ))}
        </div>
      ) : null}

      <h3
        className={cn(
          "mt-6 font-display font-medium tracking-[-0.035em] text-ink-50",
          feature ? "text-3xl" : "text-xl md:text-2xl",
        )}
      >
        {collaboration.title}
      </h3>
      {partnerNames ? <p className="mt-2 text-sm text-ink-300">With {partnerNames}</p> : null}
      <p className="mt-3 line-clamp-3 text-[0.9375rem] text-ink-300">{collaboration.summary}</p>

      <div className="mt-auto flex items-center justify-between gap-4 pt-7">
        <span className="inline-flex items-center gap-2 text-sm text-ink-100">
          Read more
          <ArrowRight aria-hidden className="h-4 w-4 transition-transform duration-500 group-hover:translate-x-1" />
        </span>
        {collaboration.sourceUrl ? (
          <a
            href={collaboration.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="relative z-10 inline-flex items-center gap-1 text-xs text-ink-400 hover:text-ink-50"
          >
            {collaboration.sourceLabel ?? "Original source"}
            <ArrowUpRight aria-hidden className="h-3.5 w-3.5" />
            <span className="sr-only"> (opens in a new tab)</span>
          </a>
        ) : null}
      </div>

      <Link href={`/collaborations/${collaboration.slug}`} className="absolute inset-0 z-0 rounded-[inherit]">
        <span className="sr-only">Read about {collaboration.title}</span>
      </Link>
    </PointerGlow>
  );
}

export function TeamCard({ member, size = "default" }: { member: TeamMemberDTO; size?: "default" | "large" }) {
  const initials = member.name
    .split(/\s+/)
    .map((part) => part.charAt(0))
    .slice(0, 2)
    .join("")
    .toUpperCase();
  const content = (
    <>
      <div
        className={cn(
          "relative overflow-hidden rounded-2xl border border-white/[0.08] bg-ink-800",
          size === "large" ? "aspect-[4/5]" : "aspect-[4/5]",
        )}
      >
        {member.photo ? (
          <MediaImage
            media={member.photo}
            fill
            sizes={size === "large" ? "(min-width: 1024px) 30vw, 90vw" : "(min-width: 1024px) 22vw, 45vw"}
            className="grayscale-[35%] transition-[filter,transform] duration-700 ease-[var(--ease-out-expo)] group-hover:scale-[1.03] group-hover:grayscale-0"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-[radial-gradient(circle_at_30%_20%,rgba(255,107,53,0.2),transparent_65%)]">
            <div aria-hidden className="grid-lines mask-fade-radial absolute inset-0 opacity-60" />
            <span className="relative font-display text-5xl font-medium tracking-[-0.05em] text-ink-200">{initials}</span>
          </div>
        )}
        {member.isPlaceholder ? (
          <div className="absolute left-3 top-3">
            <SampleBadge />
          </div>
        ) : null}
      </div>
      <div className="mt-5 flex items-start justify-between gap-3">
        <div>
          <h3 className="font-display text-xl font-medium tracking-[-0.03em] text-ink-50">{member.name}</h3>
          <p className="mt-1 text-sm text-ink-300">{member.position}</p>
        </div>
        {member.hasProfilePage ? (
          <ArrowRight
            aria-hidden
            className="mt-1.5 h-4 w-4 shrink-0 text-ink-400 transition-all duration-500 group-hover:translate-x-1 group-hover:text-signal-500"
          />
        ) : null}
      </div>
      {member.shortBio ? <p className="mt-3 line-clamp-3 text-sm text-ink-400">{member.shortBio}</p> : null}
    </>
  );
  if (member.hasProfilePage) {
    return (
      <Link href={`/team/${member.slug}`} className="group block">
        {content}
      </Link>
    );
  }
  return <div className="group">{content}</div>;
}

export function CapabilityCard({ capability, index }: { capability: CapabilityDTO; index: number }) {
  return (
    <PointerGlow
      as="article"
      className="surface-card group relative flex h-full flex-col overflow-hidden p-6 transition-colors duration-500 hover:border-white/20 md:p-7"
    >
      <div className="flex items-center justify-between">
        <span className="flex h-12 w-12 items-center justify-center rounded-xl border border-white/10 bg-ink-800 text-ink-50 transition-colors duration-500 group-hover:border-signal-500/50 group-hover:text-signal-400">
          <CapabilityIconView name={capability.icon} className="h-5 w-5" />
        </span>
        <span className="text-eyebrow text-ink-500">{String(index + 1).padStart(2, "0")}</span>
      </div>
      <h3 className="mt-8 font-display text-xl font-medium tracking-[-0.03em] text-ink-50">{capability.title}</h3>
      <p className="mt-3 text-[0.9375rem] text-ink-300">{capability.summary}</p>
      {capability.isPlaceholder ? <SampleBadge className="mt-4 w-fit" /> : null}
    </PointerGlow>
  );
}
