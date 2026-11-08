import { prisma } from "@/lib/db";
import { audit, actorFromSession } from "@/lib/audit";
import { apiErrorResponse, readBodyLimited, requireApiAdmin, ApiError } from "@/lib/auth/api";
import { env } from "@/lib/env";
import { MediaValidationError } from "@/lib/media/process";
import { mediaUrl, storeMedia } from "@/lib/media/storage";

export const dynamic = "force-dynamic";

function toJson(asset: {
  id: string;
  fileName: string;
  mimeType: string;
  width: number | null;
  height: number | null;
  alt: string;
  size: number;
  createdAt: Date;
}) {
  return {
    id: asset.id,
    url: mediaUrl(asset),
    fileName: asset.fileName,
    mimeType: asset.mimeType,
    width: asset.width,
    height: asset.height,
    alt: asset.alt,
    size: asset.size,
    createdAt: asset.createdAt.toISOString(),
  };
}

/** Lists media for the picker (newest first, optional filename search). */
export async function GET(request: Request) {
  try {
    await requireApiAdmin(request);
    const url = new URL(request.url);
    const q = (url.searchParams.get("q") ?? "").trim().slice(0, 80);
    const take = Math.min(Number(url.searchParams.get("take") ?? 60) || 60, 120);
    const assets = await prisma.mediaAsset.findMany({
      where: q ? { OR: [{ fileName: { contains: q, mode: "insensitive" } }, { alt: { contains: q, mode: "insensitive" } }] } : {},
      orderBy: { createdAt: "desc" },
      take,
      select: { id: true, fileName: true, mimeType: true, width: true, height: true, alt: true, size: true, createdAt: true },
    });
    return Response.json({ assets: assets.map(toJson) });
  } catch (error) {
    return apiErrorResponse(error);
  }
}

/** Uploads one image (raw request body). The real format is detected from bytes. */
export async function PUT(request: Request) {
  try {
    const session = await requireApiAdmin(request);
    const url = new URL(request.url);
    const name = (url.searchParams.get("name") ?? "image").slice(0, 200);
    const alt = (url.searchParams.get("alt") ?? "").slice(0, 300);
    const maxBytes = env().MEDIA_MAX_UPLOAD_MB * 1024 * 1024;
    const buffer = await readBodyLimited(request, maxBytes);
    if (buffer.length === 0) throw new ApiError(400, "The file is empty.");

    const { asset, deduplicated } = await storeMedia({ buffer, originalName: name, alt, uploadedById: session.user.id });
    if (!deduplicated) {
      await audit({
        actor: actorFromSession(session),
        action: "media.upload",
        entityType: "MediaAsset",
        entityId: asset.id,
        summary: `Uploaded ${asset.fileName}`,
        metadata: { size: asset.size, mimeType: asset.mimeType },
      });
    }
    return Response.json({ asset: toJson(asset), deduplicated }, { status: deduplicated ? 200 : 201 });
  } catch (error) {
    if (error instanceof MediaValidationError) {
      return Response.json({ error: error.message }, { status: 422 });
    }
    return apiErrorResponse(error);
  }
}
