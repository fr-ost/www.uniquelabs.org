import type { DocumentAnalysis, TimedSignal } from "@/lib/importers/claude/extract";
import type { CandidateDraft, EvidenceDraft, ProductStageValue, VerificationValue } from "@/lib/importers/core/types";
import { excerptAround, hostOf, truncateText } from "@/lib/importers/core/text";

/**
 * Groups per-document analyses into product candidates and classifies each
 * product's stage from the combined evidence.
 */

interface Group {
  key: string;
  names: Map<string, { display: string; weight: number }>;
  chromeIds: Set<string>;
  docs: DocumentAnalysis[];
}

const STAGE_LABEL: Record<ProductStageValue, string> = {
  IDEA: "idea",
  PLANNING: "planning",
  IN_DEVELOPMENT: "development in progress",
  COMPLETED: "completed",
  BETA: "beta",
  PUBLISHED: "published",
  CANCELLED: "cancelled",
  NEEDS_VERIFICATION: "needs verification",
};

export function groupAnalyses(analyses: DocumentAnalysis[]): Group[] {
  const byKey = new Map<string, Group>();
  const nameToKey = new Map<string, string>();

  // Store-id groups first: a Chrome Web Store id is the strongest identity.
  const ordered = [...analyses].sort((a, b) => b.chromeIds.length - a.chromeIds.length);
  for (const analysis of ordered) {
    if (!analysis.isProductRelated || !analysis.bestName) continue;
    const name = analysis.bestName;
    let key = analysis.chromeIds[0] ? `cws:${analysis.chromeIds[0]}` : (nameToKey.get(name.normalised) ?? `name:${name.normalised}`);
    if (!analysis.chromeIds[0] && nameToKey.has(name.normalised)) key = nameToKey.get(name.normalised)!;
    let group = byKey.get(key);
    if (!group) {
      group = { key, names: new Map(), chromeIds: new Set(), docs: [] };
      byKey.set(key, group);
    }
    group.docs.push(analysis);
    analysis.chromeIds.forEach((id) => group.chromeIds.add(id));
    for (const mention of analysis.names) {
      const existing = group.names.get(mention.normalised);
      if (existing) existing.weight += mention.weight;
      else group.names.set(mention.normalised, { display: mention.display, weight: mention.weight });
    }
    if (!nameToKey.has(name.normalised)) nameToKey.set(name.normalised, key);
  }
  return [...byKey.values()];
}

function bestDisplayName(group: Group): string {
  let best = { display: "Untitled product", weight: -1 };
  for (const entry of group.names.values()) if (entry.weight > best.weight) best = entry;
  return best.display;
}

interface Classification {
  stage: ProductStageValue;
  verification: VerificationValue;
  reasons: string[];
  strength: number;
}

