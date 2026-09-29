import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { z } from "zod";

const cookieJar = vi.hoisted(() => ({
  value: undefined as string | undefined,
}));

vi.mock("next/headers", () => ({
  cookies: async () => ({
    get: (name: string) =>
      cookieJar.value === undefined
        ? undefined
        : { name, value: cookieJar.value },
  }),
}));

import {
  actionClient,
  adminActionClient,
  scannerActionClient,
  unwrapAction,
} from "@/server/actions/safe-action";
import {
  ADMIN_SUBJECT,
  createSessionCookie,
  scannerSubject,
} from "@/server/services/session";
import {
  GENERIC_SERVER_ERROR,
  UNAUTHORIZED_ERROR,
} from "@/shared/lib/form-errors";

const EVENEMENT = "5b1c8f0e-1c1e-4f1a-9a55-2f4b8d3c9e10";

describe("clients next-safe-action", () => {
  beforeAll(() => {
    process.env.SESSION_SECRET = "test-secret-not-for-production";
  });

  beforeEach(() => {
    cookieJar.value = undefined;
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  describe.each([
    ["admin", adminActionClient],
    ["scanner", scannerActionClient],
  ])("client %s", (_name, client) => {
    const action = client.action(async () => "ok");

    it("refuse sans cookie de session", async () => {
      const result = await action();
      expect(result?.data).toBeUndefined();
      expect(result?.serverError).toBe(UNAUTHORIZED_ERROR);
    });

    it("refuse un cookie invalide", async () => {
      cookieJar.value = "admin.123.deadbeef";
      const result = await action();
      expect(result?.serverError).toBe(UNAUTHORIZED_ERROR);
    });
  });

  it("le client admin laisse passer une session admin, pas une session de scanner", async () => {
    const action = adminActionClient.action(async () => "ok");

    cookieJar.value = (await createSessionCookie(ADMIN_SUBJECT)).value;
    expect((await action())?.data).toBe("ok");

    cookieJar.value = (
      await createSessionCookie(scannerSubject(EVENEMENT))
    ).value;
    expect((await action())?.serverError).toBe(UNAUTHORIZED_ERROR);
  });

  it("le client scanner expose l'événement de la session, pas une session admin", async () => {
    const action = scannerActionClient.action(
      async ({ ctx }) => ctx.evenementId,
    );

    cookieJar.value = (
      await createSessionCookie(scannerSubject(EVENEMENT))
    ).value;
    expect((await action())?.data).toBe(EVENEMENT);

    cookieJar.value = (await createSessionCookie(ADMIN_SUBJECT)).value;
    expect((await action())?.serverError).toBe(UNAUTHORIZED_ERROR);
  });

  it("le client de base n'exige pas de session", async () => {
    const result = await actionClient.action(async () => "public")();
    expect(result?.data).toBe("public");
  });

  it("renvoie les erreurs de validation par champ", async () => {
    const action = actionClient
      .inputSchema(z.object({ nom: z.string().min(1, "Le nom est requis.") }))
      .action(async () => "ok");

    const result = await action({ nom: "" });

    expect(result?.data).toBeUndefined();
    expect(result?.validationErrors).toEqual({
      formErrors: [],
      fieldErrors: { nom: ["Le nom est requis."] },
    });
  });

  it("n'exécute pas l'action si l'authentification échoue, même avec une entrée valide", async () => {
    const spy = vi.fn(async () => "ok");
    const result = await adminActionClient.action(spy)();
    expect(spy).not.toHaveBeenCalled();
    expect(result?.serverError).toBe(UNAUTHORIZED_ERROR);
  });

  it("masque les erreurs inattendues derrière un message générique", async () => {
    const action = actionClient.action(async () => {
      throw new Error("connection to postgres://user:secret@db failed");
    });

    const result = await action();

    expect(result?.serverError).toBe(GENERIC_SERVER_ERROR);
    expect(JSON.stringify(result)).not.toContain("secret");
    expect(console.error).toHaveBeenCalled();
  });

  describe("unwrapAction", () => {
    it("renvoie les données", () => {
      expect(unwrapAction({ data: [1] })).toEqual([1]);
    });

    it("accepte null comme donnée valide", () => {
      expect(unwrapAction({ data: null })).toBeNull();
    });

    it("lève l'erreur serveur plutôt que de renvoyer du vide", () => {
      expect(() => unwrapAction({ serverError: UNAUTHORIZED_ERROR })).toThrow(
        UNAUTHORIZED_ERROR,
      );
      expect(() => unwrapAction(undefined)).toThrow();
    });
  });
});
