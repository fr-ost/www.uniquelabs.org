import Link from "next/link";
import { Users } from "lucide-react";
import { Reveal } from "@/components/motion/reveal";
import { SectionHeader } from "@/components/ui/section";
import type { DepartmentDTO } from "@/lib/content/types";
import { pluralize } from "@/lib/utils";

/** "How we're organised": the company's departments/units from src/content/team.ts. */
export function StructureSection({ departments, intro, index }: { departments: DepartmentDTO[]; intro: string | null; index?: string }) {
  if (departments.length === 0) return null;
  return (
    <section id="structure" className="scroll-mt-20 border-t border-white/[0.07] py-24 md:py-32" aria-labelledby="structure-title">
      <div className="container-site">
        <SectionHeader index={index} eyebrow="Company structure" title={<span id="structure-title">How we&apos;re organised.</span>} description={intro} />
        <ol className="mt-14 grid grid-cols-1 gap-4 sm:grid-cols-2 md:mt-20 md:gap-5 lg:grid-cols-3">
          {departments.map((department, i) => (
            <Reveal as="li" key={department.slug} delay={(i % 3) * 90}>
              <article className="ring-gradient glass flex h-full flex-col rounded-[var(--radius-panel)] p-6 md:p-7">
                <p className="text-eyebrow text-signal-400">{String(i + 1).padStart(2, "0")}</p>
                <h3 className="mt-4 font-display text-2xl font-medium tracking-[-0.035em] text-ink-50">{department.name}</h3>
                {department.description ? <p className="mt-3 text-[0.9375rem] text-ink-300">{department.description}</p> : null}
                {department.focus.length > 0 ? (
                  <ul className="mt-5 flex flex-wrap gap-1.5">
                    {department.focus.map((item) => (
                      <li key={item} className="rounded-full border border-white/10 px-2.5 py-1 text-xs text-ink-300">
                        {item}
                      </li>
                    ))}
                  </ul>
                ) : null}
                {department.lead || department.memberCount > 0 ? (
                <div className="mt-auto flex items-center justify-between gap-4 border-t border-white/[0.07] pt-5 text-sm">
                  {department.lead ? (
                    <span className="min-w-0">
                      <span className="block text-xs text-ink-500">Led by</span>
                      {department.lead.hasProfilePage ? (
                        <Link href={`/team/${department.lead.slug}`} className="block truncate text-ink-100 hover:text-white">
                          {department.lead.name}
                        </Link>
                      ) : (
                        <span className="block truncate text-ink-100">{department.lead.name}</span>
                      )}
                    </span>
                  ) : (
                    <span />
                  )}
                  {department.memberCount > 0 ? (
                    <span className="inline-flex shrink-0 items-center gap-1.5 text-xs text-ink-400">
                      <Users aria-hidden className="h-3.5 w-3.5" /> {pluralize(department.memberCount, "person", "people")}
                    </span>
                  ) : null}
                </div>
                ) : null}
              </article>
            </Reveal>
          ))}
        </ol>
      </div>
    </section>
  );
}
