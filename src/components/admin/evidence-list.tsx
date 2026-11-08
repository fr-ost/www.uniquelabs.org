import { ExternalLink } from "lucide-react";
import type { SourceEvidence } from "@/generated/prisma/client";
import { formatDateTime } from "@/lib/utils";

const SOURCE_LABELS: Record<SourceEvidence["sourceType"], string> = {
  CLAUDE_CONVERSATION: "Claude conversation",
  CLAUDE_PROJECT: "Claude project",
  CLAUDE_MEMORY: "Claude memory",
  TWEET: "Tweet",
  URL: "URL",
  MANUAL: "Manual note",
};

/**
 * Private provenance list for admins: where an imported record came from.
 * Excerpts are rendered as plain text (React escapes them).
 */
export function EvidenceList({ evidence, limit }: { evidence: SourceEvidence[]; limit?: number }) {
  const items = limit ? evidence.slice(0, limit) : evidence;
  return (
    <ol className="space-y-3">
      {items.map((item) => {
        const details = (item.details ?? {}) as { urls?: string[]; matched?: string[] };
        return (
          <li key={item.id} className="rounded-xl border border-white/[0.08] bg-ink-950/50 p-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-xs font-medium text-ink-200">{SOURCE_LABELS[item.sourceType]}</p>
              {item.sourceTimestamp ? <p className="text-[0.6875rem] text-ink-500">{formatDateTime(item.sourceTimestamp)}</p> : null}
            </div>
            {item.sourceTitle ? <p className="mt-1 text-sm text-ink-100">{item.sourceTitle}</p> : null}
            <p className="mt-1 break-all font-mono text-[0.6875rem] text-ink-500">ID: {item.sourceId}</p>
            {item.excerpt ? (
              <blockquote className="mt-2 max-h-40 overflow-y-auto whitespace-pre-wrap border-l-2 border-signal-500/50 pl-3 text-xs leading-relaxed text-ink-300">
                {item.excerpt}
              </blockquote>
            ) : null}
            {details.matched && details.matched.length > 0 ? (
              <p className="mt-2 text-[0.6875rem] text-ink-500">Signals: {details.matched.slice(0, 6).join(" · ")}</p>
            ) : null}
            {details.urls && details.urls.length > 0 ? (
              <ul className="mt-2 space-y-1">
                {details.urls.slice(0, 5).map((url) => (
                  <li key={url} className="truncate text-[0.6875rem] text-ink-400">
                    {url}
                  </li>
                ))}
              </ul>
            ) : null}
            {item.sourceUrl ? (
              <a href={item.sourceUrl} target="_blank" rel="noopener noreferrer nofollow" className="mt-2 inline-flex items-center gap-1 text-xs text-signal-400 hover:underline">
                Open original <ExternalLink aria-hidden className="h-3 w-3" />
              </a>
            ) : null}
          </li>
        );
      })}
      {limit && evidence.length > limit ? <li className="text-xs text-ink-500">+ {evidence.length - limit} more</li> : null}
    </ol>
  );
}
