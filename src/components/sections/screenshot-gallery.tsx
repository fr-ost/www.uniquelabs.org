"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import type { MediaDTO } from "@/lib/content/types";

interface Shot {
  id: string;
  caption: string | null;
  media: MediaDTO;
}

/** Scroll-snapping screenshot rail with an accessible lightbox (<dialog>). */
export function ScreenshotGallery({ shots, productName }: { shots: Shot[]; productName: string }) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [active, setActive] = useState<number | null>(null);

  const open = (index: number) => {
    setActive(index);
    dialogRef.current?.showModal();
  };
  const close = useCallback(() => {
    dialogRef.current?.close();
  }, []);
  const step = useCallback(
    (delta: number) => setActive((current) => (current === null ? 0 : (current + delta + shots.length) % shots.length)),
    [shots.length],
  );

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    const onClose = () => setActive(null);
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "ArrowRight") step(1);
      if (event.key === "ArrowLeft") step(-1);
    };
    dialog.addEventListener("close", onClose);
    dialog.addEventListener("keydown", onKey);
    return () => {
      dialog.removeEventListener("close", onClose);
      dialog.removeEventListener("keydown", onKey);
    };
  }, [step]);

  const current = active === null ? null : shots[active];

  return (
    <>
      <ul className="-mx-[var(--gutter)] flex snap-x snap-mandatory scroll-px-[var(--gutter)] gap-4 overflow-x-auto px-[var(--gutter)] pb-4 [scrollbar-width:thin] md:gap-6">
        {shots.map((shot, index) => (
          <li key={shot.id} className="w-[85%] shrink-0 snap-start sm:w-[70%] lg:w-[58%]">
            <figure>
              <button
                type="button"
                onClick={() => open(index)}
                className="group relative block w-full overflow-hidden rounded-2xl border border-white/10 bg-ink-800 text-left"
                aria-label={`Enlarge screenshot ${index + 1}${shot.caption ? `: ${shot.caption}` : ""}`}
              >
                <Image
                  src={shot.media.url}
                  alt={shot.media.alt || `${productName} screenshot ${index + 1}`}
                  width={shot.media.width ?? 1600}
                  height={shot.media.height ?? 1000}
                  sizes="(min-width: 1024px) 58vw, 85vw"
                  unoptimized={shot.media.mimeType === "image/svg+xml"}
                  className="h-auto w-full transition-transform duration-700 ease-[var(--ease-out-expo)] group-hover:scale-[1.015]"
                />
              </button>
              {shot.caption ? (
                <figcaption className="mt-3 flex items-center gap-3 text-sm text-ink-400">
                  <span className="font-mono text-xs text-ink-600">{String(index + 1).padStart(2, "0")}</span>
                  {shot.caption}
                </figcaption>
              ) : null}
            </figure>
          </li>
        ))}
      </ul>

      <dialog
        ref={dialogRef}
        className="m-auto max-h-[92vh] w-[min(92vw,1400px)] overflow-visible bg-transparent p-0 backdrop:bg-ink-950/95"
        aria-label={`${productName} screenshots`}
        onClick={(event) => {
          if (event.target === dialogRef.current) close();
        }}
      >
        {current ? (
          <figure className="relative">
            <Image
              src={current.media.url}
              alt={current.media.alt || `${productName} screenshot`}
              width={current.media.width ?? 1600}
              height={current.media.height ?? 1000}
              sizes="92vw"
              unoptimized={current.media.mimeType === "image/svg+xml"}
              className="mx-auto h-auto max-h-[82vh] w-auto rounded-xl border border-white/10"
            />
            <figcaption className="mt-4 flex items-center justify-between gap-4 text-sm text-ink-300">
              <span>{current.caption ?? `${productName} — screenshot ${(active ?? 0) + 1}`}</span>
              <span className="font-mono text-xs text-ink-500">
                {(active ?? 0) + 1} / {shots.length}
              </span>
            </figcaption>
            <div className="absolute -top-14 right-0 flex gap-2">
              {shots.length > 1 ? (
                <>
                  <button type="button" onClick={() => step(-1)} className="flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-ink-900 text-ink-100 hover:bg-ink-800" aria-label="Previous screenshot">
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <button type="button" onClick={() => step(1)} className="flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-ink-900 text-ink-100 hover:bg-ink-800" aria-label="Next screenshot">
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </>
              ) : null}
              <button type="button" onClick={close} className="flex h-10 w-10 items-center justify-center rounded-full bg-ink-50 text-ink-950 hover:bg-white" aria-label="Close">
                <X className="h-4 w-4" />
              </button>
            </div>
          </figure>
        ) : null}
      </dialog>
    </>
  );
}
