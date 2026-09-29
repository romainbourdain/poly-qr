"use server";

import { cookies } from "next/headers";
import { returnValidationErrors } from "next-safe-action";
import { actionClient } from "@/server/actions/safe-action";
import { db } from "@/server/db/client";
import {
  verifyAdminPassword,
  verifyEventPassword,
} from "@/server/services/auth";
import {
  ADMIN_SESSION_COOKIE,
  ADMIN_SUBJECT,
  createSessionCookie,
  SCANNER_SESSION_COOKIE,
  scannerSubject,
} from "@/server/services/session";
import { evenementIdSchema } from "@/shared/validators/commande";
import { loginSchema } from "@/shared/validators/login";

async function poserSession(cookieName: string, subject: string) {
  const { value, expiresAt } = await createSessionCookie(subject);
  const cookieStore = await cookies();
  cookieStore.set(cookieName, value, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: expiresAt,
  });
}

const MOT_DE_PASSE_INCORRECT = {
  password: { _errors: ["Mot de passe incorrect."] },
};

/** Connexion à l'espace admin (mot de passe global). */
export const loginAdmin = actionClient
  .inputSchema(loginSchema)
  .action(async ({ parsedInput: { password } }) => {
    if (!verifyAdminPassword(password)) {
      returnValidationErrors(loginSchema, MOT_DE_PASSE_INCORRECT);
    }
    await poserSession(ADMIN_SESSION_COOKIE, ADMIN_SUBJECT);
    return { success: true as const };
  });

const loginScannerSchema = loginSchema.extend({
  evenementId: evenementIdSchema,
});

/** Connexion des bénévoles au scanner d'un événement (mot de passe de l'événement). */
export const loginScanner = actionClient
  .inputSchema(loginScannerSchema)
  .action(async ({ parsedInput: { evenementId, password } }) => {
    if (!(await verifyEventPassword(db, evenementId, password))) {
      returnValidationErrors(loginScannerSchema, MOT_DE_PASSE_INCORRECT);
    }
    await poserSession(SCANNER_SESSION_COOKIE, scannerSubject(evenementId));
    return { success: true as const };
  });
