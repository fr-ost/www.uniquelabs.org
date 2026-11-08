import { copyFile, mkdir, readdir } from "node:fs/promises";
import path from "node:path";
import { stat } from "node:fs/promises";
import { describe, expect, it } from "vitest";
import { prisma } from "@/lib/db";
import { runImportJob, type StoredFile } from "@/lib/importers/pipeline";
import { importRoot, jobDir } from "@/lib/importers/storage";
import { sampleClaudeConversations, sampleProjects, sampleTweets, tempDir, writeText, writeZip, xWrapper } from "../fixtures/builders";

async function claudeZip() {
  const dir = await tempDir();
  return writeZip(path.join(dir, "export.zip"), {
    "data-x-batch-0000/conversations.json": JSON.stringify(sampleClaudeConversations()),
    "data-x-batch-0000/projects.json": JSON.stringify(sampleProjects()),
  });
}

async function xZip() {
  const dir = await tempDir();
  return writeZip(path.join(dir, "archive.zip"), {
    "data/tweets.js": xWrapper("tweets", sampleTweets()),
    "data/account.js": xWrapper("account", [{ account: { username: "uniquelabs" } }]),
  });
}

/** Simulates the upload endpoint: files copied into the job's private directory. */
async function queueJob(kind: "CLAUDE_EXPORT" | "X_ARCHIVE", sources: string[], dryRun = false) {
  const job = await prisma.importJob.create({ data: { kind, dryRun } });
  const files: StoredFile[] = [];
  await mkdir(jobDir(job.id), { recursive: true });
  for (const [index, source] of sources.entries()) {
    const storedAs = `${index + 1}-${path.basename(source)}`;
    await copyFile(source, path.join(jobDir(job.id), storedAs));
    files.push({ name: path.basename(source), storedAs, size: (await stat(source)).size, sha256: `sha-${index}` });
  }
  await prisma.importJob.update({ where: { id: job.id }, data: { files: files as never, status: "QUEUED" } });
  return job.id;
}

describe("import pipeline", () => {
  it("imports candidates with evidence and removes the raw upload", async () => {
    const jobId = await queueJob("CLAUDE_EXPORT", [await claudeZip()]);
    await runImportJob(jobId);

    const job = await prisma.importJob.findUniqueOrThrow({ where: { id: jobId } });
    expect(job.status).toBe("COMPLETED");
    expect(job.progress).toBe(100);
    const stats = job.stats as Record<string, number>;
    expect(stats.candidatesCreated).toBeGreaterThanOrEqual(3);

    const tabnest = await prisma.importCandidate.findFirstOrThrow({ where: { title: "TabNest" }, include: { evidence: true } });
    expect(tabnest.productStage).toBe("PUBLISHED");
    expect(tabnest.status).toBe("PENDING");
    expect(tabnest.evidence.length).toBeGreaterThanOrEqual(2);
    expect(tabnest.evidence.every((e) => e.isPublic === false)).toBe(true);

    // Raw files are deleted after processing.
    const remaining = await readdir(importRoot()).catch(() => [] as string[]);
    expect(remaining).not.toContain(jobId);
  });

  it("is idempotent: re-importing the same archive creates nothing new", async () => {
    const zip = await claudeZip();
    await runImportJob(await queueJob("CLAUDE_EXPORT", [zip]));
    const before = await prisma.importCandidate.count();
    const evidenceBefore = await prisma.sourceEvidence.count();

    const second = await queueJob("CLAUDE_EXPORT", [zip]);
    await runImportJob(second);
    const stats = (await prisma.importJob.findUniqueOrThrow({ where: { id: second } })).stats as Record<string, number>;
    expect(stats.candidatesCreated).toBe(0);
    expect(stats.evidenceAdded).toBe(0);
    expect(stats.evidenceAlreadyKnown).toBeGreaterThan(0);
    expect(await prisma.importCandidate.count()).toBe(before);
    expect(await prisma.sourceEvidence.count()).toBe(evidenceBefore);
  });

  it("never resurrects rejected candidates on re-import", async () => {
    const zip = await xZip();
    await runImportJob(await queueJob("X_ARCHIVE", [zip]));
    const acme = await prisma.importCandidate.findFirstOrThrow({ where: { title: { contains: "Acme" } } });
    await prisma.importCandidate.update({ where: { id: acme.id }, data: { status: "REJECTED" } });

    await runImportJob(await queueJob("X_ARCHIVE", [zip]));
    expect((await prisma.importCandidate.findUniqueOrThrow({ where: { id: acme.id } })).status).toBe("REJECTED");
    expect(await prisma.importCandidate.count({ where: { title: { contains: "Acme" } } })).toBe(1);
  });

  it("adds new evidence from a newer archive to the existing candidate", async () => {
    await runImportJob(await queueJob("X_ARCHIVE", [await xZip()]));
    const dir = await tempDir();
    const newer = await writeText(
      path.join(dir, "tweets.js"),
      xWrapper("tweets", [
        ...sampleTweets(),
        {
          tweet: {
            id_str: "2001",
            id: "2001",
            full_text: "Our partnership with @acmetools continues — new integration shipped!",
            created_at: "Fri Apr 04 10:00:00 +0000 2025",
            entities: { user_mentions: [{ screen_name: "acmetools", name: "Acme Tools", indices: ["21", "31"] }], hashtags: [], urls: [] },
          },
        },
      ]),
    );
    await runImportJob(await queueJob("X_ARCHIVE", [newer]));
    const acme = await prisma.importCandidate.findFirstOrThrow({ where: { title: { contains: "Acme" } }, include: { evidence: true } });
    expect(acme.evidence.map((e) => e.sourceId).sort()).toEqual(["1001", "1002", "2001"]);
  });

  it("dry runs store a preview but save no candidates", async () => {
    const jobId = await queueJob("CLAUDE_EXPORT", [await claudeZip()], true);
    await runImportJob(jobId);
    const job = await prisma.importJob.findUniqueOrThrow({ where: { id: jobId } });
    expect(job.status).toBe("COMPLETED");
    expect(Array.isArray(job.preview)).toBe(true);
    expect((job.preview as unknown[]).length).toBeGreaterThan(0);
    expect(await prisma.importCandidate.count()).toBe(0);
  });

  it("fails gracefully on a malformed upload and still cleans up", async () => {
    const dir = await tempDir();
    const bad = await writeText(path.join(dir, "conversations.json"), "{ this is not json");
    const jobId = await queueJob("CLAUDE_EXPORT", [bad]);
    await runImportJob(jobId);
    const job = await prisma.importJob.findUniqueOrThrow({ where: { id: jobId } });
    expect(job.status).toBe("FAILED");
    expect(job.errorMessage).toMatch(/JSON array|empty/i);
    const remaining = await readdir(importRoot()).catch(() => [] as string[]);
    expect(remaining).not.toContain(jobId);
  });
});