export function classifyStage(signals: TimedSignal[], hasOwnerStoreUrl: boolean): Classification {
  const owner = signals.filter((s) => s.owner);
  const count = (kind: TimedSignal["kind"]) => owner.filter((s) => s.kind === kind).length;
  const latest = (kind: TimedSignal["kind"]) =>
    owner
      .filter((s) => s.kind === kind)
      .reduce<number>((max, s) => Math.max(max, s.at?.getTime() ?? 0), -1);

  const published = count("published");
  const approved = count("approved");
  const usage = count("usage");
  const rejectedAt = latest("rejected");
  const positiveAt = Math.max(latest("published"), latest("approved"), latest("usage"));
  const reasons: string[] = [];

  const strongEvidence = published + approved + usage + (hasOwnerStoreUrl ? 1 : 0);
  const rejectedAfterward = rejectedAt > -1 && rejectedAt >= positiveAt && approved === 0;

  if (strongEvidence > 0 && !rejectedAfterward) {
    if (hasOwnerStoreUrl) reasons.push("Owner shared a store listing URL");
    if (published) reasons.push(`${published} explicit release statement${published > 1 ? "s" : ""} by the owner`);
    if (approved) reasons.push("Store approval mentioned by the owner");
    if (usage) reasons.push("Real usage numbers or reviews mentioned");
    return { stage: "PUBLISHED", verification: "EVIDENCE_FOUND", reasons, strength: Math.min(4, strongEvidence) };
  }
  if (rejectedAfterward) reasons.push("Most recent store outcome mentioned was a rejection");

  if (count("cancelled") > 0) return { stage: "CANCELLED", verification: "NEEDS_VERIFICATION", reasons: [...reasons, "Owner mentioned stopping the project"], strength: 1 };
  if (count("beta") > 0) return { stage: "BETA", verification: "EVIDENCE_FOUND", reasons: [...reasons, "Beta / early access mentioned by the owner"], strength: 2 };
  if (count("submitted") > 0 || count("completed") > 0) {
    return { stage: "COMPLETED", verification: "NEEDS_VERIFICATION", reasons: [...reasons, count("submitted") ? "Submitted for store review (not confirmed live)" : "Owner described the work as finished"], strength: 1 };
  }
  if (count("ambiguous_launch") > 0 && signals.some((s) => s.kind === "development")) {
    return { stage: "NEEDS_VERIFICATION", verification: "NEEDS_VERIFICATION", reasons: [...reasons, "Launch/publish words appear, but no confirmed release statement or live listing"], strength: 0 };
  }
  if (signals.filter((s) => s.kind === "development").length >= 2) return { stage: "IN_DEVELOPMENT", verification: "NEEDS_VERIFICATION", reasons: [...reasons, "Hands-on development and debugging discussed"], strength: 0 };
  if (signals.some((s) => s.kind === "planning")) return { stage: "PLANNING", verification: "NEEDS_VERIFICATION", reasons: [...reasons, "Planning discussed"], strength: 0 };
  if (count("idea") > 0) return { stage: "IDEA", verification: "NEEDS_VERIFICATION", reasons: [...reasons, "Discussed as an idea"], strength: 0 };
  return { stage: "IN_DEVELOPMENT", verification: "NEEDS_VERIFICATION", reasons: [...reasons, "Product-related technical discussion"], strength: 0 };
}

function conversationUrl(doc: DocumentAnalysis["doc"]): string | null {
  if (doc.kind === "conversation" && /^[0-9a-f-]{20,}$/i.test(doc.id)) return `https://claude.ai/chat/${doc.id}`;
  if (doc.kind === "project" && /^[0-9a-f-]{20,}$/i.test(doc.id)) return `https://claude.ai/project/${doc.id}`;
  return null;
}

function evidenceFor(analysis: DocumentAnalysis, productName: string): EvidenceDraft {
  const doc = analysis.doc;
  const ownerSignals = analysis.signals.filter((s) => s.owner && s.kind !== "development");
  const priority = ["published", "approved", "usage", "beta", "submitted", "rejected", "completed", "cancelled", "ambiguous_launch", "idea", "planning"];
  ownerSignals.sort((a, b) => priority.indexOf(a.kind) - priority.indexOf(b.kind));
  const top = ownerSignals[0];
  let excerpt: string;
  if (top) {
    excerpt = truncateText(top.sentence, 600);
  } else {
    const message = doc.messages.find((m) => m.role === "human" && m.text.toLowerCase().includes(productName.toLowerCase())) ?? doc.messages.find((m) => m.role === "human");
    excerpt = message ? excerptAround(message.text, productName, 600) : truncateText(doc.title, 200);
  }
  const timestamps = doc.messages.map((m) => m.createdAt?.getTime() ?? 0).filter(Boolean);
  return {
    sourceType: doc.kind === "project" ? "CLAUDE_PROJECT" : doc.kind === "memory" ? "CLAUDE_MEMORY" : "CLAUDE_CONVERSATION",
    sourceId: doc.id,
    sourceTitle: doc.title,
    sourceUrl: conversationUrl(doc),
    excerpt,
    sourceTimestamp: top?.at ?? doc.createdAt ?? (timestamps.length ? new Date(Math.min(...timestamps)) : null),
    author: null,
    details: {
      matched: [...new Set(analysis.signals.map((s) => s.label))].slice(0, 12),
      urls: [...analysis.urls.chromeStore, ...analysis.urls.store, ...analysis.urls.deployment, ...analysis.urls.site].slice(0, 12),
      messages: doc.messages.length,
      codeBlocks: analysis.codeBlocks,
      nameSource: analysis.bestName?.source ?? null,
    },
  };
}

