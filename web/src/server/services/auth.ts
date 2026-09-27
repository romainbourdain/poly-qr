import { randomBytes, scrypt, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";
import { eq } from "drizzle-orm";
import type { PostgresJsDatabase } from "drizzle-orm/postgres-js";
import type * as schema from "@/server/db/schema";
import { evenements } from "@/server/db/schema";

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
 * Verifies the submitted password against the active event's password.
 * Returns `false` when no event is active, without revealing that fact.
 */
export async function verifyPassword(
  db: PostgresJsDatabase<typeof schema>,
  password: string,
): Promise<boolean> {
  const [activeEvent] = await db
    .select({ passwordHash: evenements.motDePasseHash })
    .from(evenements)
    .where(eq(evenements.actif, true))
    .limit(1);

  if (!activeEvent) return false;

  return passwordMatches(password, activeEvent.passwordHash);
}
