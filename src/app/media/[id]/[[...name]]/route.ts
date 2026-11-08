import { prisma } from "@/lib/db";
import { readMediaBytes } from "@/lib/media/storage";

/**
 * Serves media-library assets. Asset ids are unguessable and content never
 * changes for a given id, so responses are cached immutably. SVGs get a
 * sandboxing CSP so they can never execute script even if opened directly.
 */
export async function GET(
  request: Request,
  context: { params: Promise<{ id: string; name?: string[] }> },
) {
  const { id } = await context.params;
  if (!/^[A-Za-z0-9_-]{10,40}$/.test(id)) {
    return new Response("Not found", { status: 404 });
  }

  const asset = await prisma.mediaAsset.findUnique({
    where: { id },
    select: { id: true, storage: true, storageKey: true, mimeType: true, sha256: true, fileName: true },
  });
  if (!asset) return new Response("Not found", { status: 404 });

  const etag = `"${asset.sha256.slice(0, 40)}"`;
  const baseHeaders: Record<string, string> = {
    "Cache-Control": "public, max-age=31536000, immutable",
    ETag: etag,
    "X-Content-Type-Options": "nosniff",
    "Cross-Origin-Resource-Policy": "cross-origin",
  };
  if (request.headers.get("if-none-match") === etag) {
    return new Response(null, { status: 304, headers: baseHeaders });
  }

  const bytes = await readMediaBytes(asset);
  if (!bytes) return new Response("Not found", { status: 404 });

  const headers: Record<string, string> = {
    ...baseHeaders,
    "Content-Type": asset.mimeType,
    "Content-Length": String(bytes.length),
    "Content-Disposition": `inline; filename="${asset.fileName.replace(/["\\\r\n]/g, "")}"`,
  };
  if (asset.mimeType === "image/svg+xml") {
    headers["Content-Security-Policy"] = "default-src 'none'; style-src 'unsafe-inline'; sandbox";
  }
  return new Response(new Uint8Array(bytes), { status: 200, headers });
}
