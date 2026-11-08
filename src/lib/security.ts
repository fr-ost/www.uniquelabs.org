import { createHash, createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import { env } from "@/lib/env";

/** URL-safe random token with `bytes` bytes of entropy. */
export function randomToken(bytes = 32): string {
  return randomBytes(bytes).toString("base64url");
}

export function sha256Hex(input: string | Buffer | Uint8Array): string {
  return createHash("sha256").update(input).digest("hex");
}

export function hmacHex(value: string, purpose: string): string {
  return createHmac("sha256", `${env().APP_SECRET}:${purpose}`).update(value).digest("hex");
}

/** Constant-time string comparison (length is not secret here). */
export function safeEqual(a: string, b: string): boolean {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  if (left.length !== right.length) {
    // Still perform a comparison to keep timing roughly uniform.
    timingSafeEqual(left, left);
    return false;
  }
  return timingSafeEqual(left, right);
}

/**
 * Best-effort client IP from proxy headers.
 *
 * The right-most entries of X-Forwarded-For are appended by the proxies in
 * front of the app; anything to their left is client-controlled. With
 * TRUSTED_PROXY_COUNT=1 (one load balancer, e.g. Railway/Render/nginx) the
 * last entry is the address that proxy saw.
 */
export function clientIpFromHeaders(headers: Headers): string {
  const forwarded = headers.get("x-forwarded-for");
  const hops = env().TRUSTED_PROXY_COUNT;
  if (forwarded && hops > 0) {
    const parts = forwarded
      .split(",")
      .map((part) => part.trim())
      .filter(Boolean);
    const candidate = parts[Math.max(0, parts.length - hops)];
    if (candidate) return candidate.slice(0, 64);
  }
  const realIp = headers.get("x-real-ip");
  if (realIp) return realIp.trim().slice(0, 64);
  return "unknown";
}

/** Keyed hash of an IP address. Raw IPs are never stored. */
export function hashIp(ip: string): string {
  return hmacHex(ip, "ip").slice(0, 32);
}

/** Sign a short value so it can round-trip through the browser untampered. */
export function signValue(value: string, purpose: string): string {
  return `${value}.${hmacHex(value, purpose).slice(0, 32)}`;
}

export function verifySignedValue(signed: string, purpose: string): string | null {
  const index = signed.lastIndexOf(".");
  if (index <= 0) return null;
  const value = signed.slice(0, index);
  const signature = signed.slice(index + 1);
  const expected = hmacHex(value, purpose).slice(0, 32);
  return safeEqual(signature, expected) ? value : null;
}
