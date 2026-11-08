import type { Metadata } from "next";
import { ProjectCard } from "@/components/cards/project-card";
import { Reveal } from "@/components/motion/reveal";
import { ClosingCta, EmptyState } from "@/components/sections/shared-sections";
import { Eyebrow, PageHero } from "@/components/ui/section";
import { getCompany, getProjects } from "@/lib/content/public";
import { pageMetadata } from "@/lib/seo/metadata";
import { cn } from "@/lib/utils";

export async function generateMetadata(): Promise<Metadata> {
  const company = await getCompany();
  return pageMetadata({
    title: "Projects",
    description: `Projects and work by ${company.name} — what we designed, built and shipped, and what came of it.`,
    path: "/projects",
  });
}

export default async function ProjectsPage() {
  const [projects, company] = await Promise.all([getProjects(), getCompany()]);
  const featured = projects.filter((p) => p.featured).slice(0, 2);
  const rest = projects.filter((p) => !featured.includes(p));
  const completed = projects.filter((p) => p.status === "COMPLETED").length;

  return (
    <>
      <PageHero
        eyebrow="Projects"
        title={
          <>
            Our work<span className="text-signal-500">.</span>
          </>
        }
        description="Projects we have designed, built and shipped — the problem, what we made and what came of it."
        aside={
          projects.length > 0 ? (
            <dl className="grid grid-cols-2 gap-4">
              <div className="surface-card p-5">
                <dt className="text-eyebrow text-ink-500">Projects</dt>
                <dd className="tabular mt-3 font-display text-4xl tracking-[-0.05em] text-ink-50">{projects.length}</dd>
              </div>
              <div className="surface-card p-5">
                <dt className="text-eyebrow text-ink-500">Completed</dt>
                <dd className="tabular mt-3 font-display text-4xl tracking-[-0.05em] text-ink-50">{completed}</dd>
              </div>
            </dl>
          ) : undefined
        }
      />

      {projects.length === 0 ? (
        <section className="container-site py-16 md:py-24">
          <EmptyState
            title="Our first case studies are on their way"
            body="Projects will be showcased here — what we set out to do, what we built and what came of it."
            action={{ href: "/products", label: "Explore our products" }}
          />
        </section>
      ) : (
        <>
          {featured.length > 0 ? (
            <section className="container-site py-16 md:py-24" aria-labelledby="featured-projects">
              <Eyebrow>Featured</Eyebrow>
              <h2 id="featured-projects" className="sr-only">
                Featured projects
              </h2>
              <div className={cn("mt-8 grid grid-cols-1 gap-4 md:gap-5", featured.length > 1 && "lg:grid-cols-2")}>
                {featured.map((project, index) => (
                  <Reveal key={project.id} delay={index * 100}>
                    <ProjectCard project={project} variant={featured.length === 1 ? "wide" : "feature"} priority={index === 0} />
                  </Reveal>
                ))}
              </div>
            </section>
          ) : null}

          {rest.length > 0 ? (
            <section className={cn("py-16 md:py-24", featured.length > 0 && "border-t border-white/[0.07]")} aria-labelledby="all-projects">
              <div className="container-site">
                <Eyebrow>{featured.length > 0 ? "More work" : "All projects"}</Eyebrow>
                <h2 id="all-projects" className="sr-only">
                  All projects
                </h2>
                <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-5 lg:grid-cols-3">
                  {rest.map((project, index) => (
                    <Reveal key={project.id} delay={(index % 3) * 90}>
                      <ProjectCard project={project} />
                    </Reveal>
                  ))}
                </div>
              </div>
            </section>
          ) : null}
        </>
      )}

      <ClosingCta headline={company.closingHeadline} body={company.closingBody} />
    </>
  );
}
