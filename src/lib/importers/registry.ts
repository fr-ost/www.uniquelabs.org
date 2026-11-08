import { claudeImporter } from "@/lib/importers/claude";
import type { Importer } from "@/lib/importers/core/types";
import { xImporter } from "@/lib/importers/x";

/**
 * Importer registry. Adding a new integration means implementing the
 * `Importer` interface and registering it here — the upload API, job runner,
 * persistence and review UI are shared.
 */
export const IMPORTERS: Record<Importer["kind"], Importer> = {
  CLAUDE_EXPORT: claudeImporter,
  X_ARCHIVE: xImporter,
};

export function getImporter(kind: string): Importer | null {
  return (IMPORTERS as Record<string, Importer>)[kind] ?? null;
}