export function buildProductCandidates(groups: Group[]): CandidateDraft[] {
  const drafts: CandidateDraft[] = [];
  for (const group of groups) {
    const title = bestDisplayName(group);
    const docs = group.docs;
    const signals = docs.flatMap((d) => d.signals);
    const ownerStoreUrls = docs.flatMap((d) => [...d.urls.chromeStore, ...d.urls.store].filter((u) => d.ownerUrls.has(u)));
    const classification = classifyStage(signals, ownerStoreUrls.length > 0);

    const allUrls = {
      store: [...new Set(docs.flatMap((d) => [...d.urls.chromeStore, ...d.urls.store]))],
      deployment: [...new Set(docs.flatMap((d) => d.urls.deployment))],
      site: [...new Set(docs.flatMap((d) => d.urls.site))].slice(0, 15),
    };
    const platforms = [...new Set(docs.flatMap((d) => [...d.platforms]))];
    const description =
      docs.find((d) => d.manifestDescription)?.manifestDescription ??
      docs.find((d) => d.doc.kind === "project" && d.doc.summary)?.doc.summary ??
      docs.find((d) => d.doc.summary)?.doc.summary ??
      null;

    const nameStrength = Math.max(...docs.map((d) => (d.bestName ? d.bestName.weight : 0)));
    const devStrength = Math.min(20, Math.round(docs.reduce((sum, d) => sum + d.devScore + d.codeBlocks * 2, 0) / 3));
    const stageStrength = { PUBLISHED: 22, BETA: 14, COMPLETED: 10, IN_DEVELOPMENT: 6, PLANNING: 3, IDEA: 2, CANCELLED: 4, NEEDS_VERIFICATION: 4 }[classification.stage];
    const confidence = Math.max(
      5,
      Math.min(
        97,
        Math.round(Math.min(40, nameStrength * 0.6) + devStrength + stageStrength + classification.strength * 4 + Math.min(10, (docs.length - 1) * 3)),
      ),
    );

    const times = docs.flatMap((d) => [d.doc.createdAt, d.doc.updatedAt, ...d.doc.messages.map((m) => m.createdAt)]).filter((t): t is Date => t instanceof Date);
    const reasons = [
      `Detected as “${STAGE_LABEL[classification.stage]}”`,
      ...classification.reasons,
      `Mentioned in ${docs.length} source${docs.length === 1 ? "" : "s"}`,
      ...(group.chromeIds.size ? [`Chrome Web Store id ${[...group.chromeIds][0]}`] : []),
      ...(allUrls.deployment.length ? [`Deployment URL${allUrls.deployment.length > 1 ? "s" : ""}: ${allUrls.deployment.slice(0, 3).map(hostOf).join(", ")}`] : []),
    ];

    drafts.push({
      kind: "PRODUCT",
      fingerprint: group.key,
      title,
      summary: description ? truncateText(description, 320) : null,
      productStage: classification.stage,
      confidence,
      verification: classification.verification,
      data: {
        names: [...group.names.values()].sort((a, b) => b.weight - a.weight).slice(0, 8),
        chromeStoreIds: [...group.chromeIds],
        urls: allUrls,
        platforms,
        description,
        sourceCount: docs.length,
      },
      signals: reasons,
      firstSeenAt: times.length ? new Date(Math.min(...times.map((t) => t.getTime()))) : null,
      lastSeenAt: times.length ? new Date(Math.max(...times.map((t) => t.getTime()))) : null,
      evidence: docs.map((d) => evidenceFor(d, title)),
    });
  }
  return drafts.sort((a, b) => b.confidence - a.confidence);
}
