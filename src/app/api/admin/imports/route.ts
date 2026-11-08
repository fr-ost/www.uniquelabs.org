import { z } from "zod";
import { prisma } from "@/lib/db";
import { actorFromSession, audit } from "@/lib/audit";
import { apiErrorResponse, requireApiAdmin } from "@/lib/auth/api";
import { markStaleJobs } from "@/lib/importers/pipeline";

export const dynamic = "force-dynamic";

const createSchema = z.object({
  kind: z.enum(["CLAUDE_EXPORT", "X_ARCHIVE"]),
  dryRun: z.boolean().default(false),
  label: z.string().trim().max(120).optional(),
});

/** Creates an import job that is waiting for files. */
export async function POST(request: Request) {
  try {
    const session = await requireApiAdmin(request);
    const body = createSchema.safeParse(await request.json().catch(() => null));
    if (!body.success) return Response.json({ error: "Invalid import request." }, { status: 400 });
    await markStaleJobs();
    const running = await prisma.importJob.count({ where: { status: { in: ["QUEUED", "PROCESSING"] } } });
    if (running >= 2) {
      return Response.json({ error: "Another import is still running. Please wait for it to finish." }, { status: 409 });
    }
    const job = await prisma.importJob.create({
      data: { kind: body.data.kind, dryRun: body.data.dryRun, label: body.data.label ?? null, createdById: session.user.id },
    });
    await audit({
      actor: actorFromSession(session),
      action: "import.create",
      entityType: "ImportJob",
      entityId: job.id,
      summary: `Started ${body.data.kind === "CLAUDE_EXPORT" ? "a Claude export" : "an X archive"} import${body.data.dryRun ? " (preview only)" : ""}`,
    });
    return Response.json({ id: job.id }, { status: 201 });
  } catch (error) {
    return apiErrorResponse(error);
  }
}
