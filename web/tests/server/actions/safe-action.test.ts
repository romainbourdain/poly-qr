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
} from "@/server/actions/safe-action";
import { createSessionCookie } from "@/server/services/session";
import {
  GENERIC_SERVER_ERROR,
  UNAUTHORIZED_ERROR,
} from "@/shared/lib/form-errors";

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
      cookieJar.value = "123.deadbeef";
      const result = await action();
      expect(result?.serverError).toBe(UNAUTHORIZED_ERROR);
    });

    it("laisse passer une session valide", async () => {
      cookieJar.value = (await createSessionCookie()).value;
      const result = await action();
      expect(result?.data).toBe("ok");
      expect(result?.serverError).toBeUndefined();
    });
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
});
