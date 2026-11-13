import type { ReactNode } from "react";

/**
 * Page transition. A template re-mounts on every navigation, so each page
 * fades in. Opacity only and short: nothing is laid out or repainted for it.
 */
export default function SiteTemplate({ children }: { children: ReactNode }) {
  return <div className="animate-page-in">{children}</div>;
}
