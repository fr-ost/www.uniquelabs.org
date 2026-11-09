import { Globe } from "lucide-react";
import type { SocialPlatform } from "@/lib/content/enums";

/** Minimal monochrome brand glyphs for social links. */
export function SocialIcon({ platform, className }: { platform: SocialPlatform | "WEBSITE"; className?: string }) {
  switch (platform) {
    case "X":
      return (
        <svg viewBox="0 0 24 24" aria-hidden className={className} fill="currentColor">
          <path d="M17.75 3h3.07l-6.71 7.67L22 21h-6.18l-4.84-6.33L5.44 21H2.37l7.18-8.2L2 3h6.34l4.37 5.78L17.75 3Zm-1.08 16.18h1.7L7.4 4.73H5.58l11.09 14.45Z" />
        </svg>
      );
    case "LINKEDIN":
      return (
        <svg viewBox="0 0 24 24" aria-hidden className={className} fill="currentColor">
          <path d="M4.98 3.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5ZM3 9.75h4v11H3v-11Zm6.5 0h3.83v1.5h.06c.53-.95 1.84-1.95 3.79-1.95 4.05 0 4.8 2.53 4.8 5.82v5.63h-4v-4.99c0-1.19-.02-2.72-1.66-2.72-1.66 0-1.92 1.3-1.92 2.63v5.08h-4v-11Z" />
        </svg>
      );
    case "GITHUB":
      return (
        <svg viewBox="0 0 24 24" aria-hidden className={className} fill="currentColor">
          <path d="M12 2C6.48 2 2 6.58 2 12.23c0 4.52 2.87 8.35 6.84 9.71.5.09.68-.22.68-.49l-.01-1.9c-2.78.62-3.37-1.21-3.37-1.21-.45-1.18-1.11-1.49-1.11-1.49-.91-.64.07-.62.07-.62 1 .07 1.53 1.06 1.53 1.06.89 1.57 2.34 1.12 2.91.85.09-.66.35-1.12.63-1.38-2.22-.26-4.56-1.14-4.56-5.07 0-1.12.39-2.04 1.03-2.76-.1-.26-.45-1.3.1-2.71 0 0 .84-.28 2.75 1.05a9.3 9.3 0 0 1 5 0c1.91-1.33 2.75-1.05 2.75-1.05.55 1.41.2 2.45.1 2.71.64.72 1.03 1.64 1.03 2.76 0 3.94-2.34 4.81-4.57 5.06.36.32.68.94.68 1.9l-.01 2.82c0 .27.18.59.69.49A10.1 10.1 0 0 0 22 12.23C22 6.58 17.52 2 12 2Z" />
        </svg>
      );
    case "TELEGRAM":
      return (
        <svg viewBox="0 0 24 24" aria-hidden className={className} fill="currentColor">
          <path d="M21.94 4.3 18.7 19.6c-.24 1.08-.88 1.35-1.79.84l-4.94-3.64-2.38 2.29c-.26.26-.48.48-.99.48l.35-5.02 9.14-8.26c.4-.35-.09-.55-.62-.2L6.17 13.2l-4.87-1.52c-1.06-.33-1.08-1.06.22-1.57L20.55 2.8c.88-.32 1.65.21 1.39 1.5Z" />
        </svg>
      );
    default:
      return <Globe aria-hidden className={className} strokeWidth={1.6} />;
  }
}
