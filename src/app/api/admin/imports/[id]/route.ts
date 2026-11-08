import { prisma } from "@/lib/db";
import { actorFromSession, audit } from "@/lib/audit";
import { apiErrorResponse, ApiError, requireApiAdmin } from "@/lib/auth/api";
import { markStaleJobs } from "@/lib/importers/pipeline";
import { removeJobFiles } from "@/lib/importers/storage";

export const dynamic = "force-dynamic";

/** Job status for the progress poller. */
export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    await requireApiAdmin(request);
    const { id } = await context.params;
    await markStaleJobs();
    const job = await prisma.importJob.findUnique({
      where: { id },
      select: { id: true, status: true, phase: true, progress: true, processedItems: true, errorMessage: true, stats: true, dryRun: true },
    });
    if (!job) throw new ApiError(404, "Import job not found.");
    return Response.json(job, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    return apiErrorResponse(error);
  }
}

/** Cancels a job that hasn't finished yet. */
export async function DELETE(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const session = await requireApiAdmin(request);
    const { id } = await context.params;
    const job = await prisma.importJob.findUnique({ where: { id } });
    if (!job) throw new ApiError(404, "Import job not found.");
    if (["COMPLETED", "FAILED", "CANCELLED"].includes(job.status)) {
      return Response.json({ status: job.status });
    }
    await prisma.importJob.update({ where: { id }, data: { status: "CANCELLED", finishedAt: new Date(), errorMessage: "Cancelled by an administrator." } });
    if (job.status === "AWAITING_FILES") await removeJobFiles(id);
    await audit({ actor: actorFromSession(session), action: "import.cancel", entityType: "ImportJob", entityId: id, summary: "Cancelled an import" });
    return Response.json({ status: "CANCELLED" });
  } catch (error) {
    return apiErrorResponse(error);
  }
}
