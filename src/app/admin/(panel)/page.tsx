import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, CircleCheck, CircleDashed } from "lucide-react";
import { AdminButtonLink, AdminPageHeader, Panel, Pill, StatCard } from "@/components/admin/ui";
import { requireAdmin } from "@/lib/auth/guards";
import { prisma } from "@/lib/db";
import { formatDateTime } from "@/lib/utils";

export const metadata: Metadata = { title: "Dashboard" };

const JOB_TONE = { COMPLETED: "good", FAILED: "bad", PROCESSING: "info", QUEUED: "info", AWAITING_FILES: "neutral", CANCELLED: "neutral" } as const;

export default async function DashboardPage({ searchParams }: { searchParams: Promise<{ welcome?: string; denied?: string }> }) {
  const session = await requireAdmin();
  const sp = await searchParams;
  const published = { status: "PUBLISHED" as const, isPlaceholder: false };
  const [
    products,
    collaborations,
    team,
    milestones,
    pendingProducts,
    pendingCollabs,
    newMessages,
    draftCapabilities,
    publishedCapabilities,
    company,
    socialCount,
    placeholders,
    jobs,
    changes,
  ] = await Promise.all([
    prisma.product.count({ where: { ...published, verifiedAt: { not: null } } }),
    prisma.collaboration.count({ where: { ...published, verifiedAt: { not: null } } }),
    prisma.teamMember.count({ where: published }),
    prisma.companyMilestone.count({ where: { ...published, verifiedAt: { not: null } } }),
    prisma.importCandidate.count({ where: { kind: "PRODUCT", status: "PENDING" } }),
    prisma.importCandidate.count({ where: { kind: "COLLABORATION", status: "PENDING" } }),
    prisma.contactMessage.count({ where: { status: "NEW" } }),
    prisma.capability.count({ where: { status: "DRAFT" } }),
    prisma.capability.count({ where: { status: "PUBLISHED" } }),
    prisma.companyProfile.findUnique({ where: { id: 1 }, select: { contactEmail: true, generalEmail: true, logoId: true } }),
    prisma.socialLink.count({ where: { visible: true } }),
    prisma.product.count({ where: { isPlaceholder: true } }),
    prisma.importJob.findMany({ orderBy: { createdAt: "desc" }, take: 5 }),
    prisma.auditLog.findMany({ orderBy: { createdAt: "desc" }, take: 8 }),
  ]);

  const checklist = [
    { done: draftCapabilities === 0 || publishedCapabilities > 0, label: `Review the ${draftCapabilities} suggested focus areas from your brief`, href: "/admin/capabilities" },
    { done: Boolean(company?.contactEmail || company?.generalEmail), label: "Add an official contact email", href: "/admin/contact" },
    { done: socialCount > 0, label: "Add your social media profiles", href: "/admin/contact#social" },
    { done: products > 0, label: "Publish your first verified product", href: "/admin/imports/claude" },
    { done: collaborations > 0, label: "Import collaborations from your X archive", href: "/admin/imports/x" },
    { done: team > 0, label: "Add team profiles", href: "/admin/team" },
    { done: milestones > 0, label: "Add verified milestones to the journey", href: "/admin/timeline" },
  ];

  return (
    <div className="space-y-8">
      <AdminPageHeader
        title={`Welcome${sp.welcome ? "" : " back"}, ${session.user.name.split(" ")[0]}`}
        description="Everything on the public website is managed from here."
        actions={<AdminButtonLink href="/" target="_blank">View website</AdminButtonLink>}
      />
      {sp.denied ? <p className="rounded-lg border border-beta/30 bg-beta/10 px-4 py-2 text-sm text-beta">That area is limited to owners.</p> : null}
      {placeholders > 0 ? (
        <p className="rounded-lg border border-dashed border-beta/40 px-4 py-2 text-sm text-beta">
          Development sample content exists in this database. It is hidden on production deployments — remove it with{" "}
          <code>npm run db:seed:demo -- --clear</code>.
        </p>
      ) : null}

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <StatCard label="Published products" value={products} href="/admin/products" />
        <StatCard label="Collaborations" value={collaborations} href="/admin/collaborations" />
        <StatCard label="Team members" value={team} href="/admin/team" />
        <StatCard label="Milestones" value={milestones} href="/admin/timeline" />
        <StatCard label="Pending product candidates" value={pendingProducts} href="/admin/candidates/products" tone={pendingProducts ? "accent" : undefined} />
        <StatCard label="Pending collaboration candidates" value={pendingCollabs} href="/admin/candidates/collaborations" tone={pendingCollabs ? "accent" : undefined} />
        <StatCard label="New messages" value={newMessages} href="/admin/messages" tone={newMessages ? "accent" : undefined} />
        <StatCard label="Published focus areas" value={publishedCapabilities} href="/admin/capabilities" />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Panel title="Setup checklist" description="Only verified, owner-approved information appears publicly.">
          <ul className="space-y-1">
            {checklist.map((item) => (
              <li key={item.label}>
                <Link href={item.href} className="group flex items-center gap-3 rounded-lg px-2 py-2 hover:bg-white/[0.03]">
                  {item.done ? (
                    <CircleCheck aria-hidden className="h-4 w-4 shrink-0 text-live" />
                  ) : (
                    <CircleDashed aria-hidden className="h-4 w-4 shrink-0 text-ink-500" />
                  )}
                  <span className={item.done ? "flex-1 text-sm text-ink-500 line-through" : "flex-1 text-sm text-ink-200"}>{item.label}</span>
                  <ArrowRight aria-hidden className="h-3.5 w-3.5 text-ink-600 group-hover:text-ink-300" />
                </Link>
              </li>
            ))}
          </ul>
        </Panel>

        <Panel title="Recent imports" actions={<AdminButtonLink href="/admin/imports" size="sm">All imports</AdminButtonLink>}>
          {jobs.length === 0 ? (
            <p className="text-sm text-ink-400">No imports yet. Start with your Claude export or X archive.</p>
          ) : (
            <ul className="divide-y divide-white/[0.06]">
              {jobs.map((job) => {
                const stats = (job.stats ?? {}) as { candidatesCreated?: number };
                return (
                  <li key={job.id}>
                    <Link href={`/admin/imports/${job.id}`} className="flex items-center justify-between gap-3 py-2.5 hover:text-white">
                      <span className="min-w-0">
                        <span className="block truncate text-sm text-ink-100">{job.kind === "CLAUDE_EXPORT" ? "Claude export" : "X archive"}{job.dryRun ? " (preview)" : ""}</span>
                        <span className="block text-xs text-ink-500">{formatDateTime(job.createdAt)}</span>
                      </span>
                      <span className="flex items-center gap-2">
                        {typeof stats.candidatesCreated === "number" ? <span className="text-xs text-ink-400">{stats.candidatesCreated} new</span> : null}
                        <Pill tone={JOB_TONE[job.status]}>{job.status.replace("_", " ").toLowerCase()}</Pill>
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </Panel>
      </div>

      <Panel title="Recent changes" actions={<AdminButtonLink href="/admin/audit" size="sm">Audit log</AdminButtonLink>}>
        {changes.length === 0 ? (
          <p className="text-sm text-ink-400">No changes recorded yet.</p>
        ) : (
          <ul className="divide-y divide-white/[0.06]">
            {changes.map((entry) => (
              <li key={entry.id} className="flex flex-col gap-1 py-2.5 sm:flex-row sm:items-center sm:justify-between">
                <span className="text-sm text-ink-200">{entry.summary}</span>
                <span className="shrink-0 text-xs text-ink-500">
                  {entry.actorLabel} · {formatDateTime(entry.createdAt)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </Panel>
    </div>
  );
}
