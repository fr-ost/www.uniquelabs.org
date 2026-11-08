import type { Metadata } from "next";
import { ConfirmAction } from "@/components/admin/confirm";
import { AltTextForm } from "@/components/admin/forms/site-forms";
import { MediaUploader } from "@/components/admin/media-uploader";
import { AdminPageHeader, EmptyPanel, Pill } from "@/components/admin/ui";
import { prisma } from "@/lib/db";
import { env } from "@/lib/env";
import { mediaUrl } from "@/lib/media/storage";
import { formatBytes, formatDate } from "@/lib/utils";
import { deleteMedia, updateMediaAlt } from "@/server/actions/site";

export const metadata: Metadata = { title: "Media library" };

export default async function MediaLibraryPage({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  const page = Math.max(1, Number((await searchParams).page) || 1);
  const take = 24;
  const [assets, total] = await Promise.all([
    prisma.mediaAsset.findMany({
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * take,
      take,
      include: {
        _count: {
          select: {
            productLogos: true,
            productCovers: true,
            productImages: true,
            partnerLogos: true,
            collaborationCover: true,
            teamPhotos: true,
            milestoneImages: true,
            companyLogos: true,
            siteOgImages: true,
          },
        },
      },
    }),
    prisma.mediaAsset.count(),
  ]);
  const pages = Math.max(1, Math.ceil(total / take));

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Media library"
        description={`${total} file${total === 1 ? "" : "s"} · stored in ${env().MEDIA_STORAGE === "filesystem" ? "the media directory" : "the database"}. Images are served publicly from unguessable URLs.`}
      />
      <MediaUploader maxMb={env().MEDIA_MAX_UPLOAD_MB} />
      {assets.length === 0 ? (
        <EmptyPanel title="No media yet" body="Uploaded logos, screenshots and photos appear here." />
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {assets.map((asset) => {
            const uses = Object.values(asset._count).reduce((sum, n) => sum + n, 0);
            return (
              <li key={asset.id} className="overflow-hidden rounded-2xl border border-white/[0.08] bg-ink-900/60">
                <a href={mediaUrl(asset)} target="_blank" rel="noopener noreferrer" className="block aspect-[16/10] bg-[repeating-conic-gradient(#1b1b21_0_25%,#141418_0_50%)] bg-[length:16px_16px] p-3">
                  {/* eslint-disable-next-line @next/next/no-img-element -- admin preview of our own media */}
                  <img src={mediaUrl(asset)} alt={asset.alt} loading="lazy" className="h-full w-full object-contain" />
                </a>
                <div className="space-y-3 p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="truncate text-sm text-ink-100">{asset.fileName}</p>
                      <p className="text-xs text-ink-500">
                        {asset.width && asset.height ? `${asset.width}×${asset.height} · ` : ""}
                        {formatBytes(asset.size)} · {formatDate(asset.createdAt, "DAY", "short")}
                      </p>
                    </div>
                    {uses ? <Pill tone="info">Used {uses}×</Pill> : <Pill>Unused</Pill>}
                  </div>
                  <AltTextForm action={updateMediaAlt.bind(null, asset.id)} alt={asset.alt} />
                  <ConfirmAction
                    action={deleteMedia.bind(null, asset.id)}
                    trigger="Delete file"
                    title={`Delete ${asset.fileName}?`}
                    body={
                      uses
                        ? `This image is used in ${uses} place${uses === 1 ? "" : "s"}. Those places will lose the image (screenshots are removed from their lists).`
                        : "This image isn't used anywhere."
                    }
                    confirmLabel="Delete permanently"
                  />
                </div>
              </li>
            );
          })}
        </ul>
      )}
      {pages > 1 ? (
        <nav className="flex items-center justify-between text-sm" aria-label="Pagination">
          {page > 1 ? <a href={`/admin/media?page=${page - 1}`} className="text-ink-300 hover:text-ink-50">← Newer</a> : <span />}
          <span className="text-ink-500">Page {page} of {pages}</span>
          {page < pages ? <a href={`/admin/media?page=${page + 1}`} className="text-ink-300 hover:text-ink-50">Older →</a> : <span />}
        </nav>
      ) : null}
    </div>
  );
}
