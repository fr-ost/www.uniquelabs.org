import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { JsonLdScript } from "@/components/seo/json-ld-script";
import { breadcrumbJsonLd } from "@/lib/seo/json-ld";

export function Breadcrumbs({ items }: { items: Array<{ name: string; path: string }> }) {
  const all = [{ name: "Home", path: "/" }, ...items];
  return (
    <>
      <nav aria-label="Breadcrumb" className="text-sm">
        <ol className="flex flex-wrap items-center gap-1.5 text-ink-400">
          {all.map((item, index) => {
            const last = index === all.length - 1;
            return (
              <li key={item.path} className="flex items-center gap-1.5">
                {last ? (
                  <span aria-current="page" className="max-w-[22ch] truncate text-ink-200">
                    {item.name}
                  </span>
                ) : (
                  <Link href={item.path} className="transition-colors hover:text-ink-50">
                    {item.name}
                  </Link>
                )}
                {!last ? <ChevronRight aria-hidden className="h-3.5 w-3.5 text-ink-600" /> : null}
              </li>
            );
          })}
        </ol>
      </nav>
      <JsonLdScript data={breadcrumbJsonLd(all)} />
    </>
  );
}
