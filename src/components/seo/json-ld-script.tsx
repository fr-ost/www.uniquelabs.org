import { serializeJsonLd } from "@/lib/seo/json-ld";

/** Structured data. JSON-LD blocks are data, not executed scripts, so they need no CSP nonce. */
export function JsonLdScript({ data }: { data: Record<string, unknown> | Array<Record<string, unknown>> }) {
  return (
    <script
      type="application/ld+json"
      // Escaped by serializeJsonLd (no "<", ">" or "&" can break out of the element).
      dangerouslySetInnerHTML={{ __html: serializeJsonLd(data) }}
    />
  );
}
