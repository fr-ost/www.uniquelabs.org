import { headers } from "next/headers";
import { serializeJsonLd } from "@/lib/seo/json-ld";

export async function JsonLdScript({ data }: { data: Record<string, unknown> | Array<Record<string, unknown>> }) {
  const nonce = (await headers()).get("x-nonce") ?? undefined;
  return (
    <script
      type="application/ld+json"
      nonce={nonce}
      // Escaped by serializeJsonLd (no "<", ">" or "&" can break out of the element).
      dangerouslySetInnerHTML={{ __html: serializeJsonLd(data) }}
    />
  );
}
