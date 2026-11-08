"use client";

import { useState } from "react";
import { ArrowDown, ArrowUp, Plus, Trash2 } from "lucide-react";
import { adminButtonClasses } from "@/components/admin/ui";
import { inputClass, useFieldError } from "@/components/admin/form";
import { LINK_KIND_LABELS } from "@/lib/labels";
import { cn } from "@/lib/utils";

let keySequence = 0;
const nextKey = () => `n${(keySequence += 1)}`;

function useList<T>(initial: T[]) {
  const [items, setItems] = useState<Array<T & { _key: string }>>(() => initial.map((item, index) => ({ ...item, _key: `i${index}` })));
  const add = (item: T) => setItems((current) => [...current, { ...item, _key: nextKey() }]);
  const update = (key: string, patch: Partial<T>) =>
    setItems((current) => current.map((item) => (item._key === key ? { ...item, ...patch } : item)));
  const remove = (key: string) => setItems((current) => current.filter((item) => item._key !== key));
  const move = (index: number, delta: number) =>
    setItems((current) => {
      const target = index + delta;
      if (target < 0 || target >= current.length) return current;
      const next = [...current];
      [next[index], next[target]] = [next[target]!, next[index]!];
      return next;
    });
  const serialised = (fields: Array<keyof T>) =>
    JSON.stringify(items.map((item) => Object.fromEntries(fields.map((field) => [field, item[field]]))));
  return { items, add, update, remove, move, serialised };
}

function RowControls({ index, count, onMove, onRemove, label }: { index: number; count: number; onMove: (d: number) => void; onRemove: () => void; label: string }) {
  return (
    <div className="flex shrink-0 gap-1">
      <button type="button" onClick={() => onMove(-1)} disabled={index === 0} className={adminButtonClasses("ghost", "sm")} aria-label={`Move ${label} up`}>
        <ArrowUp className="h-3.5 w-3.5" />
      </button>
      <button type="button" onClick={() => onMove(1)} disabled={index === count - 1} className={adminButtonClasses("ghost", "sm")} aria-label={`Move ${label} down`}>
        <ArrowDown className="h-3.5 w-3.5" />
      </button>
      <button type="button" onClick={onRemove} className={adminButtonClasses("ghost", "sm")} aria-label={`Remove ${label}`}>
        <Trash2 className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

export function FeatureListField({
  name,
  defaultItems,
}: {
  name: string;
  defaultItems: Array<{ title: string; description: string | null }>;
}) {
  const list = useList(defaultItems.map((item) => ({ title: item.title, description: item.description ?? "" })));
  const error = useFieldError(name);
  return (
    <div>
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-ink-200">Main features</p>
        <button type="button" className={adminButtonClasses("secondary", "sm")} onClick={() => list.add({ title: "", description: "" })}>
          <Plus aria-hidden className="h-3.5 w-3.5" /> Add feature
        </button>
      </div>
      <input type="hidden" name={name} value={list.serialised(["title", "description"])} />
      {list.items.length === 0 ? (
        <p className="mt-3 rounded-xl border border-dashed border-white/12 px-4 py-6 text-center text-xs text-ink-500">No features yet.</p>
      ) : (
        <ol className="mt-3 space-y-2">
          {list.items.map((item, index) => (
            <li key={item._key} className="flex gap-3 rounded-xl border border-white/10 bg-ink-950/40 p-3">
              <span className="mt-2 w-5 shrink-0 font-mono text-xs text-ink-500">{String(index + 1).padStart(2, "0")}</span>
              <div className="flex-1 space-y-2">
                <input
                  value={item.title}
                  onChange={(e) => list.update(item._key, { title: e.target.value })}
                  placeholder="Feature title"
                  maxLength={120}
                  aria-label={`Feature ${index + 1} title`}
                  className={inputClass}
                />
                <textarea
                  value={item.description}
                  onChange={(e) => list.update(item._key, { description: e.target.value })}
                  placeholder="Short description (optional)"
                  maxLength={400}
                  rows={2}
                  aria-label={`Feature ${index + 1} description`}
                  className={cn(inputClass, "resize-y")}
                />
              </div>
              <RowControls index={index} count={list.items.length} onMove={(d) => list.move(index, d)} onRemove={() => list.remove(item._key)} label="feature" />
            </li>
          ))}
        </ol>
      )}
      {error ? <p className="mt-2 text-xs text-danger">{error}</p> : null}
    </div>
  );
}

export function LinkListField({
  name,
  defaultItems,
}: {
  name: string;
  defaultItems: Array<{ kind: string; label: string; url: string }>;
}) {
  const list = useList(defaultItems);
  const error = useFieldError(name);
  return (
    <div>
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-ink-200">Relevant links</p>
        <button type="button" className={adminButtonClasses("secondary", "sm")} onClick={() => list.add({ kind: "WEBSITE", label: "", url: "" })}>
          <Plus aria-hidden className="h-3.5 w-3.5" /> Add link
        </button>
      </div>
      <input type="hidden" name={name} value={list.serialised(["kind", "label", "url"])} />
      {list.items.length === 0 ? (
        <p className="mt-3 rounded-xl border border-dashed border-white/12 px-4 py-6 text-center text-xs text-ink-500">No links yet.</p>
      ) : (
        <ol className="mt-3 space-y-2">
          {list.items.map((item, index) => (
            <li key={item._key} className="grid grid-cols-1 gap-2 rounded-xl border border-white/10 bg-ink-950/40 p-3 sm:grid-cols-[10rem_1fr_1.4fr_auto] sm:items-center">
              <select value={item.kind} onChange={(e) => list.update(item._key, { kind: e.target.value })} aria-label="Link type" className={inputClass}>
                {Object.entries(LINK_KIND_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
              <input value={item.label} onChange={(e) => list.update(item._key, { label: e.target.value })} placeholder="Label" maxLength={60} aria-label="Link label" className={inputClass} />
              <input value={item.url} onChange={(e) => list.update(item._key, { url: e.target.value })} placeholder="https://…" type="url" aria-label="Link URL" className={inputClass} />
              <RowControls index={index} count={list.items.length} onMove={(d) => list.move(index, d)} onRemove={() => list.remove(item._key)} label="link" />
            </li>
          ))}
        </ol>
      )}
      {error ? <p className="mt-2 text-xs text-danger">{error}</p> : null}
    </div>
  );
}
