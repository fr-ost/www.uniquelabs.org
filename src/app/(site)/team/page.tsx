import type { Metadata } from "next";
import Link from "next/link";
import { TeamCard } from "@/components/cards/content-cards";
import { Reveal } from "@/components/motion/reveal";
import { ClosingCta, EmptyState } from "@/components/sections/shared-sections";
import { Eyebrow, PageHero } from "@/components/ui/section";
import { getCompany, getTeam } from "@/lib/content/public";
import { pageMetadata } from "@/lib/seo/metadata";
import { pluralize } from "@/lib/utils";

export async function generateMetadata(): Promise<Metadata> {
  const company = await getCompany();
  return pageMetadata({
    title: "Our Team",
    description: `Meet the people behind ${company.name} — the team designing and building useful digital products.`,
    path: "/team",
  });
}

export default async function TeamPage() {
  const [team, company] = await Promise.all([getTeam(), getCompany()]);
  const total = team.leadership.length + team.groups.reduce((sum, g) => sum + g.members.length, 0);

  return (
    <>
      <PageHero
        eyebrow="Our team"
        title={
          <>
            The people behind {company.name}
            <span className="text-signal-500">.</span>
          </>
        }
        description="The team designing, building and maintaining our products."
      />

      {total === 0 && team.former.length === 0 ? (
        <section className="container-site py-16 md:py-24">
          <EmptyState
            title="Team profiles haven't been published yet"
            body="Profiles of the people behind our products will appear here."
            action={{ href: "/about", label: `About ${company.name}` }}
          />
        </section>
      ) : (
        <div className="container-site space-y-20 py-16 md:space-y-28 md:py-24">
          {team.leadership.length > 0 ? (
            <section aria-labelledby="leadership-title">
              <div className="flex items-end justify-between gap-6 border-b border-white/[0.07] pb-6">
                <div>
                  <Eyebrow>Leadership</Eyebrow>
                  <h2 id="leadership-title" className="text-display-sm mt-5 text-ink-50">
                    Leadership
                  </h2>
                </div>
                <p className="text-eyebrow text-ink-500">{pluralize(team.leadership.length, "person", "people")}</p>
              </div>
              <ul className="mt-10 grid gap-x-5 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
                {team.leadership.map((member, index) => (
                  <Reveal as="li" key={member.id} delay={(index % 3) * 90}>
                    <TeamCard member={member} size="large" />
                  </Reveal>
                ))}
              </ul>
            </section>
          ) : null}

          {team.groups.map((group) => (
            <section key={group.slug} aria-labelledby={`group-${group.slug}`}>
              <div className="flex items-end justify-between gap-6 border-b border-white/[0.07] pb-6">
                <div>
                  <Eyebrow>{group.name}</Eyebrow>
                  <h2 id={`group-${group.slug}`} className="text-display-sm mt-5 text-ink-50">
                    {group.name}
                  </h2>
                  {group.description ? <p className="mt-3 max-w-xl text-ink-400">{group.description}</p> : null}
                </div>
                <p className="text-eyebrow text-ink-500">{pluralize(group.members.length, "person", "people")}</p>
              </div>
              <ul className="mt-10 grid grid-cols-2 gap-x-4 gap-y-12 md:gap-x-5 lg:grid-cols-4">
                {group.members.map((member, index) => (
                  <Reveal as="li" key={member.id} delay={(index % 4) * 80}>
                    <TeamCard member={member} />
                  </Reveal>
                ))}
              </ul>
            </section>
          ))}

          {team.former.length > 0 ? (
            <section aria-labelledby="former-title">
              <div className="border-b border-white/[0.07] pb-6">
                <Eyebrow>Alumni</Eyebrow>
                <h2 id="former-title" className="text-display-sm mt-5 text-ink-50">
                  Former team members
                </h2>
              </div>
              <ul className="mt-6 divide-y divide-white/[0.07]">
                {team.former.map((member) => (
                  <li key={member.id} className="flex flex-wrap items-baseline justify-between gap-2 py-4">
                    {member.hasProfilePage ? (
                      <Link href={`/team/${member.slug}`} className="font-display text-lg tracking-[-0.02em] text-ink-100 hover:text-white">
                        {member.name}
                      </Link>
                    ) : (
                      <span className="font-display text-lg tracking-[-0.02em] text-ink-100">{member.name}</span>
                    )}
                    <span className="text-sm text-ink-400">{member.position}</span>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}
        </div>
      )}

      <ClosingCta
        headline="Want to build useful things with us?"
        body="We're always happy to hear from thoughtful people."
        primary={{ href: "/contact", label: "Get in touch" }}
        secondary={{ href: "/about", label: `About ${company.name}` }}
      />
    </>
  );
}
