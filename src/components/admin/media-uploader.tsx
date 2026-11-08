"use client";

import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { LoaderCircle, Upload } from "lucide-react";
import { uploadMedia } from "@/components/admin/media-field";
import { adminButtonClasses } from "@/components/admin/ui";

/** Drag-and-drop / multi-file uploader for the media library page. */
export function MediaUploader({ maxMb }: { maxMb: number }) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [errors, setErrors] = useState<string[]>([]);
  const [dragging, setDragging] = useState(false);

  const upload = async (files: FileList | File[]) => {
    const list = Array.from(files);
    if (!list.length) return;
    setErrors([]);
    for (const [index, file] of list.entries()) {
      setStatus(`Uploading ${index + 1} of ${list.length}: ${file.name}`);
      try {
        await uploadMedia(file, (fraction) => setStatus(`Uploading ${index + 1} of ${list.length}: ${file.name} (${Math.round(fraction * 100)}%)`));
      } catch (error) {
        setErrors((current) => [...current, `${file.name}: ${error instanceof Error ? error.message : "failed"}`]);
      }
    }
    setStatus(null);
    if (inputRef.current) inputRef.current.value = "";
    router.refresh();
  };

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDragging(false);
        void upload(e.dataTransfer.files);
      }}
      className={`rounded-2xl border border-dashed p-6 text-center transition-colors ${dragging ? "border-signal-500 bg-signal-500/5" : "border-white/15"}`}
    >
      <p className="text-sm text-ink-200">Drop images here, or</p>
      <button type="button" onClick={() => inputRef.current?.click()} disabled={status !== null} className={`${adminButtonClasses("primary")} mt-3`}>
        {status ? <LoaderCircle aria-hidden className="h-4 w-4 animate-spin" /> : <Upload aria-hidden className="h-4 w-4" />}
        Choose files
      </button>
      <p className="mt-3 text-xs text-ink-500">JPEG, PNG, WebP, AVIF, GIF or SVG · up to {maxMb} MB each · metadata is stripped automatically</p>
      {status ? <p className="mt-3 text-xs text-ink-300" aria-live="polite">{status}</p> : null}
      {errors.length ? (
        <ul className="mt-3 space-y-1 text-left text-xs text-danger" role="alert">
          {errors.map((error) => (
            <li key={error}>{error}</li>
          ))}
        </ul>
      ) : null}
      <input ref={inputRef} type="file" multiple accept="image/png,image/jpeg,image/webp,image/avif,image/gif,image/svg+xml" className="hidden" onChange={(e) => e.target.files && void upload(e.target.files)} />
    </div>
  );
}
