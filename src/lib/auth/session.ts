import "server-only";
import { cookies, headers } from "next/headers";
import { cache } from "react";
import { prisma } from "@/lib/db";
import { env } from "@/lib/env";
import { clientIpFromHeaders, hashIp, randomToken, sha256Hex } from "@/lib/security";
import type { AdminRole } from "@/generated/prisma/enums";

export interface AdminIdentity {
  id: string;
  email: string;
  name: string;
  role: AdminRole;
}

export interface AdminSessionInfo {
  sessionId: string;
  user: AdminIdentity;
}

function shouldUseSecureCookie(): boolean {
  const config = env();
  return config.isProduction && config.siteOrigin.startsWith("https://");
}

/** `__Host-` cookies are bound to this exact origin: Secure, Path=/, no Domain. */
export function sessionCookieName(): string {
  return shouldUseSecureCookie() ? "__Host-ul_session" : "ul_session";
}

export async function createSession(userId: string): Promise<void> {
  const config = env();
  const token = randomToken(32);
  const expiresAt = new Date(Date.now() + config.SESSION_TTL_HOURS * 60 * 60 * 1000);
  const requestHeaders = await headers();

  await prisma.adminSession.create({
    data: {
      tokenHash: sha256Hex(token),
      userId,
      expiresAt,
      ipHash: hashIp(clientIpFromHeaders(requestHeaders)),
      userAgent: requestHeaders.get("user-agent")?.slice(0, 200) ?? null,
    },
  });

  const store = await cookies();
  store.set(sessionCookieName(), token, {
    httpOnly: true,
    secure: shouldUseSecureCookie(),
    sameSite: "strict",
    path: "/",
    expires: expiresAt,
    priority: "high",
  });
}

/**
 * Resolve the current admin session from the HttpOnly cookie. Verified
 * server-side against the database on every request (memoised per request).
 */
export const getSession = cache(async (): Promise<AdminSessionInfo | null> => {
  const store = await cookies();
  const token = store.get(sessionCookieName())?.value;
  if (!token || token.length < 20 || token.length > 128) return null;

  const session = await prisma.adminSession.findUnique({
    where: { tokenHash: sha256Hex(token) },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          isActive: true,
          passwordChangedAt: true,
        },
      },
    },
  });
  if (!session) return null;

  const now = Date.now();
  const idleLimit = env().SESSION_IDLE_MINUTES * 60 * 1000;
  const expired =
    session.expiresAt.getTime() <= now ||
    session.lastSeenAt.getTime() + idleLimit <= now ||
    !session.user.isActive ||
    session.createdAt.getTime() < session.user.passwordChangedAt.getTime() - 1000;

  if (expired) {
    await prisma.adminSession.delete({ where: { id: session.id } }).catch(() => undefined);
    return null;
  }

  // Sliding idle timeout, written at most once a minute.
  if (now - session.lastSeenAt.getTime() > 60 * 1000) {
    await prisma.adminSession
      .update({ where: { id: session.id }, data: { lastSeenAt: new Date(now) } })
      .catch(() => undefined);
  }

  const { id, email, name, role } = session.user;
  return { sessionId: session.id, user: { id, email, name, role } };
});

export async function destroyCurrentSession(): Promise<void> {
  const store = await cookies();
  const name = sessionCookieName();
  const token = store.get(name)?.value;
  if (token) {
    await prisma.adminSession.deleteMany({ where: { tokenHash: sha256Hex(token) } });
  }
  store.set(name, "", {
    httpOnly: true,
    secure: shouldUseSecureCookie(),
    sameSite: "strict",
    path: "/",
    expires: new Date(0),
  });
}

export async function destroyAllSessionsForUser(userId: string, exceptSessionId?: string) {
  await prisma.adminSession.deleteMany({
    where: { userId, ...(exceptSessionId ? { id: { not: exceptSessionId } } : {}) },
  });
}
