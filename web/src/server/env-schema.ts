import { z } from "zod";

export const serverSchema = {
  DATABASE_URL: z.url(),
  // Only read by the test suites (`server/db/test-utils`), absent in production.
  DATABASE_URL_TEST: z.url().optional(),
  SESSION_SECRET: z.string().min(1),
  // Mot de passe de l'espace admin (les bénévoles du scanner ont, eux, un mot de passe par événement).
  ADMIN_PASSWORD: z.string().min(1),
  APP_URL: z.url(),
  SMTP_HOST: z.string().min(1),
  SMTP_PORT: z.coerce.number().int().positive(),
  SMTP_USER: z.string().min(1),
  SMTP_PASSWORD: z.string().min(1),
  SMTP_FROM: z.string().min(1),
  HELLOASSO_WEBHOOK_SECRET: z.string().min(1),
  HELLOASSO_API_BASE_URL: z.url(),
  HELLOASSO_CLIENT_ID: z.string().min(1),
  HELLOASSO_CLIENT_SECRET: z.string().min(1),
};
