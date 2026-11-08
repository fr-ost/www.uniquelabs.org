import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArrowUpRight } from "lucide-react";
import { JsonLdScript } from "@/components/seo/json-ld-script";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { TextLink } from "@/components/ui/button";
import { Markdown } from "@/components/ui/markdown";
import { MediaImage } from "@/components/ui/media-image";
import { SocialIcon } from "@/components/visuals/social-icon";
import { getCompany, getTeamMember, teamProfileSlugs } from "@/lib/content/public";
import { personJsonLd } from "@/lib/seo/json-ld";
import { clampDescription, pageMetadata } from "@/lib/seo/metadata";
import { displayHost, formatDate } from "@/lib/utils";

type Params = Promise<{ slug: string }>;

/** Pages are generated at build time; unknown slugs are 404s. */
export const dynamicParams = false;

export function generateStaticParams() {
  return teamProfileSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const member = await getTeamMember(slug);
  if (!member) return { title: "Team member not found", robots: { index: false } };
  return pageMetadata({
    title: `${member.name} — ${member.position}`,
    description: clampDescription(member.shortBio ?? `${member.name}, ${member.position}.`),
    path: `/team/${member.slug}`,
    type: "profile",
  });
}

export default async function TeamMemberPage({ params }: { params: Params }) {
  const { slug } = await params;
  const [member, company] = await Promise.all([getTeamMember(slug), getCompany()]);
  if (!member) notFound();

  const socials = [
    member.linkedinUrl ? { platform: "LINKEDIN" as const, label: "LinkedIn", url: member.linkedinUrl } : null,
    member.xUrl ? { platform: "X" as const, label: "X", url: member.xUrl } : null,
    member.githubUrl ? { platform: "GITHUB" as const, label: "GitHub", url: member.githubUrl } : null,
    member.websiteUrl ? { platform: "WEBSITE" as const, label: displayHost(member.websiteUrl), url: member.websiteUrl } : null,
  ].filter((s): s is NonNullable<typeof s> => s !== null);

  return (
    <>
      <section className="relative overflow-hidden pt-[calc(var(--header-height)+2.5rem)] pb-16 md:pb-24">
        <div aria-hidden className="grid-lines mask-fade-radial pointer-events-none absolute inset-0 opacity-50" />
        <div className="container-site relative">
          <Breadcrumbs items={[{ name: "Team", path: "/team" }, { name: member.name, path: `/team/${member.slug}` }]} />
          <div className="mt-12 grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-10">
            <div className="lg:col-span-5">
              <div className="relative aspect-[4/5] overflow-hidden rounded-[var(--radius-panel)] border border-white/10 bg-ink-800">
                {member.photo ? (
                  <MediaImage media={member.photo} fill priority sizes="(min-width: 1024px) 40vw, 100vw" />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center bg-[radial-gradient(circle_at_30%_20%,rgba(255,107,53,0.22),transparent_65%)]">
                    <div aria-hidden className="grid-lines mask-fade-radial absolute inset-0 opacity-60" />
                    <span className="relative font-display text-8xl font-medium tracking-[-0.06em] text-ink-200">
                      {member.name
                        .split(/\s+/)
                        .map((p) => p[0])
                        .slice(0, 2)
                        .join("")
                        .toUpperCase()}
                    </span>
                  </div>
                )}
              </div>
            </div>
            <div className="lg:col-span-6 lg:col-start-7 lg:pt-6">
              <div className="flex flex-wrap items-center gap-3">
                <p className="text-eyebrow text-signal-400">
                  {member.memberType === "FORMER" ? "Former team member" : (member.group?.name ?? "Team")}
                </p>
              </div>
              <h1 className="text-display-lg mt-6 text-ink-50">{member.name}</h1>
              <p className="mt-4 font-display text-xl tracking-[-0.02em] text-ink-200 md:text-2xl">{member.position}</p>
              {member.shortBio ? <p className="text-lede mt-6 text-ink-300">{member.shortBio}</p> : null}

              {socials.length > 0 ? (
                <ul className="mt-8 flex flex-wrap gap-2">
                  {socials.map((social) => (
                    <li key={social.url}>
                      <a
                        href={social.url}
                        target="_blank"
                        rel="noopener noreferrer me"
                        className="inline-flex h-10 items-center gap-2 rounded-full border border-white/12 px-4 text-sm text-ink-200 transition-colors hover:border-white/25 hover:text-ink-50"
                      >
                        <SocialIcon platform={social.platform} className="h-4 w-4" />
                        {social.label}
                        <ArrowUpRight aria-hidden className="h-3.5 w-3.5 opacity-60" />
                        <span className="sr-only"> (opens in a new tab)</span>
                      </a>
                    </li>
                  ))}
                </ul>
              ) : null}

              <dl className="mt-10 grid grid-cols-1 gap-6 border-t border-white/[0.08] pt-8 sm:grid-cols-2">
                {member.joined ? (
                  <div>
                    <dt className="text-eyebrow text-ink-500">Joined</dt>
                    <dd className="mt-2 text-ink-100">{formatDate(member.joined.date, member.joined.precision)}</dd>
                  </div>
                ) : null}
                {member.expertise.length > 0 ? (
                  <div className="sm:col-span-2">
                    <dt className="text-eyebrow text-ink-500">Areas of expertise</dt>
                    <dd className="mt-3 flex flex-wrap gap-2">
                      {member.expertise.map((item) => (
                        <span key={item} className="rounded-full border border-white/10 px-3 py-1 text-sm text-ink-200">
                          {item}
                        </span>
                      ))}
                    </dd>
                  </div>
                ) : null}
                {member.responsibilities.length > 0 ? (
                  <div className="sm:col-span-2">
                    <dt className="text-eyebrow text-ink-500">Responsibilities</dt>
                    <dd className="mt-3">
                      <ul className="space-y-2">
                        {member.responsibilities.map((item) => (
                          <li key={item} className="flex gap-3 text-ink-200">
                            <span aria-hidden className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-signal-500" />
                            {item}
                          </li>
                        ))}
                      </ul>
                    </dd>
                  </div>
                ) : null}
              </dl>

              {member.bio ? <Markdown source={member.bio} className="mt-10" /> : null}
              <div className="mt-12">
                <TextLink href="/team">Back to the team</TextLink>
              </div>
            </div>
          </div>
        </div>
      </section>
      <JsonLdScript data={personJsonLd(member, company.name)} />
    </>
  );
}
