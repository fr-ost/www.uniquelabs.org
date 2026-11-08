import { z } from "zod";

/**
 * Environment validation.
 *
 * Parsed lazily on first use so that `next build` (which never touches the
 * database — public pages render at request time) does not require runtime
 * secrets. Every server entry point that needs configuration calls `env()`.
 */

const booleanString = z
  .enum(["true", "false", "1", "0", ""])
  .optional()
  .transform((value) => value === "true" || value === "1");

const schema = z
  .object({
    NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
    DATABASE_URL: z
      .string({ error: "DATABASE_URL is required" })
      .min(1, "DATABASE_URL is required")
      .refine((value) => /^postgres(ql)?:\/\//.test(value), {
        message: "DATABASE_URL must be a PostgreSQL connection string",
      }),
    SITE_URL: z
      .url({ protocol: /^https?$/ })
      .default("https://www.uniquelabs.org")
      .transform((value) => value.replace(/\/+$/, "")),
    APP_SECRET: z.string().optional(),
    ADMIN_SETUP_TOKEN: z.string().optional(),
    SESSION_TTL_HOURS: z.coerce.number().int().min(1).max(168).default(12),
    SESSION_IDLE_MINUTES: z.coerce.number().int().min(5).max(1440).default(120),
    TRUSTED_PROXY_COUNT: z.coerce.number().int().min(0).max(5).default(1),
    MEDIA_STORAGE: z.enum(["database", "filesystem"]).default("database"),
    MEDIA_DIR: z.string().default("./storage/media"),
    MEDIA_MAX_UPLOAD_MB: z.coerce.number().positive().max(50).default(10),
    IMPORT_TMP_DIR: z.string().optional(),
    IMPORT_MAX_UPLOAD_MB: z.coerce.number().int().positive().max(8192).default(2048),
    CANONICAL_REDIRECT: booleanString,
    ALLOW_PLACEHOLDER_CONTENT: booleanString,
  })
  .superRefine((value, ctx) => {
    const secret = value.APP_SECRET ?? "";
    if (value.NODE_ENV === "production") {
      if (secret.length < 32) {
        ctx.addIssue({
          code: "custom",
          path: ["APP_SECRET"],
          message: "APP_SECRET must be set to at least 32 random characters in production",
        });
      }
      if (/change-me|dev-only|example/i.test(secret)) {
        ctx.addIssue({
          code: "custom",
          path: ["APP_SECRET"],
          message: "APP_SECRET still contains a placeholder value",
        });
      }
    }
    if (value.ADMIN_SETUP_TOKEN !== undefined && value.ADMIN_SETUP_TOKEN !== "") {
      if (value.ADMIN_SETUP_TOKEN.length < 24) {
        ctx.addIssue({
          code: "custom",
          path: ["ADMIN_SETUP_TOKEN"],
          message: "ADMIN_SETUP_TOKEN must be at least 24 characters",
        });
      }
    }
  });

export type Env = Omit<z.infer<typeof schema>, "APP_SECRET"> & {
  APP_SECRET: string;
  isProduction: boolean;
  siteOrigin: string;
  siteHost: string;
};

let cached: Env | undefined;

export function env(): Env {
  if (cached) return cached;
  const parsed = schema.safeParse(process.env);
  if (!parsed.success) {
    const details = parsed.error.issues
      .map((issue) => `  - ${issue.path.join(".") || "env"}: ${issue.message}`)
      .join("\n");
    throw new Error(`Invalid environment configuration:\n${details}`);
  }
  const data = parsed.data;
  const site = new URL(data.SITE_URL);
  cached = {
    ...data,
    // Development fallback only; production requires a real secret (validated above).
    APP_SECRET: data.APP_SECRET || "development-only-insecure-secret-do-not-use-in-production",
    isProduction: data.NODE_ENV === "production",
    siteOrigin: site.origin,
    siteHost: site.host,
  };
  return cached;
}

/** For tests: forget the cached environment. */
export function resetEnvCache() {
  cached = undefined;
}

/** Public site URL without requiring the full environment (safe at build time). */
export function siteUrl(): string {
  return (process.env.SITE_URL ?? "https://www.uniquelabs.org").replace(/\/+$/, "");
}

/**
 * Placeholder (sample) content is never shown on a production deployment.
 * It can be previewed locally in a production build only when explicitly
 * allowed AND the site URL points at localhost.
 */
export function placeholdersVisible(): boolean {
  if (process.env.NODE_ENV !== "production") return true;
  if (process.env.ALLOW_PLACEHOLDER_CONTENT !== "true") return false;
  try {
    const host = new URL(siteUrl()).hostname;
    return host === "localhost" || host === "127.0.0.1";
  } catch {
    return false;
  }
}
