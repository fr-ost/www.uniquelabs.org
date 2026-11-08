import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowUpRight } from "lucide-react";
import { PartnerMark } from "@/components/cards/content-cards";
import { ProjectStatus } from "@/components/cards/project-card";
import { ScreenshotGallery } from "@/components/sections/screenshot-gallery";
import { ClosingCta } from "@/components/sections/shared-sections";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { ButtonLink, TextLink } from "@/components/ui/button";
import { Markdown } from "@/components/ui/markdown";
import { MediaImage } from "@/components/ui/media-image";
import { Eyebrow } from "@/components/ui/section";
import { getCompany, getProject, getProjects, projectSlugs } from "@/lib/content/public";
import { clampDescription, pageMetadata } from "@/lib/seo/metadata";
import { displayHost, formatDate } from "@/lib/utils";

type Params = Promise<{ slug: string }>;

/** Pages are generated at build time; unknown slugs are 404s. */
export const dynamicParams = false;

export function generateStaticParams() {
  return projectSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const project = await getProject(slug);
  if (!project) return { title: "Project not found", robots: { index: false } };
  return pageMetadata({
    title: project.title,
    description: clampDescription(project.summary),
    path: `/projects/${project.slug}`,
    type: "article",
  });
}

export default async function ProjectPage({ params }: { params: Params }) {
  const { slug } = await params;
  const [project, company] = await Promise.all([getProject(slug), getCompany()]);
  if (!project) notFound();
  const others = (await getProjects()).filter((p) => p.id !== project.id).slice(0, 3);
  const accent = project.accentColor ?? "#ff6b35";
  const [primaryLink, ...otherLinks] = project.links;
  const meta = [
    ...(project.client ? [{ label: "Client", value: project.client }] : []),
    ...(project.date ? [{ label: "Date", value: formatDate(project.date.date, project.date.precision) }] : []),
    ...(project.services.length ? [{ label: "Services", value: project.services.join(", ") }] : []),
  ];

  return (
    <>
      <article>
        <header className="relative overflow-hidden border-b border-white/[0.07] pt-[calc(var(--header-height)+2.5rem)] pb-14 md:pb-20">
          <div aria-hidden className="grid-lines mask-fade-radial pointer-events-none absolute inset-0 opacity-50" />
          <div
            aria-hidden
            className="pointer-events-none absolute -top-48 right-[-15%] h-[44rem] w-[44rem] rounded-full"
            style={{ background: `radial-gradient(circle, ${accent}2e, transparent 62%)` }}
          />
          <div className="container-site relative">
            <Breadcrumbs
              items={[
                { name: "Projects", path: "/projects" },
                { name: project.title, path: `/projects/${project.slug}` },
              ]}
            />
            <div className="mt-12 grid grid-cols-1 gap-10 lg:grid-cols-12">
              <div className="lg:col-span-8">
                <div className="flex flex-wrap items-center gap-3">
                  <Eyebrow>Project</Eyebrow>
                  <ProjectStatus status={project.status} />
                </div>
                <h1 className="text-display-lg mt-7 animate-fade-up text-ink-50">{project.title}</h1>
                <p className="text-lede mt-6 max-w-2xl animate-fade-up text-ink-300 [animation-delay:120ms]">{project.summary}</p>
                {primaryLink || otherLinks.length ? (
                  <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                    {primaryLink ? (
                      <ButtonLink href={primaryLink.url} external arrow>
                        {primaryLink.label}
                      </ButtonLink>
                    ) : null}
                    {otherLinks.map((link) => (
                      <ButtonLink key={link.id} href={link.url} external variant="secondary" arrow>
                        {link.label}
                      </ButtonLink>
                    ))}
                  </div>
                ) : null}
              </div>
              {meta.length > 0 ? (
                <dl className="grid grid-cols-1 gap-4 self-end sm:grid-cols-3 lg:col-span-4 lg:grid-cols-1">
                  {meta.map((item) => (
                    <div key={item.label} className="surface-card p-5">
                      <dt className="text-eyebrow text-ink-500">{item.label}</dt>
                      <dd className="mt-2 text-ink-100">{item.value}</dd>
                    </div>
                  ))}
                </dl>
              ) : null}
            </div>
          </div>
        </header>

        {project.cover ? (
          <div className="container-site pt-12 md:pt-16">
            <div className="overflow-hidden rounded-[var(--radius-panel)] border border-white/10">
              <MediaImage media={project.cover} priority sizes="(min-width: 1408px) 1312px, 100vw" className="w-full" />
            </div>
          </div>
        ) : null}

        <div className="container-site grid grid-cols-1 gap-12 py-14 md:py-20 lg:grid-cols-12 lg:gap-10">
          <div className="space-y-12 lg:col-span-7 lg:col-start-2">
            <Markdown source={project.description ?? project.summary} className="text-lg" />
            {project.outcome ? (
              <section aria-labelledby="outcome-title" className="ring-gradient glass rounded-[var(--radius-panel)] p-6 md:p-8">
                <h2 id="outcome-title" className="text-eyebrow text-signal-400">
                  Outcome
                </h2>
                <Markdown source={project.outcome} className="mt-4" />
              </section>
            ) : null}
          </div>
          {project.products.length > 0 || project.partners.length > 0 ? (
            <aside className="space-y-4 lg:col-span-3 lg:col-start-10">
              {project.products.length > 0 ? (
                <div className="surface-card p-6">
                  <p className="text-eyebrow text-ink-400">Related products</p>
                  <ul className="mt-4 space-y-2 text-sm">
                    {project.products.map((product) => (
                      <li key={product.slug}>
                        <Link href={`/products/${product.slug}`} className="text-ink-200 hover:text-ink-50">
                          {product.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
              {project.partners.length > 0 ? (
                <div className="surface-card p-6">
                  <p className="text-eyebrow text-ink-400">{project.partners.length > 1 ? "Partners" : "Partner"}</p>
                  <ul className="mt-4 space-y-4">
                    {project.partners.map((partner) => (
                      <li key={partner.slug}>
                        {partner.logo ? (
                          <div className="flex h-10 w-28 items-center">
                            <PartnerMark partner={partner} />
                          </div>
                        ) : (
                          <PartnerMark partner={partner} className="block" />
                        )}
                        {partner.websiteUrl ? (
                          <a href={partner.websiteUrl} target="_blank" rel="noopener noreferrer" className="mt-1 inline-flex items-center gap-1 text-xs text-ink-400 hover:text-ink-50">
                            {displayHost(partner.websiteUrl)} <ArrowUpRight aria-hidden className="h-3 w-3" />
                          </a>
                        ) : null}
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </aside>
          ) : null}
        </div>

        {project.images.length > 0 ? (
          <section className="border-t border-white/[0.07] py-14 md:py-20" aria-labelledby="gallery-title">
            <div className="container-site">
              <h2 id="gallery-title" className="text-display-sm text-ink-50">
                Gallery
              </h2>
              <div className="mt-8">
                <ScreenshotGallery shots={project.images} productName={project.title} />
              </div>
            </div>
          </section>
        ) : null}
      </article>

      {others.length > 0 ? (
        <section className="border-t border-white/[0.07] py-16 md:py-20" aria-labelledby="more-projects">
          <div className="container-site">
            <div className="flex items-end justify-between gap-6">
              <h2 id="more-projects" className="text-display-sm text-ink-50">
                More work
              </h2>
              <TextLink href="/projects">All projects</TextLink>
            </div>
            <ul className="mt-8 divide-y divide-white/[0.07] border-y border-white/[0.07]">
              {others.map((item) => (
                <li key={item.id}>
                  <Link href={`/projects/${item.slug}`} className="group flex items-center justify-between gap-6 py-5">
                    <span>
                      <span className="block font-display text-lg font-medium tracking-[-0.02em] text-ink-100 group-hover:text-white">{item.title}</span>
                      <span className="block text-sm text-ink-500">{[item.client, item.services[0]].filter(Boolean).join(" · ")}</span>
                    </span>
                    <span aria-hidden className="text-ink-500 transition-transform group-hover:translate-x-1 group-hover:text-signal-500">
                      →
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>
      ) : null}

      <ClosingCta headline={company.closingHeadline} body={company.closingBody} />
    </>
  );
}
