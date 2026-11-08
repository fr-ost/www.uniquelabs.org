"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowDown, ArrowUp, ImagePlus, Library, LoaderCircle, Search, Trash2, Upload, X } from "lucide-react";
import { adminButtonClasses } from "@/components/admin/ui";
import { inputClass, useFieldError } from "@/components/admin/form";
import { cn, formatBytes } from "@/lib/utils";

export interface PickedMedia {
  id: string;
  url: string;
  alt: string;
  mimeType: string;
  width?: number | null;
  height?: number | null;
  fileName?: string;
}

const ACCEPT = "image/png,image/jpeg,image/webp,image/avif,image/gif,image/svg+xml";

/** Uploads a file to the media library with progress (XHR exposes upload progress). */
export function uploadMedia(file: File, onProgress?: (fraction: number) => void): Promise<PickedMedia> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("PUT", `/api/admin/media?name=${encodeURIComponent(file.name)}`);
    xhr.setRequestHeader("Content-Type", file.type || "application/octet-stream");
    xhr.setRequestHeader("X-Requested-With", "uniquelabs-admin");
    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) onProgress?.(event.loaded / event.total);
    };
    xhr.onload = () => {
      try {
        const body = JSON.parse(xhr.responseText) as { asset?: PickedMedia; error?: string };
        if (xhr.status >= 200 && xhr.status < 300 && body.asset) resolve(body.asset);
        else reject(new Error(body.error ?? `Upload failed (${xhr.status}).`));
      } catch {
        reject(new Error(`Upload failed (${xhr.status}).`));
      }
    };
    xhr.onerror = () => reject(new Error("Network error during upload."));
    xhr.send(file);
  });
}

function MediaThumb({ media, className }: { media: PickedMedia; className?: string }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element -- admin thumbnails, served from our own /media route
    <img src={media.url} alt={media.alt || media.fileName || ""} className={cn("h-full w-full object-contain", className)} loading="lazy" />
  );
}

