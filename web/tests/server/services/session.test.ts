import { beforeAll, describe, expect, it } from "vitest";
import {
  createSessionCookie,
  verifySessionCookie,
} from "@/server/services/session";

describe("service session (cookie signé)", () => {
  beforeAll(() => {
    process.env.SESSION_SECRET = "test-secret-not-for-production";
  });

  it("valide une session fraîchement créée", async () => {
    const { value } = await createSessionCookie();

    await expect(verifySessionCookie(value)).resolves.toBe(true);
  });

  it("refuse une valeur absente", async () => {
    await expect(verifySessionCookie(undefined)).resolves.toBe(false);
  });

  it("refuse une signature altérée", async () => {
    const { value } = await createSessionCookie();
    const [payload] = value.split(".");
    const tampered = `${payload}.0000000000000000000000000000000000000000000000000000000000000000`;

    await expect(verifySessionCookie(tampered)).resolves.toBe(false);
  });

  it("refuse un payload altéré (expiration repoussée sans re-signature)", async () => {
    const { value } = await createSessionCookie();
    const [, signature] = value.split(".");
    const tampered = `9999999999999.${signature}`;

    await expect(verifySessionCookie(tampered)).resolves.toBe(false);
  });

  it("refuse une session expirée", async () => {
    const now = Date.now();
    const { value } = await createSessionCookie(now - 13 * 60 * 60 * 1000);

    await expect(verifySessionCookie(value, now)).resolves.toBe(false);
  });

  it("refuse une valeur mal formée", async () => {
    await expect(verifySessionCookie("sans-point")).resolves.toBe(false);
  });
});
