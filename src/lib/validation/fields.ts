import { z } from "zod";

/**
 * Shared field schemas for admin forms. Everything arrives from FormData as
 * strings; these helpers normalise empty strings to null, validate URLs and
 * dates, and parse JSON-encoded list editors.
 */

export const requiredText = (max: number, message = "This field is required.") =>
  z.string({ error: message }).trim().min(1, message).max(max, `Keep this under ${max} characters.`);

export const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max, `Keep this under ${max} characters.`)
    .optional()
    .transform((value) => (value ? value : null));

export const optionalUrl = z
  .string()
  .trim()
  .max(2048, "That URL is too long.")
  .optional()
  .transform((value, ctx) => {
    if (!value) return null;
    try {
      const url = new URL(value);
      if (url.protocol !== "https:" && url.protocol !== "http:") throw new Error("protocol");
      return url.toString();
    } catch {
      ctx.addIssue({ code: "custom", message: "Enter a full URL starting with https://" });
      return z.NEVER;
    }
  });

export const requiredUrl = optionalUrl.refine((value) => value !== null, "A URL is required.");

export const optionalEmail = z
  .string()
  .trim()
  .toLowerCase()
  .max(254)
  .optional()
  .transform((value, ctx) => {
    if (!value) return null;
    if (!z.email().safeParse(value).success) {
      ctx.addIssue({ code: "custom", message: "Enter a valid email address." });
      return z.NEVER;
    }
    return value;
  });

export const optionalDate = z
  .string()
  .trim()
  .optional()
  .transform((value, ctx) => {
    if (!value) return null;
    const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
    if (!match) {
      ctx.addIssue({ code: "custom", message: "Use the date picker (YYYY-MM-DD)." });
      return z.NEVER;
    }
    const date = new Date(Date.UTC(Number(match[1]), Number(match[2]) - 1, Number(match[3])));
    if (Number.isNaN(date.getTime()) || date.getUTCFullYear() < 1990 || date.getUTCFullYear() > 2100) {
      ctx.addIssue({ code: "custom", message: "Enter a realistic date." });
      return z.NEVER;
    }
    return date;
  });

/** Unchecked checkboxes are absent from FormData, so the field is optional. */
export const checkbox = z
  .string()
  .max(10)
  .nullish()
  .transform((value) => value === "on" || value === "true" || value === "1");

export const slugInput = z
  .string()
  .trim()
  .toLowerCase()
  .max(80, "Keep the slug under 80 characters.")
  .optional()
  .transform((value, ctx) => {
    if (!value) return null;
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value)) {
      ctx.addIssue({ code: "custom", message: "Use lowercase letters, numbers and single hyphens." });
      return z.NEVER;
    }
    return value;
  });

export const mediaId = z
  .string()
  .trim()
  .optional()
  .transform((value, ctx) => {
    if (!value) return null;
    if (!/^[A-Za-z0-9_-]{10,40}$/.test(value)) {
      ctx.addIssue({ code: "custom", message: "Invalid media selection." });
      return z.NEVER;
    }
    return value;
  });

export const hexColor = z
  .string()
  .trim()
  .optional()
  .transform((value, ctx) => {
    if (!value) return null;
    if (!/^#[0-9a-fA-F]{6}$/.test(value)) {
      ctx.addIssue({ code: "custom", message: "Use a 6-digit hex colour like #ff6b35." });
      return z.NEVER;
    }
    return value.toLowerCase();
  });

/** Comma- or newline-separated list → trimmed unique array. */
export const stringList = (maxItems: number, maxLength: number) =>
  z
    .string()
    .optional()
    .transform((value) =>
      [
        ...new Set(
          (value ?? "")
            .split(/[\n,]/)
            .map((item) => item.trim())
            .filter(Boolean)
            .map((item) => item.slice(0, maxLength)),
        ),
      ].slice(0, maxItems),
    );

/** JSON-encoded array from a client-side list editor. */
export function jsonList<T extends z.ZodTypeAny>(item: T, maxItems = 50) {
  return z
    .string()
    .optional()
    .transform((value, ctx) => {
      if (!value) return [];
      try {
        const parsed: unknown = JSON.parse(value);
        return parsed;
      } catch {
        ctx.addIssue({ code: "custom", message: "The list could not be read. Please try again." });
        return z.NEVER;
      }
    })
    .pipe(z.array(item).max(maxItems, `Add at most ${maxItems} items.`));
}

export const sortOrder = z.coerce.number().int().min(-100000).max(100000).catch(0);

export type FieldErrors = Record<string, string>;

export interface ActionResult {
  ok: boolean;
  message?: string;
  fieldErrors?: FieldErrors;
  /** Id of a newly created record (for client-side follow-ups). */
  id?: string;
  /** Non-sensitive submitted values, echoed back so forms survive React's post-action reset. */
  values?: Record<string, string>;
}

export const initialActionResult: ActionResult = { ok: false };

export function zodErrors(error: z.ZodError): ActionResult {
  const fieldErrors: FieldErrors = {};
  for (const issue of error.issues) {
    const key = issue.path.join(".") || "_form";
    if (!fieldErrors[key]) fieldErrors[key] = issue.message;
  }
  return { ok: false, message: "Please fix the highlighted fields.", fieldErrors };
}

/** Converts FormData into a plain object; `arrays` lists multi-value fields. */
export function formObject(formData: FormData, arrays: string[] = []): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  for (const key of new Set(formData.keys())) {
    if (key.startsWith("$ACTION")) continue;
    if (arrays.includes(key)) {
      result[key] = formData.getAll(key).map(String);
    } else {
      const value = formData.get(key);
      result[key] = typeof value === "string" ? value : undefined;
    }
  }
  for (const key of arrays) if (!(key in result)) result[key] = [];
  return result;
}
