"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { FileArchive, LoaderCircle, Trash2, Upload, X } from "lucide-react";
import { adminButtonClasses } from "@/components/admin/ui";
import { cn, formatBytes } from "@/lib/utils";

const HEADERS = { "X-Requested-With": "uniquelabs-admin" };

function uploadFile(jobId: string, file: File, onProgress: (fraction: number) => void): Promise<void> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("PUT", `/api/admin/imports/${jobId}/files?name=${encodeURIComponent(file.name)}`);
    xhr.setRequestHeader("Content-Type", "application/octet-stream");
    xhr.setRequestHeader("X-Requested-With", "uniquelabs-admin");
    xhr.upload.onprogress = (event) => event.lengthComputable && onProgress(event.loaded / event.total);
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) resolve();
      else {
        let message = `Upload failed (${xhr.status}).`;
        try {
          message = (JSON.parse(xhr.responseText) as { error?: string }).error ?? message;
        } catch {
          // keep default
        }
        reject(new Error(message));
      }
    };
    xhr.onerror = () => reject(new Error("Network error during upload."));
    xhr.send(file);
  });
}

export function ImportUploader({
  kind,
  accept,
  maxMb,
  hint,
}: {
  kind: "CLAUDE_EXPORT" | "X_ARCHIVE";
  accept: string;
  maxMb: number;
  hint: string;
}) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [files, setFiles] = useState<File[]>([]);
  const [dryRun, setDryRun] = useState(false);
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState<Record<string, number>>({});
  const [error, setError] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);

  const add = (list: FileList | null) => {
    if (!list) return;
    setError(null);
    const next = [...files];
    for (const file of Array.from(list)) {
      if (file.size > maxMb * 1024 * 1024) {
        setError(`${file.name} is larger than the ${maxMb} MB limit.`);
        continue;
      }
      if (!next.some((f) => f.name === file.name && f.size === file.size)) next.push(file);
    }
    setFiles(next.slice(0, 25));
  };

  const start = async () => {
    if (!files.length) return;
    setBusy(true);
    setError(null);
    let jobId: string | null = null;
    try {
      const create = await fetch("/api/admin/imports", {
        method: "POST",
        headers: { ...HEADERS, "Content-Type": "application/json" },
        body: JSON.stringify({ kind, dryRun }),
      });
      const created = (await create.json()) as { id?: string; error?: string };
      if (!create.ok || !created.id) throw new Error(created.error ?? "Could not start the import.");
      jobId = created.id;
      for (const file of files) {
        await uploadFile(jobId, file, (fraction) => setProgress((p) => ({ ...p, [file.name]: fraction })));
        setProgress((p) => ({ ...p, [file.name]: 1 }));
      }
      const started = await fetch(`/api/admin/imports/${jobId}/start`, { method: "POST", headers: HEADERS });
      const body = (await started.json()) as { error?: string };
      if (!started.ok) throw new Error(body.error ?? "Could not start processing.");
      router.push(`/admin/imports/${jobId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Import failed.");
      if (jobId) await fetch(`/api/admin/imports/${jobId}`, { method: "DELETE", headers: HEADERS }).catch(() => undefined);
      setBusy(false);
    }
  };

  return (
    <div className="space-y-4">
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          add(e.dataTransfer.files);
        }}
        className={cn(
          "rounded-2xl border border-dashed px-6 py-10 text-center transition-colors",
          dragging ? "border-signal-500 bg-signal-500/5" : "border-white/15",
        )}
      >
        <FileArchive aria-hidden className="mx-auto h-8 w-8 text-ink-500" />
        <p className="mt-3 text-sm text-ink-200">Drop files here or</p>
        <button type="button" disabled={busy} onClick={() => inputRef.current?.click()} className={cn(adminButtonClasses("secondary"), "mt-3")}>
          <Upload aria-hidden className="h-4 w-4" /> Choose files
        </button>
        <p className="mx-auto mt-3 max-w-lg text-xs text-ink-500">{hint}</p>
        <input ref={inputRef} type="file" multiple accept={accept} className="hidden" onChange={(e) => add(e.target.files)} />
      </div>

      {files.length > 0 ? (
        <ul className="divide-y divide-white/[0.06] rounded-2xl border border-white/[0.08]">
          {files.map((file) => {
            const value = progress[file.name];
            return (
              <li key={`${file.name}-${file.size}`} className="flex items-center gap-3 px-4 py-3">
                <FileArchive aria-hidden className="h-4 w-4 shrink-0 text-ink-400" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm text-ink-100">{file.name}</p>
                  <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-white/[0.06]">
                    <div className="h-full rounded-full bg-signal-500 transition-[width]" style={{ width: `${Math.round((value ?? 0) * 100)}%` }} />
                  </div>
                </div>
                <span className="shrink-0 text-xs text-ink-500">{formatBytes(file.size)}</span>
                {!busy ? (
                  <button type="button" onClick={() => setFiles((list) => list.filter((f) => f !== file))} className={adminButtonClasses("ghost", "sm")} aria-label={`Remove ${file.name}`}>
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                ) : null}
              </li>
            );
          })}
        </ul>
      ) : null}

      {error ? (
        <p role="alert" className="flex items-start gap-2 rounded-lg border border-danger/30 bg-danger/10 px-3 py-2 text-sm text-ink-100">
          <X aria-hidden className="mt-0.5 h-4 w-4 shrink-0 text-danger" /> {error}
        </p>
      ) : null}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <label className="flex items-start gap-3 text-sm text-ink-300">
          <input type="checkbox" checked={dryRun} onChange={(e) => setDryRun(e.target.checked)} disabled={busy} className="mt-0.5 h-4 w-4 accent-signal-500" />
          <span>
            Preview only (dry run)
            <span className="block text-xs text-ink-500">Shows what would be found without saving any candidates.</span>
          </span>
        </label>
        <button type="button" onClick={start} disabled={busy || files.length === 0} className={adminButtonClasses("primary")}>
          {busy ? <LoaderCircle aria-hidden className="h-4 w-4 animate-spin" /> : null}
          {busy ? "Uploading…" : dryRun ? "Upload & preview" : "Upload & import"}
        </button>
      </div>
    </div>
  );
}

/** Polls job status while it's running, then refreshes the page for the full report. */
export function ImportJobProgress({ jobId, initial }: { jobId: string; initial: { status: string; phase: string | null; progress: number; processedItems: number } }) {
  const router = useRouter();
  const [state, setState] = useState(initial);
  const running = ["AWAITING_FILES", "QUEUED", "PROCESSING"].includes(state.status);

  useEffect(() => {
    if (!running) return;
    const timer = setInterval(async () => {
      try {
        const response = await fetch(`/api/admin/imports/${jobId}`, { cache: "no-store" });
        if (!response.ok) return;
        const next = (await response.json()) as typeof initial;
        setState(next);
        if (!["AWAITING_FILES", "QUEUED", "PROCESSING"].includes(next.status)) {
          clearInterval(timer);
          router.refresh();
        }
      } catch {
        // transient network error — keep polling
      }
    }, 1500);
    return () => clearInterval(timer);
  }, [jobId, running, router]);

  if (!running) return null;
  return (
    <div className="rounded-2xl border border-white/[0.08] bg-ink-900/60 p-5" aria-live="polite">
      <div className="flex items-center justify-between gap-3 text-sm">
        <span className="flex items-center gap-2 text-ink-100">
          <LoaderCircle aria-hidden className="h-4 w-4 animate-spin text-signal-400" />
          {state.phase ?? "Working"}…
        </span>
        <span className="text-ink-400 tabular">
          {state.processedItems ? `${state.processedItems.toLocaleString()} items · ` : ""}
          {state.progress}%
        </span>
      </div>
      <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/[0.06]">
        <div className="h-full rounded-full bg-signal-500 transition-[width] duration-700" style={{ width: `${Math.max(3, state.progress)}%` }} />
      </div>
      <button
        type="button"
        onClick={async () => {
          await fetch(`/api/admin/imports/${jobId}`, { method: "DELETE", headers: HEADERS });
          router.refresh();
        }}
        className={cn(adminButtonClasses("ghost", "sm"), "mt-4")}
      >
        Cancel import
      </button>
    </div>
  );
}
