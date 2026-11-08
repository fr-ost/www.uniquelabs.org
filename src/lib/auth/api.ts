import "server-only";
import { getSession, type AdminSessionInfo } from "@/lib/auth/session";
import { env } from "@/lib/env";
import type { AdminRole } from "@/generated/prisma/enums";

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}

/**
 * CSRF defence for admin route handlers: state-changing requests must come
 * from this site's own origin (Origin header), and carry a custom header that
 * cross-site forms cannot set. Session cookies are also SameSite=Strict.
 */
function assertSameOrigin(request: Request) {
  const origin = request.headers.get("origin");
  const host = request.headers.get("x-forwarded-host") ?? request.headers.get("host");
  const allowed = new Set<string>([env().siteOrigin]);
  if (host) {
    allowed.add(`https://${host}`);
    allowed.add(`http://${host}`);
  }
  if (!origin || !allowed.has(origin)) {
    throw new ApiError(403, "Cross-origin request rejected.");
  }
  if (request.headers.get("x-requested-with") !== "uniquelabs-admin") {
    throw new ApiError(403, "Missing request header.");
  }
}

export async function requireApiAdmin(request: Request, role?: AdminRole): Promise<AdminSessionInfo> {
  if (request.method !== "GET" && request.method !== "HEAD") {
    assertSameOrigin(request);
  }
  const session = await getSession();
  if (!session) throw new ApiError(401, "Your session has expired. Please sign in again.");
  if (role === "OWNER" && session.user.role !== "OWNER") throw new ApiError(403, "Only owners can do this.");
  return session;
}

export function apiErrorResponse(error: unknown): Response {
  if (error instanceof ApiError) {
    return Response.json({ error: error.message }, { status: error.status });
  }
  console.error("[api] unexpected error", error);
  return Response.json({ error: "Something went wrong. Please try again." }, { status: 500 });
}

/** Reads a request body into memory with a hard byte limit. */
export async function readBodyLimited(request: Request, maxBytes: number): Promise<Buffer> {
  const declared = Number(request.headers.get("content-length") ?? "0");
  if (declared > maxBytes) throw new ApiError(413, `File is too large (max ${Math.round(maxBytes / 1024 / 1024)} MB).`);
  if (!request.body) throw new ApiError(400, "Empty upload.");
  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let total = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    total += value.byteLength;
    if (total > maxBytes) {
      await reader.cancel().catch(() => undefined);
      throw new ApiError(413, `File is too large (max ${Math.round(maxBytes / 1024 / 1024)} MB).`);
    }
    chunks.push(value);
  }
  return Buffer.concat(chunks);
}
