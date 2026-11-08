import ReactMarkdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";
import { cn } from "@/lib/utils";

/**
 * Safe Markdown rendering for owner-authored content (server-side only).
 * Raw HTML is never rendered (react-markdown escapes it by default) and URLs
 * are restricted to http(s), mailto and same-site paths.
 */

function safeUrl(url: string): string {
  const trimmed = url.trim();
  if (trimmed.startsWith("/") && !trimmed.startsWith("//")) return trimmed;
  if (trimmed.startsWith("#")) return trimmed;
  try {
    const parsed = new URL(trimmed);
    if (["http:", "https:", "mailto:"].includes(parsed.protocol)) return parsed.toString();
  } catch {
    // fall through
  }
  return "";
}

const components: Components = {
  a({ href, children, node: _node, ...rest }) {
    const url = safeUrl(href ?? "");
    if (!url) return <span>{children}</span>;
    const external = /^https?:\/\//.test(url);
    return (
      <a
        href={url}
        {...(external ? { target: "_blank", rel: "noopener noreferrer nofollow" } : {})}
        {...rest}
      >
        {children}
      </a>
    );
  },
  img() {
    // Images inside Markdown are not supported; use the media fields instead.
    return null;
  },
  h1({ children }) {
    return <h2>{children}</h2>;
  },
};

export function Markdown({
  source,
  className,
  tokens,
}: {
  source: string | null | undefined;
  className?: string;
  /** Replaces {{token}} placeholders, e.g. {{company}}. */
  tokens?: Record<string, string>;
}) {
  if (!source) return null;
  const text = tokens
    ? source.replace(/\{\{\s*(\w+)\s*\}\}/g, (match, key: string) => tokens[key] ?? match)
    : source;
  return (
    <div className={cn("prose-ul", className)}>
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={components} urlTransform={safeUrl} skipHtml>
        {text}
      </ReactMarkdown>
    </div>
  );
}

/** Splits plain text into paragraphs (for short multi-line fields). */
export function Paragraphs({ text, className }: { text: string | null | undefined; className?: string }) {
  if (!text) return null;
  return (
    <div className={cn("space-y-4", className)}>
      {text
        .split(/\n{2,}/)
        .map((p) => p.trim())
        .filter(Boolean)
        .map((p, i) => (
          <p key={i}>{p}</p>
        ))}
    </div>
  );
}
