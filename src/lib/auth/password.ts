import { hash, verify } from "@node-rs/argon2";

/**
 * Password hashing with Argon2id (the library default algorithm) using the
 * OWASP-recommended baseline: 19 MiB memory, 2 iterations, parallelism 1.
 */
const ARGON2_OPTIONS = {
  memoryCost: 19456,
  timeCost: 2,
  parallelism: 1,
  outputLen: 32,
} as const;

export const PASSWORD_MIN_LENGTH = 12;
export const PASSWORD_MAX_LENGTH = 256;

export async function hashPassword(password: string): Promise<string> {
  return hash(password.normalize("NFKC"), ARGON2_OPTIONS);
}

export async function verifyPassword(passwordHash: string, password: string): Promise<boolean> {
  try {
    return await verify(passwordHash, password.normalize("NFKC"));
  } catch {
    return false;
  }
}

// A deliberately small deny-list of the most common choices; length is the
// primary defence. Comparison is case-insensitive on a normalised value.
const COMMON_PASSWORDS = new Set([
  "password",
  "password123",
  "password1234",
  "123456789012",
  "qwertyuiopas",
  "letmein12345",
  "welcome12345",
  "administrator",
  "uniquelabs",
  "uniquelabs123",
  "admin1234567",
  "changeme1234",
  "iloveyou1234",
]);

/** Returns a human-readable problem with the password, or null if acceptable. */
export function passwordProblem(password: string, context: string[] = []): string | null {
  if (password.length < PASSWORD_MIN_LENGTH) {
    return `Use at least ${PASSWORD_MIN_LENGTH} characters.`;
  }
  if (password.length > PASSWORD_MAX_LENGTH) {
    return `Use at most ${PASSWORD_MAX_LENGTH} characters.`;
  }
  const normalised = password.toLowerCase().replace(/[^a-z0-9]/g, "");
  if (COMMON_PASSWORDS.has(normalised) || COMMON_PASSWORDS.has(password.toLowerCase())) {
    return "This password is too common.";
  }
  if (/^(.)\1+$/.test(password)) {
    return "Avoid repeating a single character.";
  }
  if (new Set(password).size < 5) {
    return "Use a more varied mix of characters.";
  }
  for (const word of context) {
    const cleaned = word.toLowerCase().trim();
    if (cleaned.length >= 4 && password.toLowerCase().includes(cleaned)) {
      return "Don't include your name or email address in the password.";
    }
  }
  return null;
}
