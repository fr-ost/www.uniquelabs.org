import { z } from "zod";

export const INQUIRY_TYPES = ["GENERAL", "BUSINESS", "PARTNERSHIP", "PRESS", "SUPPORT", "OTHER"] as const;

const singleLine = (max: number) =>
  z
    .string()
    .trim()
    .max(max, `Keep this under ${max} characters.`)
    .refine((value) => !/[\r\n]/.test(value), "Use a single line.");

export const contactSchema = z.object({
  name: singleLine(120).min(2, "Please enter your name."),
  email: z
    .string()
    .trim()
    .toLowerCase()
    .max(254, "That email address is too long.")
    .pipe(z.email("Please enter a valid email address.")),
  inquiryType: z.enum(INQUIRY_TYPES, { error: "Please choose an inquiry type." }),
  subject: singleLine(160).min(3, "Please add a short subject."),
  message: z
    .string()
    .trim()
    .min(20, "Please write at least a couple of sentences (20+ characters).")
    .max(5000, "Please keep your message under 5,000 characters."),
});

export type ContactInput = z.infer<typeof contactSchema>;

/** Heuristic spam score for an otherwise valid message (0 = clean). */
export function spamScore(input: ContactInput): number {
  let score = 0;
  const text = `${input.subject}\n${input.message}`;
  const links = text.match(/https?:\/\/|www\./gi)?.length ?? 0;
  if (links > 2) score += links;
  if (/\b(viagra|casino|crypto\s*signals|seo\s+services|backlinks|loan\s+offer|forex)\b/i.test(text)) score += 4;
  if (/<a\s+href|\[url=/i.test(text)) score += 4;
  if (/(.)\1{15,}/.test(text)) score += 2;
  return score;
}
