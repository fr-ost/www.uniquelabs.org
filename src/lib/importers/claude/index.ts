import { buildProductCandidates, groupAnalyses } from "@/lib/importers/claude/aggregate";
import { analyseDocument, type DocumentAnalysis } from "@/lib/importers/claude/extract";
import { normaliseConversation, normaliseMemories, normaliseProject } from "@/lib/importers/claude/parse";
import { baseName, isZipFile, plainFileEntry, readStreamText, scanArchive, type SourceEntry } from "@/lib/importers/core/archive";
import { streamJsonArray } from "@/lib/importers/core/json-array-stream";
import { ImportFormatError, type Importer, type ImporterContext } from "@/lib/importers/core/types";

/**
 * Claude data export importer (Settings → Privacy → Export data).
 *
 * Accepts the export ZIP(s) — including multi-batch exports — or the
 * extracted conversations.json / projects.json / memories.json files.
 * Everything is processed locally on this server; nothing is sent to any
 * third-party AI service.
 */

type FileRole = "conversations" | "projects" | "memories";

function roleFor(path: string): FileRole | null {
  const name = baseName(path).toLowerCase();
  if (/^conversations(?:[-_ ]?\d+)?\.json$/.test(name)) return "conversations";
  if (/^projects(?:[-_ ]?\d+)?\.json$/.test(name)) return "projects";
  if (/^memor(?:y|ies)(?:[-_ ]?\d+)?\.json$/.test(name)) return "memories";
  return null;
}

export const claudeImporter: Importer = {
  kind: "CLAUDE_EXPORT",
  label: "Claude data export",
  acceptedExtensions: [".zip", ".json"],

  async run(context: ImporterContext) {
    const analyses: DocumentAnalysis[] = [];
    const stats = {
      files: context.files.length,
      sourceFiles: 0,
      conversationsScanned: 0,
      projectsScanned: 0,
      memoryEntries: 0,
      messagesScanned: 0,
      productRelated: 0,
      skippedOversized: 0,
      skippedMalformed: 0,
      skippedEmpty: 0,
    };

    // 1. Resolve uploaded files into readable sources.
    const sources: Array<{ entry: SourceEntry; role: FileRole }> = [];
    const closers: Array<() => void> = [];
    for (const file of context.files) {
      if (await isZipFile(file.path)) {
        const scan = await scanArchive(file, (path) => roleFor(path) !== null, context.warn);
        closers.push(scan.close);
        for (const entry of scan.entries) sources.push({ entry, role: roleFor(entry.path)! });
        if (scan.entries.length === 0) context.warn(`${file.name}: no conversations.json, projects.json or memories.json found inside the archive.`);
      } else {
        const role = roleFor(file.name) ?? (file.name.toLowerCase().endsWith(".json") ? "conversations" : null);
        if (!role) {
          context.warn(`${file.name}: not a Claude export file — skipped.`);
          continue;
        }
        sources.push({ entry: plainFileEntry(file), role });
      }
    }
    if (sources.length === 0) {
      throw new ImportFormatError("No Claude export data found. Upload the export ZIP or its conversations.json file.");
    }
    stats.sourceFiles = sources.length;

    // Conversations are the bulk of the work; process projects/memories first (small).
    sources.sort((a, b) => (a.role === "conversations" ? 1 : 0) - (b.role === "conversations" ? 1 : 0));
    const totalBytes = sources.reduce((sum, s) => sum + s.entry.size, 0) || 1;
    let bytesDone = 0;
    let lastReport = 0;

    const report = async (phase: string, processed: number) => {
      const now = Date.now();
      if (now - lastReport < 750) return;
      lastReport = now;
      await context.onProgress({ phase, percent: Math.min(95, Math.round((bytesDone / totalBytes) * 95)), processedItems: processed });
      await context.checkCancelled();
    };

    try {
      for (const { entry, role } of sources) {
        const stream = await entry.open();
        if (role === "memories") {
          const text = await readStreamText(stream, 50 * 1024 * 1024);
          bytesDone += entry.size;
          try {
            const docs = normaliseMemories(JSON.parse(text));
            stats.memoryEntries += docs.length;
            for (const doc of docs) analyses.push(analyseDocument(doc));
          } catch {
            context.warn(`${entry.label}: memories file could not be parsed — skipped.`);
          }
          continue;
        }

        const result = await streamJsonArray(stream, {
          maxElementBytes: 96 * 1024 * 1024,
          onBytes: (bytes) => {
            bytesDone += bytes;
          },
          onOversized: (index, bytes) => {
            stats.skippedOversized += 1;
            context.warn(`${entry.label}: item #${index + 1} is unusually large (${Math.round(bytes / 1024 / 1024)} MB) and was skipped.`);
          },
          onMalformed: () => {
            stats.skippedMalformed += 1;
          },
          onElement: async (value) => {
            const doc = role === "projects" ? normaliseProject(value) : normaliseConversation(value);
            if (!doc) {
              stats.skippedMalformed += 1;
              return;
            }
            if (role === "projects") stats.projectsScanned += 1;
            else stats.conversationsScanned += 1;
            if (doc.messages.length === 0) {
              stats.skippedEmpty += 1;
              return;
            }
            stats.messagesScanned += doc.messages.length;
            const analysis = analyseDocument(doc);
            if (analysis.isProductRelated) {
              stats.productRelated += 1;
              // Keep only what aggregation needs; drop full message text.
              analysis.doc = {
                ...doc,
                messages: doc.messages.map((m) => ({ ...m, text: m.role === "human" ? m.text.slice(0, 8000) : "" })),
              };
              analyses.push(analysis);
            }
            await report(role === "projects" ? "Scanning projects" : "Scanning conversations", stats.conversationsScanned + stats.projectsScanned);
          },
        });
        if (result.elements === 0) context.warn(`${entry.label}: the file contained no items.`);
      }
    } finally {
      closers.forEach((close) => close());
    }

    if (stats.skippedMalformed > 0) context.warn(`${stats.skippedMalformed} item(s) had an unrecognised structure and were skipped.`);

    await context.onProgress({ phase: "Grouping and classifying", percent: 96, processedItems: stats.conversationsScanned });
    const candidates = buildProductCandidates(groupAnalyses(analyses)).filter((c) => c.confidence >= 20);
    return { candidates, stats };
  },
};
