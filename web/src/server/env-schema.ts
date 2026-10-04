import { z } from "zod";

export const serverSchema = {
  DATABASE_URL: z.url(),
  // Only read by the test suites (`server/db/test-utils`), absent in production.
  DATABASE_URL_TEST: z.url().optional(),
  SESSION_SECRET: z.string().min(1),
  // Mot de passe de l'espace admin (les bénévoles du scanner ont, eux, un mot de passe par événement).
  ADMIN_PASSWORD: z.string().min(1),
  APP_URL: z.url(),
  // Expéditeur ("Nom <adresse>"), commun aux deux modes d'envoi.
  SMTP_FROM: z.string().min(1),
  // Mode API Brevo (HTTPS, port 443) : prioritaire sur SMTP s'il est renseigné.
  // Utile quand l'hébergeur filtre les ports SMTP sortants.
  BREVO_API_KEY: z.string().min(1).optional(),
  // Mode SMTP : requis seulement si BREVO_API_KEY est absente (vérifié à l'envoi).
  SMTP_HOST: z.string().min(1).optional(),
  SMTP_PORT: z.coerce.number().int().positive().optional(),
  SMTP_USER: z.string().min(1).optional(),
  SMTP_PASSWORD: z.string().min(1).optional(),
  HELLOASSO_WEBHOOK_SECRET: z.string().min(1),
};
