"use client";

import {
  createContext,
  startTransition,
  use,
  useActionState,
  useId,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useFormStatus } from "react-dom";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { AlertTriangle, CheckCircle2, LoaderCircle } from "lucide-react";
import { adminButtonClasses } from "@/components/admin/ui";
import { initialActionResult, type ActionResult, type FieldErrors } from "@/lib/validation/fields";
import { cn } from "@/lib/utils";

const FormContext = createContext<{ errors: FieldErrors }>({ errors: {} });

export const inputClass =
  "block w-full rounded-lg border border-white/10 bg-ink-950/60 px-3 py-2 text-sm text-ink-50 placeholder:text-ink-600 transition-[border-color,box-shadow] focus:border-signal-500/60 focus:outline-none focus:ring-4 focus:ring-signal-500/10 disabled:opacity-60";

type FormAction = (state: ActionResult, formData: FormData) => Promise<ActionResult>;

/**
 * Admin form wrapper. Submits through the server action without React's
 * automatic form reset, so typed values survive validation errors.
 */
export function AdminForm({
  action,
  children,
  submitLabel = "Save changes",
  className,
  footer,
  sticky = true,
}: {
  action: FormAction;
  children: ReactNode;
  submitLabel?: string;
  className?: string;
  footer?: ReactNode;
  sticky?: boolean;
}) {
  const [state, dispatch, pending] = useActionState(action, initialActionResult);
  const formRef = useRef<HTMLFormElement>(null);

  return (
    <FormContext value={{ errors: state.fieldErrors ?? {} }}>
      <form
        ref={formRef}
        className={cn("space-y-6", className)}
        noValidate
        onSubmit={(event) => {
          event.preventDefault();
          const data = new FormData(event.currentTarget);
          startTransition(() => dispatch(data));
        }}
      >
        {children}
        <div
          className={cn(
            "flex flex-col-reverse gap-3 border-t border-white/[0.07] pt-5 sm:flex-row sm:items-center sm:justify-between",
            sticky && "sticky bottom-0 z-10 -mx-1 bg-ink-950/90 px-1 pb-4 backdrop-blur",
          )}
        >
          <div className="min-h-5 text-sm" aria-live="polite">
            {state.message ? (
              <span className={cn("inline-flex items-center gap-2", state.ok ? "text-live" : "text-danger")}>
                {state.ok ? <CheckCircle2 aria-hidden className="h-4 w-4" /> : <AlertTriangle aria-hidden className="h-4 w-4" />}
                {state.message}
              </span>
            ) : null}
          </div>
          <div className="flex items-center gap-2">
            {footer}
            <button type="submit" disabled={pending} className={adminButtonClasses("primary")}>
              {pending ? <LoaderCircle aria-hidden className="h-4 w-4 animate-spin" /> : null}
              {pending ? "Saving…" : submitLabel}
            </button>
          </div>
        </div>
      </form>
    </FormContext>
  );
}

export function useFieldError(name: string): string | undefined {
  return use(FormContext).errors[name];
}

export function Field({
  label,
  htmlFor,
  hint,
  error,
  children,
  className,
  optional,
}: {
  label: ReactNode;
  htmlFor?: string;
  hint?: ReactNode;
  error?: string;
  children: ReactNode;
  className?: string;
  optional?: boolean;
}) {
  return (
    <div className={className}>
      <label htmlFor={htmlFor} className="flex items-baseline justify-between gap-2 text-sm font-medium text-ink-200">
        <span>{label}</span>
        {optional ? <span className="text-xs font-normal text-ink-600">Optional</span> : null}
      </label>
      <div className="mt-1.5">{children}</div>
      {error ? (
        <p className="mt-1.5 text-xs text-danger" role="alert">
          {error}
        </p>
      ) : hint ? (
        <p className="mt-1.5 text-xs text-ink-500">{hint}</p>
      ) : null}
    </div>
  );
}

export function TextInput({
  name,
  label,
  defaultValue,
  hint,
  placeholder,
  type = "text",
  maxLength,
  optional,
  className,
  required,
}: {
  name: string;
  label: ReactNode;
  defaultValue?: string | number | null;
  hint?: ReactNode;
  placeholder?: string;
  type?: "text" | "email" | "url" | "password" | "number" | "date" | "datetime-local";
  maxLength?: number;
  optional?: boolean;
  className?: string;
  required?: boolean;
}) {
  const id = useId();
  const error = useFieldError(name);
  return (
    <Field label={label} htmlFor={id} hint={hint} error={error} optional={optional} className={className}>
      <input
        id={id}
        name={name}
        type={type}
        defaultValue={defaultValue ?? ""}
        placeholder={placeholder}
        maxLength={maxLength}
        required={required}
        aria-invalid={Boolean(error)}
        className={cn(inputClass, error && "border-danger/60")}
      />
    </Field>
  );
}

