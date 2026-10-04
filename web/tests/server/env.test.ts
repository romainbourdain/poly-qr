import { createEnv } from "@t3-oss/env-core";
import { describe, expect, it } from "vitest";
import { serverSchema } from "@/server/env-schema";

const VALID = {
  DATABASE_URL: "postgres://user:password@localhost:5432/polyqr",
  SESSION_SECRET: "a-session-secret-long-enough",
  ADMIN_PASSWORD: "an-admin-password",
  APP_URL: "http://localhost:3000",
  SMTP_FROM: "BDE TPS <association@example.org>",
  HELLOASSO_WEBHOOK_SECRET: "webhook-secret",
};

function parse(runtimeEnv: Record<string, string | undefined>) {
  return createEnv({
    server: serverSchema,
    runtimeEnv,
    emptyStringAsUndefined: true,
    skipValidation: false,
  });
}

describe("schéma des variables d'environnement", () => {
  it("accepte une configuration valide sans variables d'envoi optionnelles", () => {
    const env = parse(VALID);

    expect(env.DATABASE_URL_TEST).toBeUndefined();
    expect(env.BREVO_API_KEY).toBeUndefined();
    expect(env.SMTP_HOST).toBeUndefined();
  });

  it("convertit SMTP_PORT en nombre", () => {
    expect(parse({ ...VALID, SMTP_PORT: "465" }).SMTP_PORT).toBe(465);
  });

  it.each(Object.keys(VALID))("refuse l'absence de %s", (key) => {
    expect(() => parse({ ...VALID, [key]: undefined })).toThrow();
  });

  it("traite une variable vide comme absente", () => {
    expect(() => parse({ ...VALID, HELLOASSO_WEBHOOK_SECRET: "" })).toThrow();
  });

  it.each([
    ["DATABASE_URL", "pas-une-url"],
    ["APP_URL", "localhost"],
    ["SMTP_PORT", "abc"],
  ])("refuse %s invalide (%s)", (key, value) => {
    expect(() => parse({ ...VALID, [key]: value })).toThrow();
  });
});
