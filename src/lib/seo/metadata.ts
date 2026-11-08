import type { Metadata } from "next";
import { siteUrl } from "@/lib/env";

export interface PageSeoInput {
  title?: string;
  /** When true the title is used verbatim (no "— Unique Labs" template). */
  absoluteTitle?: boolean;
  description: string;
  path: string;
  /** Path of an OG image route or media URL (absolute or root-relative). */
  image?: string | null;
  imageAlt?: string;
  type?: "website" | "article" | "profile";
  noIndex?: boolean;
}

/** Page-specific metadata with canonical URL, Open Graph and X/Twitter cards. */
export function pageMetadata(input: PageSeoInput): Metadata {
  const canonical = input.path === "/" ? "/" : input.path.replace(/\/+$/, "");
  const image = input.image ?? `/og${canonical === "/" ? "/home" : canonical}`;
  const title = input.title
    ? input.absoluteTitle
      ? { absolute: input.title }
      : input.title
    : undefined;
  return {
    ...(title ? { title } : {}),
    description: input.description,
    alternates: { canonical },
    openGraph: {
      type: input.type ?? "website",
      url: canonical,
      ...(input.title ? { title: input.title } : {}),
      description: input.description,
      images: [{ url: image, width: 1200, height: 630, alt: input.imageAlt ?? input.title ?? "Unique Labs" }],
    },
    twitter: {
      card: "summary_large_image",
      ...(input.title ? { title: input.title } : {}),
      description: input.description,
      images: [image],
    },
    ...(input.noIndex ? { robots: { index: false, follow: true } } : {}),
  };
}

export function absoluteUrl(path: string): string {
  if (/^https?:\/\//.test(path)) return path;
  return `${siteUrl()}${path.startsWith("/") ? "" : "/"}${path}`;
}

export function clampDescription(text: string, max = 158): string {
  const clean = text.replace(/\s+/g, " ").trim();
  if (clean.length <= max) return clean;
  const cut = clean.slice(0, max - 1);
  const lastSpace = cut.lastIndexOf(" ");
  return `${cut.slice(0, lastSpace > 80 ? lastSpace : cut.length).trimEnd()}…`;
}