export function TextArea({
  name,
  label,
  defaultValue,
  hint,
  rows = 4,
  maxLength,
  optional,
  className,
  placeholder,
}: {
  name: string;
  label: ReactNode;
  defaultValue?: string | null;
  hint?: ReactNode;
  rows?: number;
  maxLength?: number;
  optional?: boolean;
  className?: string;
  placeholder?: string;
}) {
  const id = useId();
  const error = useFieldError(name);
  return (
    <Field label={label} htmlFor={id} hint={hint} error={error} optional={optional} className={className}>
      <textarea
        id={id}
        name={name}
        rows={rows}
        defaultValue={defaultValue ?? ""}
        maxLength={maxLength}
        placeholder={placeholder}
        aria-invalid={Boolean(error)}
        className={cn(inputClass, "resize-y leading-relaxed", error && "border-danger/60")}
      />
    </Field>
  );
}

/** Markdown editor with a live preview tab. */
export function MarkdownArea({
  name,
  label,
  defaultValue,
  hint,
  rows = 10,
  optional,
  className,
}: {
  name: string;
  label: ReactNode;
  defaultValue?: string | null;
  hint?: ReactNode;
  rows?: number;
  optional?: boolean;
  className?: string;
}) {
  const id = useId();
  const error = useFieldError(name);
  const [value, setValue] = useState(defaultValue ?? "");
  const [tab, setTab] = useState<"write" | "preview">("write");
  return (
    <Field
      label={label}
      htmlFor={id}
      error={error}
      optional={optional}
      className={className}
      hint={hint ?? "Markdown supported: **bold**, _italic_, [links](https://…), lists and ## headings."}
    >
      <div className="overflow-hidden rounded-lg border border-white/10">
        <div className="flex border-b border-white/10 bg-ink-900 text-xs" role="tablist">
          {(["write", "preview"] as const).map((key) => (
            <button
              key={key}
              type="button"
              role="tab"
              aria-selected={tab === key}
              onClick={() => setTab(key)}
              className={cn("px-3 py-2 capitalize", tab === key ? "bg-ink-950 text-ink-50" : "text-ink-400 hover:text-ink-200")}
            >
              {key}
            </button>
          ))}
        </div>
        <textarea
          id={id}
          name={name}
          rows={rows}
          value={value}
          onChange={(event) => setValue(event.target.value)}
          aria-invalid={Boolean(error)}
          className={cn(
            "block w-full resize-y border-0 bg-ink-950/60 px-3 py-2 font-mono text-[0.8125rem] leading-relaxed text-ink-50 focus:outline-none",
            tab === "preview" && "hidden",
          )}
        />
        {tab === "preview" ? (
          <div className="prose-ul min-h-32 bg-ink-950/60 px-4 py-3 text-sm">
            {value.trim() ? (
              <ReactMarkdown remarkPlugins={[remarkGfm]} skipHtml>
                {value}
              </ReactMarkdown>
            ) : (
              <p className="text-ink-500">Nothing to preview yet.</p>
            )}
          </div>
        ) : null}
      </div>
    </Field>
  );
}

export function Select({
  name,
  label,
  defaultValue,
  options,
  hint,
  emptyLabel,
  optional,
  className,
}: {
  name: string;
  label: ReactNode;
  defaultValue?: string | null;
  options: Array<{ value: string; label: string }>;
  hint?: ReactNode;
  emptyLabel?: string;
  optional?: boolean;
  className?: string;
}) {
  const id = useId();
  const error = useFieldError(name);
  return (
    <Field label={label} htmlFor={id} hint={hint} error={error} optional={optional} className={className}>
      <select id={id} name={name} defaultValue={defaultValue ?? ""} aria-invalid={Boolean(error)} className={cn(inputClass, error && "border-danger/60")}>
        {emptyLabel !== undefined ? <option value="">{emptyLabel}</option> : null}
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </Field>
  );
}

