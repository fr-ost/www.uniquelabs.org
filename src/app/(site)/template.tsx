import type { ReactNode } from "react";

/**
 * Page transition. A template re-mounts on every navigation, so each page
 * fades and rises into place. The animation leaves no transform behind when
 * it ends (see --animate-page-in), so fixed and sticky elements are unaffected.
 */
export default function SiteTemplate({ children }: { children: ReactNode }) {
  return <div className="animate-page-in">{children}</div>;
}