export function MediaLibraryDialog({
  open,
  onClose,
  onSelect,
  multiple = false,
}: {
  open: boolean;
  onClose: () => void;
  onSelect: (items: PickedMedia[]) => void;
  multiple?: boolean;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const [assets, setAssets] = useState<Array<PickedMedia & { size: number }>>([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<string[]>([]);

  const load = useCallback(async (q: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/admin/media?q=${encodeURIComponent(q)}`, { cache: "no-store" });
      const body = (await response.json()) as { assets?: Array<PickedMedia & { size: number }>; error?: string };
      if (!response.ok) throw new Error(body.error ?? "Could not load media.");
      setAssets(body.assets ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load media.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) {
      dialog.showModal();
      setSelected([]);
      void load("");
    }
    if (!open && dialog.open) dialog.close();
  }, [open, load]);

  const toggle = (id: string) => {
    setSelected((current) =>
      multiple ? (current.includes(id) ? current.filter((x) => x !== id) : [...current, id]) : [id],
    );
  };

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      className="m-auto h-[min(86vh,760px)] w-[min(94vw,980px)] overflow-hidden rounded-2xl border border-white/10 bg-ink-900 p-0 text-ink-100 backdrop:bg-black/70 backdrop:backdrop-blur-sm"
    >
      <div className="flex h-full flex-col">
        <div className="flex items-center gap-3 border-b border-white/[0.07] p-4">
          <Library aria-hidden className="h-4 w-4 text-ink-400" />
          <h2 className="text-sm font-semibold text-ink-50">Media library</h2>
          <div className="relative ml-auto w-full max-w-xs">
            <Search aria-hidden className="absolute top-1/2 left-3 h-3.5 w-3.5 -translate-y-1/2 text-ink-500" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => {
                // This dialog lives inside other forms: never let Enter submit them.
                if (e.key === "Enter") {
                  e.preventDefault();
                  void load(query);
                }
              }}
              placeholder="Search files… (Enter)"
              className={cn(inputClass, "pl-8")}
              aria-label="Search media"
            />
          </div>
          <button type="button" onClick={onClose} className={adminButtonClasses("ghost", "sm")} aria-label="Close">
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-4">
          {loading ? (
            <p className="flex items-center gap-2 text-sm text-ink-400">
              <LoaderCircle className="h-4 w-4 animate-spin" /> Loading…
            </p>
          ) : error ? (
            <p className="text-sm text-danger">{error}</p>
          ) : assets.length === 0 ? (
            <p className="text-sm text-ink-400">No media yet. Upload images from any image field, or from the Media Library page.</p>
          ) : (
            <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5">
              {assets.map((asset) => {
                const active = selected.includes(asset.id);
                return (
                  <li key={asset.id}>
                    <button
                      type="button"
                      onClick={() => toggle(asset.id)}
                      onDoubleClick={() => {
                        if (!multiple) {
                          onSelect([asset]);
                          onClose();
                        }
                      }}
                      aria-pressed={active}
                      className={cn(
                        "group block w-full overflow-hidden rounded-xl border text-left transition-colors",
                        active ? "border-signal-500 ring-2 ring-signal-500/30" : "border-white/10 hover:border-white/25",
                      )}
                    >
                      <div className="aspect-square bg-[repeating-conic-gradient(#1b1b21_0_25%,#141418_0_50%)] bg-[length:16px_16px] p-2">
                        <MediaThumb media={asset} />
                      </div>
                      <div className="border-t border-white/[0.06] px-2 py-1.5">
                        <p className="truncate text-xs text-ink-200">{asset.fileName}</p>
                        <p className="text-[0.625rem] text-ink-500">
                          {asset.width && asset.height ? `${asset.width}×${asset.height} · ` : ""}
                          {formatBytes(asset.size)}
                        </p>
                      </div>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
        <div className="flex items-center justify-between gap-3 border-t border-white/[0.07] p-4">
          <p className="text-xs text-ink-500">{multiple ? `${selected.length} selected` : "Double-click to choose quickly"}</p>
          <div className="flex gap-2">
            <button type="button" onClick={onClose} className={adminButtonClasses("ghost")}>
              Cancel
            </button>
            <button
              type="button"
              disabled={selected.length === 0}
              onClick={() => {
                onSelect(assets.filter((a) => selected.includes(a.id)));
                onClose();
              }}
              className={adminButtonClasses("primary")}
            >
              Use {multiple && selected.length > 1 ? `${selected.length} images` : "image"}
            </button>
          </div>
        </div>
      </div>
    </dialog>
  );
}

/** Single image field (logo, cover, photo…) bound to a hidden input. */
export function MediaField({
  name,
  label,
  defaultMedia,
  hint,
  aspect = "square",
}: {
  name: string;
  label: string;
  defaultMedia?: PickedMedia | null;
  hint?: string;
  aspect?: "square" | "wide" | "portrait";
}) {
  const [media, setMedia] = useState<PickedMedia | null>(defaultMedia ?? null);
  const [libraryOpen, setLibraryOpen] = useState(false);
  const [progress, setProgress] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const fieldError = useFieldError(name);

  const onFile = async (file: File | undefined) => {
    if (!file) return;
    setError(null);
    setProgress(0);
    try {
      setMedia(await uploadMedia(file, setProgress));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed.");
    } finally {
      setProgress(null);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  return (
    <div>
      <p className="text-sm font-medium text-ink-200">{label}</p>
      <input type="hidden" name={name} value={media?.id ?? ""} />
      <div className="mt-1.5 flex flex-wrap items-start gap-4">
        <div
          className={cn(
            "flex items-center justify-center overflow-hidden rounded-xl border border-white/10 bg-[repeating-conic-gradient(#1b1b21_0_25%,#141418_0_50%)] bg-[length:16px_16px]",
            aspect === "square" && "h-24 w-24",
            aspect === "wide" && "h-24 w-40",
            aspect === "portrait" && "h-28 w-24",
          )}
        >
          {progress !== null ? (
            <span className="text-xs text-ink-300">{Math.round(progress * 100)}%</span>
          ) : media ? (
            <MediaThumb media={media} className={aspect === "square" ? "p-2" : "object-cover"} />
          ) : (
            <ImagePlus aria-hidden className="h-5 w-5 text-ink-600" />
          )}
        </div>
        <div className="flex flex-col gap-2">
          <div className="flex flex-wrap gap-2">
            <button type="button" className={adminButtonClasses("secondary", "sm")} onClick={() => fileRef.current?.click()} disabled={progress !== null}>
              <Upload aria-hidden className="h-3.5 w-3.5" /> Upload
            </button>
            <button type="button" className={adminButtonClasses("secondary", "sm")} onClick={() => setLibraryOpen(true)}>
              <Library aria-hidden className="h-3.5 w-3.5" /> Library
            </button>
            {media ? (
              <button type="button" className={adminButtonClasses("ghost", "sm")} onClick={() => setMedia(null)}>
                <X aria-hidden className="h-3.5 w-3.5" /> Remove
              </button>
            ) : null}
          </div>
          {media?.fileName ? <p className="max-w-56 truncate text-xs text-ink-500">{media.fileName}</p> : null}
          {error || fieldError ? <p className="text-xs text-danger">{error ?? fieldError}</p> : hint ? <p className="max-w-xs text-xs text-ink-500">{hint}</p> : null}
        </div>
      </div>
      <input ref={fileRef} type="file" accept={ACCEPT} className="hidden" onChange={(e) => void onFile(e.target.files?.[0])} />
      <MediaLibraryDialog open={libraryOpen} onClose={() => setLibraryOpen(false)} onSelect={(items) => items[0] && setMedia(items[0])} />
    </div>
  );
}

let shotSequence = 0;

interface ShotItem {
  key: string;
  media: PickedMedia;
  caption: string;
}

/** Ordered list of screenshots with captions, serialised to a hidden JSON input. */
export function MediaListField({
  name,
  label,
  defaultItems,
  hint,
}: {
  name: string;
  label: string;
  defaultItems: Array<{ media: PickedMedia; caption: string | null }>;
  hint?: string;
}) {
  const [items, setItems] = useState<ShotItem[]>(
    defaultItems.map((item, index) => ({ key: `${item.media.id}-${index}`, media: item.media, caption: item.caption ?? "" })),
  );
  const [libraryOpen, setLibraryOpen] = useState(false);
  const [uploading, setUploading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const fieldError = useFieldError(name);

  const add = (media: PickedMedia[]) =>
    setItems((current) => [...current, ...media.map((m) => ({ key: `${m.id}-${(shotSequence += 1)}`, media: m, caption: "" }))]);

  const move = (index: number, delta: number) =>
    setItems((current) => {
      const next = [...current];
      const target = index + delta;
      if (target < 0 || target >= next.length) return current;
      [next[index], next[target]] = [next[target]!, next[index]!];
      return next;
    });

  const onFiles = async (files: FileList | null) => {
    if (!files?.length) return;
    setError(null);
    for (const file of Array.from(files)) {
      setUploading(file.name);
      try {
        add([await uploadMedia(file)]);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Upload failed.");
      }
    }
    setUploading(null);
    if (fileRef.current) fileRef.current.value = "";
  };

  return (
    <div>
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-medium text-ink-200">{label}</p>
        <div className="flex gap-2">
          <button type="button" className={adminButtonClasses("secondary", "sm")} onClick={() => fileRef.current?.click()} disabled={uploading !== null}>
            {uploading ? <LoaderCircle aria-hidden className="h-3.5 w-3.5 animate-spin" /> : <Upload aria-hidden className="h-3.5 w-3.5" />}
            {uploading ? "Uploading…" : "Upload"}
          </button>
          <button type="button" className={adminButtonClasses("secondary", "sm")} onClick={() => setLibraryOpen(true)}>
            <Library aria-hidden className="h-3.5 w-3.5" /> Library
          </button>
        </div>
      </div>
      <input
        type="hidden"
        name={name}
        value={JSON.stringify(items.map((item) => ({ mediaId: item.media.id, caption: item.caption })))}
      />
      {items.length === 0 ? (
        <p className="mt-3 rounded-xl border border-dashed border-white/12 px-4 py-6 text-center text-xs text-ink-500">No screenshots yet.</p>
      ) : (
        <ol className="mt-3 space-y-2">
          {items.map((item, index) => (
            <li key={item.key} className="flex items-center gap-3 rounded-xl border border-white/10 bg-ink-950/40 p-2">
              <div className="h-14 w-24 shrink-0 overflow-hidden rounded-lg bg-ink-800">
                <MediaThumb media={item.media} className="object-cover" />
              </div>
              <input
                value={item.caption}
                onChange={(event) => setItems((current) => current.map((c) => (c.key === item.key ? { ...c, caption: event.target.value } : c)))}
                placeholder="Caption (optional)"
                maxLength={160}
                aria-label={`Caption for screenshot ${index + 1}`}
                className={cn(inputClass, "flex-1")}
              />
              <div className="flex shrink-0 gap-1">
                <button type="button" onClick={() => move(index, -1)} disabled={index === 0} className={adminButtonClasses("ghost", "sm")} aria-label="Move up">
                  <ArrowUp className="h-3.5 w-3.5" />
                </button>
                <button type="button" onClick={() => move(index, 1)} disabled={index === items.length - 1} className={adminButtonClasses("ghost", "sm")} aria-label="Move down">
                  <ArrowDown className="h-3.5 w-3.5" />
                </button>
                <button type="button" onClick={() => setItems((current) => current.filter((c) => c.key !== item.key))} className={adminButtonClasses("ghost", "sm")} aria-label="Remove screenshot">
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </li>
          ))}
        </ol>
      )}
      {error || fieldError ? <p className="mt-2 text-xs text-danger">{error ?? fieldError}</p> : hint ? <p className="mt-2 text-xs text-ink-500">{hint}</p> : null}
      <input ref={fileRef} type="file" accept={ACCEPT} multiple className="hidden" onChange={(e) => void onFiles(e.target.files)} />
      <MediaLibraryDialog open={libraryOpen} multiple onClose={() => setLibraryOpen(false)} onSelect={add} />
    </div>
  );
}
