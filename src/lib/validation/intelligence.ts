import { z } from "zod";
import { checkbox, optionalDate, optionalText, optionalUrl, requiredText, requiredUrl } from "@/lib/validation/fields";

const PUBLISH = ["DRAFT", "PUBLISHED", "ARCHIVED"] as const;

const cmcSlug = z
  .string()
  .trim()
  .toLowerCase()
  .max(80)
  .optional()
  .transform((value, ctx) => {
    if (!value) return null;
    if (!/^[a-z0-9][a-z0-9-]*$/.test(value)) {
      ctx.addIssue({ code: "custom", message: "Use the CoinMarketCap slug from the coin's URL, e.g. “ethereum”." });
      return z.NEVER;
    }
    return value;
  });

const tokenSymbol = z
  .string()
  .trim()
  .toUpperCase()
  .max(20, "Keep the symbol under 20 characters.")
  .regex(/^[A-Z0-9.$_-]*$/, "Letters and numbers only, e.g. ARB.");

/** `datetime-local` input, interpreted as UTC. */
const utcDateTime = z
  .string()
  .trim()
  .optional()
  .transform((value, ctx) => {
    if (!value) return null;
    const match = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/.exec(value);
    if (!match) {
      ctx.addIssue({ code: "custom", message: "Use the date and time picker (UTC)." });
      return z.NEVER;
    }
    const [, y, mo, d, h, mi] = match.map(Number) as [number, number, number, number, number, number];
    const date = new Date(Date.UTC(y, mo - 1, d, h, mi));
    if (Number.isNaN(date.getTime()) || y < 2009 || y > 2100) {
      ctx.addIssue({ code: "custom", message: "Enter a realistic date." });
      return z.NEVER;
    }
    return date;
  });

const positiveDecimal = (max: number, message: string) =>
  z
    .string()
    .trim()
    .optional()
    .transform((value, ctx) => {
      if (!value) return null;
      const normalised = value.replace(/[,\s_]/g, "");
      if (!/^\d+(\.\d+)?$/.test(normalised)) {
        ctx.addIssue({ code: "custom", message });
        return z.NEVER;
      }
      const n = Number(normalised);
      if (!Number.isFinite(n) || n <= 0 || n > max) {
        ctx.addIssue({ code: "custom", message });
        return z.NEVER;
      }
      return normalised;
    });

export const intelligenceSettingsSchema = z.object({
  enabled: checkbox,
  showOnHomepage: checkbox,
  assetLimit: z.coerce.number({ error: "Choose how many assets to list." }).int().min(10, "At least 10.").max(200, "At most 200."),
  refreshMinutes: z.coerce.number({ error: "Enter a number of minutes." }).min(1, "At least 1 minute.").max(1440, "At most 24 hours."),
  watchlist: z
    .string()
    .trim()
    .max(300)
    .optional()
    .transform((value, ctx) => {
      const symbols = [...new Set((value ?? "").split(/[\s,]+/).map((s) => s.trim().toUpperCase()).filter(Boolean))];
      if (symbols.length > 12) {
        ctx.addIssue({ code: "custom", message: "Pin at most 12 symbols." });
        return z.NEVER;
      }
      if (symbols.some((s) => !/^[A-Z0-9.$_-]{1,20}$/.test(s))) {
        ctx.addIssue({ code: "custom", message: "Use ticker symbols separated by commas, e.g. BTC, ETH, SOL." });
        return z.NEVER;
      }
      return symbols;
    }),
});

export const airdropSchema = z
  .object({
    projectName: requiredText(120, "Name the project."),
    tokenSymbol: tokenSymbol.optional().transform((v) => (v ? v : null)),
    cmcSlug,
    description: optionalText(600),
    reward: optionalText(80),
    requirements: optionalText(400),
    startsAt: optionalDate,
    endsAt: optionalDate,
    officialUrl: requiredUrl,
    sourceUrl: optionalUrl,
    verified: checkbox,
    status: z.enum(PUBLISH),
  })
  .refine((d) => !d.startsAt || !d.endsAt || d.endsAt >= d.startsAt, { message: "The end date can't be before the start date.", path: ["endsAt"] });

export const tokenUnlockSchema = z.object({
  tokenName: requiredText(80, "Name the token."),
  tokenSymbol: tokenSymbol.min(1, "Add the ticker symbol."),
  cmcSlug,
  unlockAt: utcDateTime.refine((value) => value !== null, "Choose the unlock date and time."),
  amount: positiveDecimal(1e20, "Enter the number of tokens, e.g. 92650000."),
  percentOfSupply: positiveDecimal(100, "Enter a percentage between 0 and 100."),
  allocation: optionalText(80),
  unlockType: z.enum(["CLIFF", "LINEAR", "OTHER"]),
  description: optionalText(400),
  sourceUrl: requiredUrl,
  verified: checkbox,
  status: z.enum(PUBLISH),
});
