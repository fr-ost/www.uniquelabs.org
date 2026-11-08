"use client";

import { useActionState, useId } from "react";
import { ArrowRight, CheckCircle2, LoaderCircle } from "lucide-react";
import { submitContactMessage, type ContactFormState } from "@/server/actions/contact";
import { INQUIRY_TYPE_LABELS } from "@/lib/labels";
import { cn } from "@/lib/utils";

const initial: ContactFormState = { status: "idle" };

const inputClasses =
  "block w-full rounded-xl border bg-ink-900/70 px-4 py-3 text-[0.9375rem] text-ink-50 placeholder:text-ink-500 transition-[border-color,box-shadow] duration-300 focus:border-signal-500/70 focus:outline-none focus:ring-4 focus:ring-signal-500/10";

function Field({
  label,
  error,
  children,
  htmlFor,
  hint,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
  htmlFor: string;
  hint?: string;
}) {
  return (
    <div>
      <label htmlFor={htmlFor} className="text-sm font-medium text-ink-200">
        {label}
      </label>
      <div className="mt-2">{children}</div>
      {error ? (
        <p id={`${htmlFor}-error`} className="mt-2 text-sm text-danger" role="alert">
          {error}
        </p>
      ) : hint ? (
        <p className="mt-2 text-xs text-ink-500">{hint}</p>
      ) : null}
    </div>
  );
}

export function ContactForm({ formToken, defaultType }: { formToken: string; defaultType?: string }) {
  const [state, action, pending] = useActionState(submitContactMessage, initial);
  const id = useId();

  if (state.status === "success") {
    return (
      <div className="surface-card flex flex-col items-start gap-5 p-8 md:p-10" role="status">
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-live/15 text-live">
          <CheckCircle2 aria-hidden className="h-6 w-6" />
        </span>
        <h2 className="font-display text-2xl font-medium tracking-[-0.03em] text-ink-50">Thank you — message received.</h2>
        <p className="text-ink-300">We read every message and will reply to the email address you provided.</p>
      </div>
    );
  }

  const errors = state.status === "error" ? (state.fieldErrors ?? {}) : {};
  const values = state.status === "error" ? (state.values ?? {}) : {};
  const fid = (name: string) => `${id}-${name}`;
  const describedBy = (name: keyof typeof errors) => (errors[name] ? `${fid(name)}-error` : undefined);

  return (
    <form action={action} className="surface-card space-y-6 p-6 md:p-9" noValidate>
      <input type="hidden" name="form_token" value={formToken} />
      {/* Honeypot — hidden from people and assistive technology */}
      <div aria-hidden className="absolute -left-[9999px] h-px w-px overflow-hidden">
        <label htmlFor={fid("company_website")}>Leave this field empty</label>
        <input id={fid("company_website")} name="company_website" type="text" tabIndex={-1} autoComplete="off" />
      </div>

      {state.status === "error" ? (
        <div className="rounded-xl border border-danger/30 bg-danger/10 px-4 py-3 text-sm text-ink-100" role="alert">
          {state.message}
        </div>
      ) : null}

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <Field label="Name" htmlFor={fid("name")} error={errors.name}>
          <input
            id={fid("name")}
            name="name"
            required
            maxLength={120}
            autoComplete="name"
            defaultValue={values.name}
            aria-invalid={Boolean(errors.name)}
            aria-describedby={describedBy("name")}
            className={cn(inputClasses, errors.name ? "border-danger/60" : "border-white/10")}
          />
        </Field>
        <Field label="Email" htmlFor={fid("email")} error={errors.email}>
          <input
            id={fid("email")}
            name="email"
            type="email"
            required
            maxLength={254}
            autoComplete="email"
            inputMode="email"
            defaultValue={values.email}
            aria-invalid={Boolean(errors.email)}
            aria-describedby={describedBy("email")}
            className={cn(inputClasses, errors.email ? "border-danger/60" : "border-white/10")}
          />
        </Field>
      </div>

      <Field label="Inquiry type" htmlFor={fid("inquiryType")} error={errors.inquiryType}>
        <select
          id={fid("inquiryType")}
          name="inquiryType"
          defaultValue={values.inquiryType ?? defaultType ?? "GENERAL"}
          aria-invalid={Boolean(errors.inquiryType)}
          className={cn(inputClasses, "appearance-none bg-[length:16px] bg-[right_1rem_center] bg-no-repeat pr-10", errors.inquiryType ? "border-danger/60" : "border-white/10")}
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%239c9ca6' stroke-width='2'><path d='m6 9 6 6 6-6'/></svg>\")",
          }}
        >
          {Object.entries(INQUIRY_TYPE_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </Field>

      <Field label="Subject" htmlFor={fid("subject")} error={errors.subject}>
        <input
          id={fid("subject")}
          name="subject"
          required
          maxLength={160}
          defaultValue={values.subject}
          aria-invalid={Boolean(errors.subject)}
          aria-describedby={describedBy("subject")}
          className={cn(inputClasses, errors.subject ? "border-danger/60" : "border-white/10")}
        />
      </Field>

      <Field label="Message" htmlFor={fid("message")} error={errors.message} hint="Please don't include passwords or other sensitive information.">
        <textarea
          id={fid("message")}
          name="message"
          required
          rows={7}
          maxLength={5000}
          defaultValue={values.message}
          aria-invalid={Boolean(errors.message)}
          aria-describedby={describedBy("message")}
          className={cn(inputClasses, "resize-y", errors.message ? "border-danger/60" : "border-white/10")}
        />
      </Field>

      <div className="flex flex-col-reverse gap-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs text-ink-500">
          By sending this form you agree to our{" "}
          <a href="/privacy" className="underline underline-offset-2 hover:text-ink-200">
            privacy policy
          </a>
          .
        </p>
        <button
          type="submit"
          disabled={pending}
          className="group inline-flex h-12 items-center justify-center gap-2 rounded-full bg-ink-50 px-6 text-[0.9375rem] font-medium text-ink-950 transition-colors hover:bg-white disabled:opacity-60"
        >
          {pending ? <LoaderCircle aria-hidden className="h-4 w-4 animate-spin" /> : null}
          {pending ? "Sending…" : "Send message"}
          {!pending ? <ArrowRight aria-hidden className="h-4 w-4 transition-transform group-hover:translate-x-0.5" /> : null}
        </button>
      </div>
    </form>
  );
}
