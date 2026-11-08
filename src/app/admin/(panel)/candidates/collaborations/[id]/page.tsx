import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CandidateDetail, KeyValueList } from "@/components/admin/candidate-detail";
import { ApproveCollaborationForm } from "@/components/admin/forms/approve-forms";
import { prisma } from "@/lib/db";
import { approveCollaborationCandidate } from "@/server/actions/candidates";
import { requireAdmin } from "@/lib/auth/guards";

export const metadata: Metadata = { title: "Review collaboration candidate" };

interface CollabData {
  partners?: Array<{ handle: string | null; name: string }>;
  hashtags?: string[];
  urls?: string[];
  tweetUrls?: string[];
  leadTweetUrl?: string;
}

export default async function CollaborationCandidatePage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;
  const candidate = await prisma.importCandidate.findUnique({
    where: { id },
    include: { evidence: { orderBy: { sourceTimestamp: "asc" } }, collaboration: { select: { id: true, title: true } } },
  });
  if (!candidate || candidate.kind !== "COLLABORATION") notFound();
  const collaborations = await prisma.collaboration.findMany({ orderBy: { title: "asc" }, select: { id: true, title: true } });
  const data = (candidate.data ?? {}) as CollabData;
  const partner = data.partners?.[0];

  return (
    <CandidateDetail
      candidate={candidate}
      evidence={candidate.evidence}
      listHref="/admin/candidates/collaborations"
      listLabel="Collaboration candidates"
      linkedRecord={candidate.collaboration ? { href: `/admin/collaborations/${candidate.collaboration.id}`, label: `Open collaboration “${candidate.collaboration.title}”` } : null}
      extracted={
        <KeyValueList
          items={[
            { label: "Partners", value: (data.partners ?? []).map((p) => (p.handle ? `${p.name} (@${p.handle})` : p.name)).join(", ") },
            { label: "Hashtags", value: (data.hashtags ?? []).map((h) => `#${h}`).join(" ") },
            { label: "Links in the posts", value: (data.urls ?? []).join(", ") },
            { label: "Original posts", value: (data.tweetUrls ?? []).length ? <ul>{(data.tweetUrls ?? []).map((u) => <li key={u} className="truncate">{u}</li>)}</ul> : null },
          ]}
        />
      }
      approval={
        <ApproveCollaborationForm
          action={approveCollaborationCandidate.bind(null, candidate.id)}
          collaborations={collaborations.map((c) => ({ value: c.id, label: c.title }))}
          values={{
            title: candidate.title,
            summary: candidate.summary ?? "",
            category: candidate.collaborationCategory ?? "OTHER",
            date: candidate.firstSeenAt ? candidate.firstSeenAt.toISOString().slice(0, 10) : "",
            partnerName: partner?.name.replace(/^@/, "") ?? "",
            partnerHandle: partner?.handle ?? "",
            sourceUrl: data.leadTweetUrl ?? data.tweetUrls?.[0] ?? "",
          }}
        />
      }
    />
  );
}
