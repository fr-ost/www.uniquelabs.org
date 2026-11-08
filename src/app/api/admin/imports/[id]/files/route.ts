import path from "node:path";
import { prisma } from "@/lib/db";
import { apiErrorResponse, ApiError, requireApiAdmin } from "@/lib/auth/api";
import { env } from "@/lib/env";
import { getImporter } from "@/lib/importers/registry";
import { jobDir, safeUploadName, saveUploadStream, UploadTooLargeError } from "@/lib/importers/storage";
import type { StoredFile } from "@/lib/importers/pipeline";

export const dynamic = "force-dynamic";
export const maxDuration = 3600;

const MAX_FILES_PER_JOB = 25;

/**
 * Receives one file for an import job as a raw request body. The body is
 * streamed straight to private temporary storage (never buffered in memory)
 * with a hard size limit, and hashed for duplicate-import detection.
 */
export async function PUT(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    await requireApiAdmin(request);
    const { id } = await context.params;
    const job = await prisma.importJob.findUnique({ where: { id } });
    if (!job) throw new ApiError(404, "Import job not found.");
    if (job.status !== "AWAITING_FILES") throw new ApiError(409, "This import has already started.");

    const importer = getImporter(job.kind);
    const name = (new URL(request.url).searchParams.get("name") ?? "").slice(0, 200);
    const extension = path.extname(name).toLowerCase();
    if (!name || !importer || !importer.acceptedExtensions.includes(extension)) {
      throw new ApiError(415, `Unsupported file type. Upload ${importer?.acceptedExtensions.join(", ") ?? "a supported file"}.`);
    }
    const files = (job.files as unknown as StoredFile[]) ?? [];
    if (files.length >= MAX_FILES_PER_JOB) throw new ApiError(400, `At most ${MAX_FILES_PER_JOB} files per import.`);
    if (!request.body) throw new ApiError(400, "Empty upload.");

    const maxBytes = env().IMPORT_MAX_UPLOAD_MB * 1024 * 1024;
    const declared = Number(request.headers.get("content-length") ?? "0");
    if (declared > maxBytes) throw new ApiError(413, `File exceeds the ${env().IMPORT_MAX_UPLOAD_MB} MB limit.`);

    const storedAs = `${String(files.length + 1).padStart(2, "0")}-${safeUploadName(name)}`;
    const { size, sha256 } = await saveUploadStream(request.body, path.join(jobDir(id), storedAs), maxBytes);
    if (size === 0) throw new ApiError(400, "The file is empty.");

    const record: StoredFile = { name: safeUploadName(name), storedAs, size, sha256 };
    // Re-read inside a transaction to avoid losing concurrent uploads.
    await prisma.$transaction(async (tx) => {
      const current = await tx.importJob.findUniqueOrThrow({ where: { id } });
      const list = ((current.files as unknown as StoredFile[]) ?? []).concat(record);
      await tx.importJob.update({ where: { id }, data: { files: list as never } });
    });
    return Response.json({ file: { name: record.name, size, sha256 } }, { status: 201 });
  } catch (error) {
    if (error instanceof UploadTooLargeError) return Response.json({ error: error.message }, { status: 413 });
    return apiErrorResponse(error);
  }
}
