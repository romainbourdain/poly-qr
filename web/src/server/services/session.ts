// Web Crypto (not `node:crypto`): this module is imported by `proxy.ts`,
// which runs in the Edge runtime by default — no access to the `node:crypto` API.

import { env } from "@/server/env";

export const ADMIN_SESSION_COOKIE = "polyqr_admin";
export const SCANNER_SESSION_COOKIE = "polyqr_scanner";

/** Sujet de session : l'admin, ou le scanner d'un événement précis (jamais valable pour un autre). */
export const ADMIN_SUBJECT = "admin";
export const scannerSubject = (evenementId: string) => `scanner:${evenementId}`;
const SESSION_DURATION_MS = 12 * 60 * 60 * 1000; // 12h, well beyond a single event

function hexToBytes(hex: string): Uint8Array | null {
  if (hex.length === 0 || hex.length % 2 !== 0) return null;
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < bytes.length; i++) {
    const byte = Number.parseInt(hex.slice(i * 2, i * 2 + 2), 16);
    if (Number.isNaN(byte)) return null;
    bytes[i] = byte;
  }
  return bytes;
}

function bytesToHex(buffer: ArrayBuffer): string {
  return Array.from(new Uint8Array(buffer))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

async function hmacKey(): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(env.SESSION_SECRET),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"],
  );
}

async function sign(payload: string): Promise<string> {
  const signature = await crypto.subtle.sign(
    "HMAC",
    await hmacKey(),
    new TextEncoder().encode(payload),
  );
  return bytesToHex(signature);
}

/** Builds the session cookie value: `<subject>.<expiration>.<signature>` (subject has no dot). */
export async function createSessionCookie(
  subject: string,
  now: number = Date.now(),
): Promise<{ value: string; expiresAt: Date }> {
  const expiresAt = now + SESSION_DURATION_MS;
  const payload = `${subject}.${expiresAt}`;
  const value = `${payload}.${await sign(payload)}`;
  return { value, expiresAt: new Date(expiresAt) };
}

function constantTimeEqual(a: Uint8Array, b: Uint8Array): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) {
    diff |= a[i] ^ b[i];
  }
  return diff === 0;
}

/**
 * Returns the session's subject when the signature and expiration are valid,
 * `null` otherwise. Callers compare it with the subject they expect.
 */
export async function readSessionCookie(
  value: string | undefined,
  now: number = Date.now(),
): Promise<string | null> {
  if (!value) return null;

  const [subject, expiration, signature] = value.split(".");
  if (!subject || !expiration || !signature) return null;

  const signatureBytes = hexToBytes(signature);
  if (!signatureBytes) return null;

  const expectedSignatureBytes = hexToBytes(
    await sign(`${subject}.${expiration}`),
  );
  if (!expectedSignatureBytes) return null;

  if (!constantTimeEqual(signatureBytes, expectedSignatureBytes)) return null;

  const expiresAt = Number(expiration);
  return Number.isFinite(expiresAt) && expiresAt > now ? subject : null;
}

/** Verifies the cookie is valid AND was issued for `subject`. */
export async function verifySessionCookie(
  value: string | undefined,
  subject: string,
  now: number = Date.now(),
): Promise<boolean> {
  return (await readSessionCookie(value, now)) === subject;
}
