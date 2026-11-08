"use server";

import { headers } from "next/headers";
import { prisma } from "@/lib/db";
import { loadSettings } from "@/lib/content/queries";
import { consumeRateLimit } from "@/lib/rate-limit";
import { clientIpFromHeaders, hashIp, verifySignedValue } from "@/lib/security";
import { contactSchema, spamScore } from "@/lib/validation/contact";

export type ContactFormState =
  | { status: "idle" }
  | { status: "success" }
  | {
      status: "error";
      message: string;
      fieldErrors?: Partial<Record<"name" | "email" | "inquiryType" | "subject" | "message", string>>;
      values?: Record<string, string>;
    };

const MIN_FILL_MS = 3000;
const MAX_FORM_AGE_MS = 1000 * 60 * 60 * 6;

export async function submitContactMessage(_prev: ContactFormState, formData: FormData): Promise<ContactFormState> {
  const values = {
    name: String(formData.get("name") ?? ""),
    email: String(formData.get("email") ?? ""),
    inquiryType: String(formData.get("inquiryType") ?? "GENERAL"),
    subject: String(formData.get("subject") ?? ""),
    message: String(formData.get("message") ?? ""),
  };

  const settings = await loadSettings();
  if (!settings.contactFormEnabled) {
    return { status: "error", message: "The contact form is currently unavailable.", values };
  }

  // Honeypot: real visitors never see or fill this field.
  if (String(formData.get("company_website") ?? "").trim() !== "") {
    return { status: "success" };
  }

  // Signed render timestamp: rejects replayed, scripted or instant submissions.
  const issued = verifySignedValue(String(formData.get("form_token") ?? ""), "contact-form");
  const issuedAt = issued ? Number(issued) : NaN;
  const age = Date.now() - issuedAt;
  if (!Number.isFinite(issuedAt) || age > MAX_FORM_AGE_MS) {
    return { status: "error", message: "This form has expired. Please refresh the page and try again.", values };
  }
  if (age < MIN_FILL_MS) {
    return { status: "error", message: "That was quick! Please take a moment and submit again.", values };
  }

  const parsed = contactSchema.safeParse(values);
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = String(issue.path[0] ?? "");
      if (key && !fieldErrors[key]) fieldErrors[key] = issue.message;
    }
    return { status: "error", message: "Please check the highlighted fields.", fieldErrors, values };
  }

  const ipKey = hashIp(clientIpFromHeaders(await headers()));
  const [perIp, perEmail] = await Promise.all([
    consumeRateLimit(`contact:ip:${ipKey}`, 5, 60 * 60),
    consumeRateLimit(`contact:email:${hashIp(parsed.data.email)}`, 3, 60 * 60),
  ]);
  if (!perIp.allowed || !perEmail.allowed) {
    const minutes = Math.ceil(Math.max(perIp.retryAfterSeconds, perEmail.retryAfterSeconds) / 60);
    return {
      status: "error",
      message: `You've sent several messages recently. Please try again in about ${minutes} minute${minutes === 1 ? "" : "s"}.`,
      values,
    };
  }

  await prisma.contactMessage.create({
    data: {
      ...parsed.data,
      // Suspected spam is kept (no silent data loss) but filed separately.
      status: spamScore(parsed.data) >= 4 ? "SPAM" : "NEW",
    },
  });

  return { status: "success" };
}
