"use client";

import { useRef, type ReactNode } from "react";
import { useFormStatus } from "react-dom";
import { LoaderCircle } from "lucide-react";
import { adminButtonClasses } from "@/components/admin/ui";

function ConfirmSubmit({ label, variant }: { label: string; variant: "danger" | "primary" }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className={adminButtonClasses(variant === "danger" ? "danger" : "primary")}>
      {pending ? <LoaderCircle aria-hidden className="h-4 w-4 animate-spin" /> : null}
      {label}
    </button>
  );
}

/**
 * Button that opens a confirmation dialog before running a (bound) server
 * action. Used for every destructive or hard-to-reverse operation.
 */
export function ConfirmAction({
  action,
  trigger,
  title,
  body,
  confirmLabel = "Confirm",
  variant = "danger",
  triggerVariant = "danger",
  size = "sm",
  children,
}: {
  action: (formData: FormData) => Promise<unknown>;
  trigger: ReactNode;
  title: string;
  body?: ReactNode;
  confirmLabel?: string;
  variant?: "danger" | "primary";
  triggerVariant?: "danger" | "secondary" | "ghost" | "primary";
  size?: "sm" | "md";
  /** Extra form fields (e.g. a rejection note). */
  children?: ReactNode;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  return (
    <>
      <button type="button" className={adminButtonClasses(triggerVariant, size)} onClick={() => ref.current?.showModal()}>
        {trigger}
      </button>
      <dialog
        ref={ref}
        className="m-auto w-[min(92vw,28rem)] rounded-2xl border border-white/10 bg-ink-900 p-0 text-ink-100 shadow-2xl backdrop:bg-black/70 backdrop:backdrop-blur-sm"
        onClick={(event) => {
          if (event.target === ref.current) ref.current?.close();
        }}
      >
        <form
          action={async (formData) => {
            await action(formData);
            ref.current?.close();
          }}
          className="p-6"
        >
          <h2 className="text-base font-semibold text-ink-50">{title}</h2>
          {body ? <div className="mt-2 text-sm leading-relaxed text-ink-300">{body}</div> : null}
          {children ? <div className="mt-4">{children}</div> : null}
          <div className="mt-6 flex justify-end gap-2">
            <button type="button" className={adminButtonClasses("ghost")} onClick={() => ref.current?.close()}>
              Cancel
            </button>
            <ConfirmSubmit label={confirmLabel} variant={variant} />
          </div>
        </form>
      </dialog>
    </>
  );
}
