import { cn } from "@/lib/utils";

/**
 * Slow-moving aurora glow built from radial gradients (no blur filters, so it
 * stays cheap on phones). Purely decorative; frozen for reduced motion by the
 * global motion rules.
 */
export function Aurora({ className, tone = "brand" }: { className?: string; tone?: "brand" | "cool" }) {
  const [a, b, c] =
    tone === "brand"
      ? ["rgba(255,107,53,0.30)", "rgba(139,92,246,0.24)", "rgba(255,181,71,0.16)"]
      : ["rgba(96,165,250,0.22)", "rgba(139,92,246,0.24)", "rgba(52,211,153,0.12)"];
  return (
    <div aria-hidden className={cn("pointer-events-none absolute inset-0 overflow-hidden", className)}>
      <div
        className="absolute -top-[30%] -left-[15%] h-[70vmax] w-[70vmax] animate-aurora rounded-full"
        style={{ background: `radial-gradient(circle at center, ${a}, transparent 62%)` }}
      />
      <div
        className="absolute -top-[10%] -right-[25%] h-[62vmax] w-[62vmax] animate-aurora rounded-full [animation-delay:-7s]"
        style={{ background: `radial-gradient(circle at center, ${b}, transparent 60%)` }}
      />
      <div
        className="absolute -bottom-[45%] left-[15%] h-[60vmax] w-[60vmax] animate-aurora rounded-full [animation-delay:-14s]"
        style={{ background: `radial-gradient(circle at center, ${c}, transparent 60%)` }}
      />
      <div className="absolute inset-0 bg-[linear-gradient(to_bottom,transparent_55%,var(--color-ink-950))]" />
    </div>
  );
}
