import Link from "next/link";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { PointerGlow } from "@/components/motion/pointer-glow";
import { CapabilityIconView } from "@/components/visuals/capability-icon";
import { SocialIcon } from "@/components/visuals/social-icon";
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

      <Link href={`/partnerships/${collaboration.slug}`} className="absolute inset-0 z-0 rounded-[inherit]">
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
            sizes={size === "large" ? "(min-width: 1024px) 30vw, 90vw" : "(min-width: 1024px) 240px, (min-width: 640px) 33vw, 50vw"}
            className="grayscale-[35%] transition-[filter,transform] duration-700 ease-[var(--ease-out-expo)] group-hover:scale-[1.03] group-hover:grayscale-0"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-[radial-gradient(circle_at_30%_20%,rgba(255,107,53,0.2),transparent_65%)]">
            <div aria-hidden className="grid-lines mask-fade-radial absolute inset-0 opacity-60" />
            <span className="relative font-display text-5xl font-medium tracking-[-0.05em] text-ink-200">{initials}</span>
          </div>
        )}
      </div>
      <div className="mt-5 flex items-start justify-between gap-3">
        <div>
          <h3 className="font-display text-base font-medium tracking-[-0.03em] text-ink-50 sm:text-lg">{member.name}</h3>
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
  const socials = [
    member.xUrl ? { platform: "X" as const, label: "X", url: member.xUrl } : null,
    member.telegramUrl ? { platform: "TELEGRAM" as const, label: "Telegram", url: member.telegramUrl } : null,
    member.linkedinUrl ? { platform: "LINKEDIN" as const, label: "LinkedIn", url: member.linkedinUrl } : null,
    member.githubUrl ? { platform: "GITHUB" as const, label: "GitHub", url: member.githubUrl } : null,
  ].filter((s): s is NonNullable<typeof s> => s !== null);
  return (
    <div className="group">
      {member.hasProfilePage ? (
        <Link href={`/team/${member.slug}`} className="block">
          {content}
        </Link>
      ) : (
        content
      )}
      {socials.length > 0 ? (
        <ul className="mt-4 flex flex-wrap gap-2">
          {socials.map((social) => (
            <li key={social.platform}>
              <a
                href={social.url}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`${member.name} on ${social.label}`}
                className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 text-ink-300 transition-colors hover:border-white/30 hover:text-ink-50"
              >
                <SocialIcon platform={social.platform} className="h-4 w-4" />
              </a>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
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
    </PointerGlow>
  );
}

/** A partner in the tiered network: logo, name, X username and role. Links to the partner's X profile. */
export function PartnerTile({ partner, size = "default" }: { partner: PartnerDTO; size?: "default" | "compact" }) {
  const compact = size === "compact";
  const href = partner.xHandle ? `https://x.com/${partner.xHandle}` : partner.websiteUrl;
  const initials = partner.name.replace(/[^A-Za-z0-9 ]/g, "").split(/\s+/).map((w) => w.charAt(0)).join("").slice(0, 2).toUpperCase();
  const body = (
    <>
      <span
        className={cn(
          "relative flex shrink-0 items-center justify-center overflow-hidden border border-white/10 bg-ink-800",
          compact ? "h-10 w-10 rounded-lg" : "h-14 w-14 rounded-xl",
        )}
      >
        {partner.logo ? (
          <MediaImage media={partner.logo} alt={`${partner.name} logo`} fill sizes={compact ? "40px" : "56px"} />
        ) : (
          <span aria-hidden className="font-display text-sm font-medium text-ink-200">
            {initials}
          </span>
        )}
      </span>
      <span className="min-w-0 flex-1">
        <span className={cn("block truncate font-display font-medium tracking-[-0.02em] text-ink-50", compact ? "text-[0.9375rem]" : "text-lg")}>{partner.name}</span>
        {partner.xHandle ? <span className="block truncate text-xs text-ink-400">@{partner.xHandle}</span> : null}
        {partner.role ? (
          compact ? (
            <span className="mt-1 block truncate text-xs text-signal-300/90">{partner.role}</span>
          ) : (
            <span className="mt-2.5 inline-flex max-w-full truncate rounded-full border border-signal-500/30 bg-signal-500/10 px-2.5 py-0.5 text-xs text-signal-200">
              {partner.role}
            </span>
          )
        ) : null}
      </span>
    </>
  );
  const className = cn(
    "group flex h-full items-center gap-4 transition-colors",
    compact ? "rounded-xl border border-white/[0.07] p-3 hover:border-white/20 hover:bg-white/[0.03]" : "surface-card p-5 hover:border-white/20",
  );
  return href ? (
    <a href={href} target="_blank" rel="noopener noreferrer" className={className} aria-label={`${partner.name}${partner.role ? `, ${partner.role}` : ""} (opens X in a new tab)`}>
      {body}
    </a>
  ) : (
    <div className={className}>{body}</div>
  );
}
