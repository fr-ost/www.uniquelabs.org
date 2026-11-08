import "server-only";
import { signValue } from "@/lib/security";

/**
 * Issues the signed timestamp embedded in the contact form. The server action
 * rejects tokens that are forged, too fresh (bots) or too old (replays).
 */
export function issueContactFormToken(): string {
  return signValue(String(Date.now()), "contact-form");
}
