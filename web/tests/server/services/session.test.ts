import { beforeAll, describe, expect, it } from "vitest";
import {
  ADMIN_SUBJECT,
  createSessionCookie,
  readSessionCookie,
  scannerSubject,
  verifySessionCookie,
} from "@/server/services/session";

const EVENEMENT = "5b1c8f0e-1c1e-4f1a-9a55-2f4b8d3c9e10";

describe("service session (cookie signé)", () => {
  beforeAll(() => {
    process.env.SESSION_SECRET = "test-secret-not-for-production";
  });

  it("valide une session fraîchement créée pour son sujet", async () => {
    const { value } = await createSessionCookie(ADMIN_SUBJECT);

    await expect(verifySessionCookie(value, ADMIN_SUBJECT)).resolves.toBe(true);
  });

  it("refuse une valeur absente", async () => {
    await expect(verifySessionCookie(undefined, ADMIN_SUBJECT)).resolves.toBe(
      false,
    );
  });

  it("refuse une session émise pour un autre sujet", async () => {
    const admin = await createSessionCookie(ADMIN_SUBJECT);
    const scanner = await createSessionCookie(scannerSubject(EVENEMENT));

    await expect(
      verifySessionCookie(admin.value, scannerSubject(EVENEMENT)),
    ).resolves.toBe(false);
    await expect(
      verifySessionCookie(scanner.value, ADMIN_SUBJECT),
    ).resolves.toBe(false);
  });

  it("une session de scanner ne vaut que pour son événement", async () => {
    const { value } = await createSessionCookie(scannerSubject(EVENEMENT));

    await expect(
      verifySessionCookie(value, scannerSubject(EVENEMENT)),
    ).resolves.toBe(true);
    await expect(
      verifySessionCookie(
        value,
        scannerSubject("00000000-0000-4000-8000-000000000000"),
      ),
    ).resolves.toBe(false);
  });

  it("readSessionCookie renvoie le sujet d'une session valide", async () => {
    const { value } = await createSessionCookie(scannerSubject(EVENEMENT));

    await expect(readSessionCookie(value)).resolves.toBe(
      scannerSubject(EVENEMENT),
    );
  });

  it("refuse une signature altérée", async () => {
    const { value } = await createSessionCookie(ADMIN_SUBJECT);
    const [subject, expiration] = value.split(".");
    const tampered = `${subject}.${expiration}.${"0".repeat(64)}`;

    await expect(verifySessionCookie(tampered, ADMIN_SUBJECT)).resolves.toBe(
      false,
    );
  });

  it("refuse un payload altéré (expiration repoussée ou sujet changé sans re-signature)", async () => {
    const { value } = await createSessionCookie(ADMIN_SUBJECT);
    const [subject, , signature] = value.split(".");

    await expect(
      verifySessionCookie(
        `${subject}.9999999999999.${signature}`,
        ADMIN_SUBJECT,
      ),
    ).resolves.toBe(false);
    await expect(
      readSessionCookie(`scanner:${EVENEMENT}.9999999999999.${signature}`),
    ).resolves.toBeNull();
  });

  it("refuse une session expirée", async () => {
    const now = Date.now();
    const { value } = await createSessionCookie(
      ADMIN_SUBJECT,
      now - 13 * 60 * 60 * 1000,
    );

    await expect(verifySessionCookie(value, ADMIN_SUBJECT, now)).resolves.toBe(
      false,
    );
  });

  it("refuse une valeur mal formée", async () => {
    await expect(
      verifySessionCookie("sans-point", ADMIN_SUBJECT),
    ).resolves.toBe(false);
  });
});
