import Link from "next/link";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { PointerGlow } from "@/components/motion/pointer-glow";
import { StageBadge } from "@/components/ui/badges";
import { MediaImage } from "@/components/ui/media-image";
import type { MediaDTO, ProductCardDTO } from "@/lib/content/types";
import { PLATFORM_LABELS } from "@/lib/labels";
import { cn, displayHost } from "@/lib/utils";

export function ProductLogo({
  logo,
  name,
  accent,
  size = "md",
  className,
}: {
  logo: MediaDTO | null;
  name: string;
  accent?: string | null;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}) {
  const dims = {
    sm: "h-10 w-10 rounded-xl text-base",
    md: "h-14 w-14 rounded-2xl text-xl",
    lg: "h-20 w-20 rounded-[1.4rem] text-3xl",
    xl: "h-24 w-24 rounded-[1.75rem] text-4xl md:h-28 md:w-28",
  }[size];
  const pixel = { sm: 40, md: 56, lg: 80, xl: 112 }[size];
  return (
    <div
      className={cn(
        "relative flex shrink-0 items-center justify-center overflow-hidden border border-white/10 bg-ink-800",
        dims,
        className,
      )}
      style={
        !logo
          ? {
              background: `radial-gradient(120% 120% at 20% 10%, ${accent ?? "#ff6b35"}55, transparent 60%), #18181d`,
            }
          : undefined
      }
    >
      {logo ? (
        <MediaImage
          media={logo}
          alt={`${name} logo`}
          sizes={`${pixel}px`}
          className="h-full w-full object-contain p-[14%]"
        />
      ) : (
        <span aria-hidden className="font-display font-semibold tracking-[-0.04em] text-ink-50">
          {name.trim().charAt(0).toUpperCase()}
        </span>
      )}
    </div>
  );
}

export function ProductCard({
  product,
  variant = "default",
  priority = false,
}: {
  product: ProductCardDTO;
  variant?: "default" | "feature";
  priority?: boolean;
}) {
  const platforms = product.platforms.slice(0, 2).map((p) => PLATFORM_LABELS[p]);
  const feature = variant === "feature";
  return (
    <PointerGlow
      as="article"
      accent={product.accentColor}
      className={cn(
        "surface-card group relative flex h-full flex-col overflow-hidden transition-[border-color,transform] duration-500 ease-[var(--ease-out-expo)] hover:border-white/20",
        feature ? "p-7 md:p-9" : "p-6 md:p-7",
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <ProductLogo logo={product.logo} name={product.name} accent={product.accentColor} size={feature ? "lg" : "md"} />
        <div className="flex flex-col items-end gap-2">
          <StageBadge stage={product.stage} />
        </div>
      </div>

      {feature && product.cover ? (
        <div
          className="relative mt-8 overflow-hidden rounded-xl border border-white/10 bg-ink-800"
          // Use the cover's own proportions (e.g. a 1400×560 store banner) so nothing is cropped.
          style={{ aspectRatio: product.cover.width && product.cover.height ? `${product.cover.width} / ${product.cover.height}` : "16 / 9" }}
        >
          <MediaImage
            media={product.cover}
            fill
            priority={priority}
            sizes="(min-width: 1024px) 50vw, 100vw"
            className="transition-transform duration-700 ease-[var(--ease-out-expo)] group-hover:scale-[1.025]"
          />
        </div>
      ) : null}

      <div className={feature ? "mt-8" : "mt-7"}>
        <h3
          className={cn(
            "font-display font-medium tracking-[-0.035em] text-ink-50",
            feature ? "text-3xl md:text-4xl" : "text-2xl",
          )}
        >
          {product.name}
        </h3>
        {product.tagline ? <p className="mt-2 text-ink-200">{product.tagline}</p> : null}
        <p className={cn("mt-3 text-ink-300", feature ? "text-lede max-w-xl" : "line-clamp-3 text-[0.9375rem]")}>
          {product.summary}
        </p>
      </div>

      <div className="mt-auto pt-8">
        <div className="flex items-center justify-between gap-4 border-t border-white/[0.07] pt-5">
          <p className="text-eyebrow min-w-0 truncate text-ink-400">
            {[product.category?.name, ...platforms].filter(Boolean).join(" · ") || "Product"}
          </p>
          <span
            aria-hidden
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/12 text-ink-100 transition-all duration-500 ease-[var(--ease-out-expo)] group-hover:border-signal-500 group-hover:bg-signal-500 group-hover:text-ink-950"
          >
            <ArrowRight className="h-4 w-4 transition-transform duration-500 group-hover:-rotate-45" />
          </span>
        </div>
      </div>

      {/* Full-card link to the product page */}
      <Link href={`/products/${product.slug}`} className="absolute inset-0 z-0 rounded-[inherit]">
        <span className="sr-only">Learn more about {product.name}</span>
      </Link>

      {product.websiteUrl ? (
        <a
          href={product.websiteUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="relative z-10 mt-4 inline-flex w-fit items-center gap-1.5 text-xs text-ink-300 transition-colors hover:text-ink-50"
        >
          {displayHost(product.websiteUrl)}
          <ArrowUpRight aria-hidden className="h-3.5 w-3.5" />
          <span className="sr-only"> — visit the {product.name} website (opens in a new tab)</span>
        </a>
      ) : null}
    </PointerGlow>
  );
}
