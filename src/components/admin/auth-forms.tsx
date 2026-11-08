"use client";

import { useActionState } from "react";
import { LoaderCircle } from "lucide-react";
import { inputClass } from "@/components/admin/form";
import { loginAction, setupAction } from "@/server/actions/auth";
import { initialActionResult } from "@/lib/validation/fields";
import { cn } from "@/lib/utils";

function AuthInput({
  label,
  name,
  type = "text",
  autoComplete,
  error,
  defaultValue,
}: {
  label: string;
  name: string;
  type?: string;
  autoComplete?: string;
  error?: string;
  defaultValue?: string;
}) {
  return (
    <div>
      <label htmlFor={`auth-${name}`} className="text-sm font-medium text-ink-200">
        {label}
      </label>
      <input
        id={`auth-${name}`}
        name={name}
        type={type}
        required
        autoComplete={autoComplete}
        defaultValue={defaultValue}
        aria-invalid={Boolean(error)}
        className={cn(inputClass, "mt-1.5 h-11", error && "border-danger/60")}
      />
      {error ? <p className="mt-1.5 text-xs text-danger">{error}</p> : null}
    </div>
  );
}

export function LoginForm({ next }: { next?: string }) {
  const [state, action, pending] = useActionState(loginAction, initialActionResult);
  return (
    <form action={action} className="space-y-5">
      <input type="hidden" name="next" value={next ?? ""} />
      {state.message ? (
        <p role="alert" className="rounded-lg border border-danger/30 bg-danger/10 px-3 py-2 text-sm text-ink-100">
          {state.message}
        </p>
      ) : null}
      <AuthInput label="Email" name="email" type="email" autoComplete="username" defaultValue={state.values?.email} />
      <AuthInput label="Password" name="password" type="password" autoComplete="current-password" />
      <button
        type="submit"
        disabled={pending}
        className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-ink-50 text-sm font-medium text-ink-950 transition-colors hover:bg-white disabled:opacity-60"
      >
        {pending ? <LoaderCircle aria-hidden className="h-4 w-4 animate-spin" /> : null}
        {pending ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}

export function SetupForm() {
  const [state, action, pending] = useActionState(setupAction, initialActionResult);
  const errors = state.fieldErrors ?? {};
  return (
    <form action={action} className="space-y-5">
      {state.message ? (
        <p role="alert" className="rounded-lg border border-danger/30 bg-danger/10 px-3 py-2 text-sm text-ink-100">
          {state.message}
        </p>
      ) : null}
      <AuthInput label="Setup token" name="token" type="password" autoComplete="off" error={errors.token} />
      <AuthInput label="Your name" name="name" autoComplete="name" error={errors.name} defaultValue={state.values?.name} />
      <AuthInput label="Email" name="email" type="email" autoComplete="username" error={errors.email} defaultValue={state.values?.email} />
      <AuthInput label="Password (12+ characters)" name="password" type="password" autoComplete="new-password" error={errors.password} />
      <AuthInput label="Confirm password" name="confirm" type="password" autoComplete="new-password" error={errors.confirm} />
      <button
        type="submit"
        disabled={pending}
        className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-ink-50 text-sm font-medium text-ink-950 transition-colors hover:bg-white disabled:opacity-60"
      >
        {pending ? <LoaderCircle aria-hidden className="h-4 w-4 animate-spin" /> : null}
        Create owner account
      </button>
    </form>
  );
}
