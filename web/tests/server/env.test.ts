import { createEnv } from "@t3-oss/env-core";
import { describe, expect, it } from "vitest";
import { serverSchema } from "@/server/env-schema";

const VALID = {
  DATABASE_URL: "postgres://user:password@localhost:5432/polyqr",
  SESSION_SECRET: "a-session-secret-long-enough",
  APP_URL: "http://localhost:3000",
  SMTP_HOST: "smtp.example.org",
  SMTP_PORT: "465",
  SMTP_USER: "association@example.org",
  SMTP_PASSWORD: "secret",
  SMTP_FROM: "BDE TPS <association@example.org>",
  HELLOASSO_WEBHOOK_SECRET: "webhook-secret",
  HELLOASSO_API_BASE_URL: "https://api.helloasso.com",
  HELLOASSO_CLIENT_ID: "client-id",
  HELLOASSO_CLIENT_SECRET: "client-secret",
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
  it("accepte une configuration valide et convertit SMTP_PORT en nombre", () => {
    const env = parse(VALID);

    expect(env.SMTP_PORT).toBe(465);
    expect(env.DATABASE_URL_TEST).toBeUndefined();
  });

  it.each(Object.keys(VALID))("refuse l'absence de %s", (key) => {
    expect(() => parse({ ...VALID, [key]: undefined })).toThrow();
  });

  it("traite une variable vide comme absente", () => {
    expect(() => parse({ ...VALID, HELLOASSO_CLIENT_ID: "" })).toThrow();
  });

  it.each([
    ["DATABASE_URL", "pas-une-url"],
    ["APP_URL", "localhost"],
    ["HELLOASSO_API_BASE_URL", "api.helloasso.com"],
    ["SMTP_PORT", "abc"],
  ])("refuse %s invalide (%s)", (key, value) => {
    expect(() => parse({ ...VALID, [key]: value })).toThrow();
  });
});