export function Checkbox({
  name,
  label,
  defaultChecked,
  hint,
  className,
}: {
  name: string;
  label: ReactNode;
  defaultChecked?: boolean;
  hint?: ReactNode;
  className?: string;
}) {
  const id = useId();
  const error = useFieldError(name);
  return (
    <div className={className}>
      <label htmlFor={id} className="flex cursor-pointer items-start gap-3">
        <input
          id={id}
          name={name}
          type="checkbox"
          defaultChecked={defaultChecked}
          className="mt-0.5 h-4 w-4 shrink-0 cursor-pointer rounded border-white/20 bg-ink-950 accent-signal-500"
        />
        <span>
          <span className="text-sm font-medium text-ink-200">{label}</span>
          {hint ? <span className="mt-0.5 block text-xs text-ink-500">{hint}</span> : null}
        </span>
      </label>
      {error ? <p className="mt-1.5 text-xs text-danger">{error}</p> : null}
    </div>
  );
}

export function MultiCheckbox({
  name,
  label,
  options,
  defaultValues,
  hint,
}: {
  name: string;
  label: ReactNode;
  options: Array<{ value: string; label: string }>;
  defaultValues: string[];
  hint?: ReactNode;
}) {
  const error = useFieldError(name);
  return (
    <fieldset>
      <legend className="text-sm font-medium text-ink-200">{label}</legend>
      <div className="mt-2 flex flex-wrap gap-2">
        {options.map((option) => (
          <label
            key={option.value}
            className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-white/10 px-3 py-1.5 text-sm text-ink-200 has-[:checked]:border-signal-500/60 has-[:checked]:bg-signal-500/10 has-[:checked]:text-ink-50"
          >
            <input type="checkbox" name={name} value={option.value} defaultChecked={defaultValues.includes(option.value)} className="h-3.5 w-3.5 accent-signal-500" />
            {option.label}
          </label>
        ))}
      </div>
      {error ? <p className="mt-1.5 text-xs text-danger">{error}</p> : hint ? <p className="mt-1.5 text-xs text-ink-500">{hint}</p> : null}
    </fieldset>
  );
}

export function DateWithPrecision({
  label,
  dateName,
  precisionName,
  defaultDate,
  defaultPrecision = "DAY",
  verifiedName,
  defaultVerified,
  hint,
  required,
}: {
  label: ReactNode;
  dateName: string;
  precisionName: string;
  defaultDate?: string | null;
  defaultPrecision?: string;
  verifiedName?: string;
  defaultVerified?: boolean;
  hint?: ReactNode;
  required?: boolean;
}) {
  const id = useId();
  const error = useFieldError(dateName);
  return (
    <Field label={label} htmlFor={id} hint={hint} error={error} optional={!required}>
      <div className="flex flex-wrap items-center gap-2">
        <input id={id} type="date" name={dateName} defaultValue={defaultDate ?? ""} className={cn(inputClass, "w-auto", error && "border-danger/60")} />
        <select name={precisionName} defaultValue={defaultPrecision} aria-label="Date precision" className={cn(inputClass, "w-auto")}>
          <option value="DAY">Exact day</option>
          <option value="MONTH">Month only</option>
          <option value="YEAR">Year only</option>
        </select>
        {verifiedName ? (
          <label className="inline-flex items-center gap-2 text-sm text-ink-300">
            <input type="checkbox" name={verifiedName} defaultChecked={defaultVerified} className="h-4 w-4 accent-signal-500" />
            Verified — show publicly
          </label>
        ) : null}
      </div>
    </Field>
  );
}

export function FormSection({ title, description, children }: { title: string; description?: ReactNode; children: ReactNode }) {
  return (
    <section className="grid grid-cols-1 gap-6 border-b border-white/[0.06] pb-8 last:border-b-0 lg:grid-cols-3 lg:gap-10">
      <div>
        <h2 className="text-sm font-semibold text-ink-50">{title}</h2>
        {description ? <p className="mt-1.5 text-xs leading-relaxed text-ink-400">{description}</p> : null}
      </div>
      <div className="space-y-5 lg:col-span-2">{children}</div>
    </section>
  );
}

export function FormError() {
  const error = useFieldError("_form");
  return error ? <p className="rounded-lg border border-danger/30 bg-danger/10 px-3 py-2 text-sm text-danger">{error}</p> : null;
}

/** Submit button for small inline forms (status changes, reorder, etc.). */
export function InlineSubmit({
  children,
  variant = "secondary",
  size = "sm",
  title,
}: {
  children: ReactNode;
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md";
  title?: string;
}) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} title={title} className={adminButtonClasses(variant, size)}>
      {pending ? <LoaderCircle aria-hidden className="h-3.5 w-3.5 animate-spin" /> : null}
      {children}
    </button>
  );
}
