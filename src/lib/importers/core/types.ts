/**
 * Shared types for the import engine.
 *
 * Every importer follows the same pipeline:
 *   Import → Parse → Normalize → Deduplicate → Extract candidates → Review →
 *   Approve → Publish
 * Importers are pure: they read files and return candidate drafts. The
 * pipeline (pipeline.ts) owns persistence, idempotency and job state.
 */

export type CandidateKindValue = "PRODUCT" | "COLLABORATION";

export type ProductStageValue =
  | "IDEA"
  | "PLANNING"
  | "IN_DEVELOPMENT"
  | "COMPLETED"
  | "BETA"
  | "PUBLISHED"
  | "CANCELLED"
  | "NEEDS_VERIFICATION";

export type CollaborationCategoryValue =
  | "BRAND_PARTNERSHIP"
  | "PRODUCT_INTEGRATION"
  | "CO_CREATION"
  | "SPONSORSHIP"
  | "CAMPAIGN"
  | "COMMUNITY"
  | "CONTRIBUTION"
  | "OTHER";

export type VerificationValue = "NEEDS_VERIFICATION" | "EVIDENCE_FOUND";

export type EvidenceSourceValue = "CLAUDE_CONVERSATION" | "CLAUDE_PROJECT" | "CLAUDE_MEMORY" | "TWEET";

export interface EvidenceDraft {
  sourceType: EvidenceSourceValue;
  sourceId: string;
  sourceTitle: string | null;
  sourceUrl: string | null;
  excerpt: string | null;
  sourceTimestamp: Date | null;
  author: string | null;
  details: Record<string, unknown>;
}

export interface CandidateDraft {
  kind: CandidateKindValue;
  fingerprint: string;
  title: string;
  summary: string | null;
  productStage?: ProductStageValue;
  collaborationCategory?: CollaborationCategoryValue;
  confidence: number;
  verification: VerificationValue;
  data: Record<string, unknown>;
  signals: string[];
  firstSeenAt: Date | null;
  lastSeenAt: Date | null;
  evidence: EvidenceDraft[];
}

/** A file the owner uploaded for an import job (stored privately on disk). */
export interface UploadedFile {
  path: string;
  name: string;
  size: number;
}

export interface ImportProgress {
  phase: string;
  /** 0–100 */
  percent: number;
  processedItems: number;
}

export interface ImporterContext {
  files: UploadedFile[];
  onProgress: (progress: ImportProgress) => Promise<void> | void;
  warn: (message: string) => void;
  /** Throws if the job was cancelled. Called periodically by importers. */
  checkCancelled: () => Promise<void>;
}

export interface ImporterResult {
  candidates: CandidateDraft[];
  stats: Record<string, number>;
}

export interface Importer {
  kind: "CLAUDE_EXPORT" | "X_ARCHIVE";
  label: string;
  /** File extensions the upload endpoint accepts for this importer. */
  acceptedExtensions: string[];
  run: (context: ImporterContext) => Promise<ImporterResult>;
}

export class ImportCancelledError extends Error {
  constructor() {
    super("Import cancelled");
  }
}

export class ImportFormatError extends Error {}
