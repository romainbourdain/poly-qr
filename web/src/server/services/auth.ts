import { createHash, randomBytes, scrypt, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";
import { eq } from "drizzle-orm";
import type { PostgresJsDatabase } from "drizzle-orm/postgres-js";
import type * as schema from "@/server/db/schema";
import { evenements } from "@/server/db/schema";
import { env } from "@/server/env";

const scryptAsync = promisify(scrypt);
const KEY_LENGTH = 64;

/**
 * Hashes a plaintext password for storage (`evenements.mot_de_passe_hash`).
 * Format `<salt-hex>:<hash-hex>`, scrypt (Node built-in, no extra native dependency).
 */
export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString("hex");
  const hash = (await scryptAsync(password, salt, KEY_LENGTH)) as Buffer;
  return `${salt}:${hash.toString("hex")}`;
}

async function passwordMatches(
  password: string,
  storedHash: string,
): Promise<boolean> {
  const [salt, expectedHash] = storedHash.split(":");
  if (!salt || !expectedHash) return false;

  const expectedHashBuffer = Buffer.from(expectedHash, "hex");
  const candidateHash = (await scryptAsync(
    password,
    salt,
    expectedHashBuffer.length,
  )) as Buffer;

  return (
    candidateHash.length === expectedHashBuffer.length &&
    timingSafeEqual(candidateHash, expectedHashBuffer)
  );
}

/**
 * Verifies the submitted password against one event's volunteer password
 * (scanner access). Returns `false` for an unknown event, without revealing it.
 */
export async function verifyEventPassword(
  db: PostgresJsDatabase<typeof schema>,
  evenementId: string,
  password: string,
): Promise<boolean> {
  const [event] = await db
    .select({ passwordHash: evenements.motDePasseHash })
    .from(evenements)
    .where(eq(evenements.id, evenementId))
    .limit(1);

  if (!event) return false;

  return passwordMatches(password, event.passwordHash);
}

/** Verifies the submitted password against the global admin password (`ADMIN_PASSWORD`). */
export function verifyAdminPassword(password: string): boolean {
  // Hash both sides so the comparison is constant-time whatever the lengths.
  const digest = (value: string) => createHash("sha256").update(value).digest();
  return timingSafeEqual(digest(password), digest(env.ADMIN_PASSWORD));
}
