import { createHash } from "node:crypto";
import { after } from "next/server";
import { prisma } from "@/lib/db";
import { apiErrorResponse, ApiError, requireApiAdmin } from "@/lib/auth/api";
import { runImportJob, type StoredFile } from "@/lib/importers/pipeline";

export const dynamic = "force-dynamic";
export const maxDuration = 300; // the highest limit every Vercel plan accepts; ignored when self-hosting

/**
 * Queues an import and processes it in the background after the response is
 * sent. Progress is written to the job record and polled by the admin UI.
 */
export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    await requireApiAdmin(request);
    const { id } = await context.params;
    const job = await prisma.importJob.findUnique({ where: { id } });
    if (!job) throw new ApiError(404, "Import job not found.");
    if (job.status !== "AWAITING_FILES") throw new ApiError(409, "This import has already started.");
    const files = (job.files as unknown as StoredFile[]) ?? [];
    if (files.length === 0) throw new ApiError(400, "Upload at least one file first.");

    const fingerprint = createHash("sha256")
      .update(files.map((f) => f.sha256).sort().join(":"))
      .digest("hex");
    const previous = await prisma.importJob.findFirst({
      where: { fingerprint, status: "COMPLETED", dryRun: false, id: { not: id } },
      orderBy: { finishedAt: "desc" },
      select: { id: true, finishedAt: true },
    });
    await prisma.importJob.update({ where: { id }, data: { status: "QUEUED", fingerprint, phase: "Queued", heartbeatAt: new Date() } });

    after(async () => {
      await runImportJob(id);
    });

    return Response.json({
      status: "QUEUED",
      duplicateOf: previous ? { id: previous.id, finishedAt: previous.finishedAt } : null,
    });
  } catch (error) {
    return apiErrorResponse(error);
  }
}
