import Link from "next/link";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { PointerGlow } from "@/components/motion/pointer-glow";
import { StageBadge } from "@/components/ui/badges";
import { MediaImage } from "@/components/ui/media-image";
import type { MediaDTO, ProductCardDTO } from "@/lib/content/types";
import { PLATFORM_LABELS } from "@/lib/labels";
import { cn } from "@/lib/utils";

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

/** External "Product Page" button: opens the product's own website. */
export function ProductPageLink({
  href,
  name,
  className,
  tabIndex,
}: {
  href: string;
  name: string;
  className?: string;
  tabIndex?: number;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      tabIndex={tabIndex}
      className={cn(
        "group/pp relative z-10 inline-flex h-10 shrink-0 items-center gap-2 rounded-full border border-white/14 bg-white/[0.05] px-4 text-sm font-medium text-ink-50 backdrop-blur-sm transition-[background-color,border-color,color,transform] duration-300 ease-[var(--ease-out-expo)] hover:border-signal-500 hover:bg-signal-500 hover:text-ink-950 active:scale-[0.97]",
        className,
      )}
    >
      Product Page
      <ArrowUpRight
        aria-hidden
        className="h-4 w-4 transition-transform duration-300 ease-[var(--ease-out-expo)] group-hover/pp:-translate-y-0.5 group-hover/pp:translate-x-0.5"
      />
      <span className="sr-only"> for {name} (opens in a new tab)</span>
    </a>
  );
}

/**
 * Product card: store banner on top, then logo, name, one-line pitch and two
 * actions — the whole card opens the product's page on this site, and the
 * "Product Page" button opens the product's own website.
 */
export function ProductCard({
  product,
  variant = "default",
  priority = false,
}: {
  product: ProductCardDTO;
  /** `feature` is a larger stacked card; `wide` puts the banner beside the text on large screens. */
  variant?: "default" | "feature" | "wide";
  priority?: boolean;
}) {
  const platforms = product.platforms.slice(0, 2).map((p) => PLATFORM_LABELS[p]);
  const feature = variant !== "default";
  const wide = variant === "wide";
  const accent = product.accentColor ?? "#ff6b35";
  const cover = product.cover;
  return (
    <PointerGlow
      as="article"
      accent={product.accentColor}
      className={cn("surface-card lift group relative flex h-full flex-col overflow-hidden hover:border-white/20", wide && "lg:flex-row")}
    >
      {/* Banner. In the wide layout it sits in a tinted frame at its own proportions, so it is never cropped. */}
      <div
        className={cn(
          "relative shrink-0 border-b border-white/[0.07]",
          wide ? "lg:flex lg:w-[60%] lg:items-center lg:border-r lg:border-b-0 lg:p-6" : "",
        )}
        style={wide ? { background: `radial-gradient(90% 120% at 0% 0%, ${accent}2e, transparent 62%)` } : undefined}
      >
        <div
          className={cn("relative w-full overflow-hidden bg-ink-800", wide && "lg:rounded-2xl lg:border lg:border-white/10 lg:shadow-[0_30px_80px_-40px_rgba(0,0,0,0.9)]")}
          // Keep the banner's own proportions (store banners are 1400×560).
          style={{ aspectRatio: cover?.width && cover?.height ? `${cover.width} / ${cover.height}` : "5 / 2" }}
        >
          {cover ? (
            <MediaImage
              media={cover}
              fill
              priority={priority}
              sizes={feature ? "(min-width: 1024px) 58vw, 100vw" : "(min-width: 1024px) 34vw, (min-width: 640px) 50vw, 100vw"}
              className="transition-transform duration-[1100ms] ease-[var(--ease-out-expo)] group-hover:scale-[1.045]"
            />
          ) : (
            <div className="absolute inset-0" style={{ background: `radial-gradient(120% 120% at 15% 10%, ${accent}55, transparent 60%), #121216` }}>
              <div aria-hidden className="grid-lines mask-fade-radial absolute inset-0 opacity-50" />
            </div>
          )}
        </div>
      </div>

      <div className={cn("flex flex-1 flex-col", feature ? "p-7 md:p-9" : "p-6", wide && "lg:justify-center lg:p-10")}>
        {/* On narrow screens a large title needs the full row, so the badge sits above it. */}
        {feature ? <StageBadge stage={product.stage} className="mb-5 self-start sm:hidden" /> : null}
        <div className="flex items-center gap-4">
          <ProductLogo logo={product.logo} name={product.name} accent={product.accentColor} size={feature ? "md" : "sm"} />
          <div className="min-w-0">
            <h3
              className={cn(
                "truncate font-display font-medium tracking-[-0.035em] text-ink-50",
                feature ? "text-[1.75rem] leading-tight sm:text-3xl md:text-4xl" : "text-xl",
              )}
            >
              {product.name}
            </h3>
            <p className="text-eyebrow mt-2 truncate text-ink-400">
              {[product.category?.name, ...platforms].filter(Boolean).join(" · ") || "Product"}
            </p>
          </div>
          <StageBadge stage={product.stage} className={cn("ml-auto shrink-0 self-start", feature && "hidden sm:inline-flex")} />
        </div>
        {product.tagline ? <p className={cn("text-ink-100", feature ? "mt-7 text-lg" : "mt-5")}>{product.tagline}</p> : null}
        <p className={cn("mt-2 text-ink-300", feature ? "text-lede max-w-xl" : "line-clamp-2 text-[0.9375rem]")}>{product.summary}</p>

        <div className={cn("flex items-center justify-between gap-3 pt-7", wide ? "mt-auto lg:mt-4" : "mt-auto")}>
          {product.websiteUrl ? <ProductPageLink href={product.websiteUrl} name={product.name} /> : <span />}
          <span aria-hidden className="inline-flex items-center gap-1.5 text-sm text-ink-300 transition-colors duration-300 group-hover:text-ink-50">
            Details
            <ArrowRight className="h-4 w-4 transition-transform duration-500 ease-[var(--ease-out-expo)] group-hover:translate-x-1" />
          </span>
        </div>
      </div>

      {/* Full-card link to this product's page on the site */}
      <Link href={`/products/${product.slug}`} className="absolute inset-0 z-0 rounded-[inherit]">
        <span className="sr-only">Learn more about {product.name}</span>
      </Link>
    </PointerGlow>
  );
}
