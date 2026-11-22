import type { MediaDTO } from "@/lib/content/types";
import { cn } from "@/lib/utils";

/**
 * A partner logo. These are tiny (128 px WebP) files, so they are served as
 * they are with a plain <img>: no responsive srcset is needed, which keeps the
 * HTML of pages with hundreds of logos (the Partnerships page) small.
 */
export function PartnerLogo({
  logo,
  alt,
  className,
  eager = false,
}: {
  logo: MediaDTO;
  alt: string;
  className?: string;
  /** Load straight away (above the fold). */
  eager?: boolean;
}) {
  return (
    // eslint-disable-next-line @next/next/no-img-element -- deliberate: see the comment above
    <img
      src={logo.url}
      alt={alt}
      width={logo.width ?? 128}
      height={logo.height ?? 128}
      loading={eager ? "eager" : "lazy"}
      decoding="async"
      className={cn("absolute inset-0 h-full w-full object-cover", className)}
    />
  );
}
