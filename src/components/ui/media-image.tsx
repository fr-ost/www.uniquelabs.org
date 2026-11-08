import Image from "next/image";
import type { MediaDTO } from "@/lib/content/types";
import { cn } from "@/lib/utils";

/**
 * next/image wrapper for media-library assets. Raster images are optimised
 * (AVIF/WebP, responsive sizes, lazy-loaded); SVGs are served as-is.
 * Intrinsic dimensions are always provided to prevent layout shift.
 */
export function MediaImage({
  media,
  className,
  sizes,
  priority = false,
  fill = false,
  quality,
  alt,
}: {
  media: MediaDTO;
  className?: string;
  sizes?: string;
  priority?: boolean;
  fill?: boolean;
  quality?: 60 | 75 | 85;
  alt?: string;
}) {
  const isSvg = media.mimeType === "image/svg+xml";
  const altText = alt ?? media.alt;
  const common = {
    src: media.url,
    className: cn(fill ? "object-cover" : "h-auto", className),
    unoptimized: isSvg,
    priority,
    quality: quality ?? 75,
    sizes: sizes ?? (fill ? "100vw" : undefined),
  };
  if (fill) {
    return <Image {...common} alt={altText} fill />;
  }
  return <Image {...common} alt={altText} width={media.width ?? 1200} height={media.height ?? 800} />;
}
