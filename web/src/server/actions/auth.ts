"use server";

import { cookies } from "next/headers";
import { returnValidationErrors } from "next-safe-action";
import { actionClient } from "@/server/actions/safe-action";
import { db } from "@/server/db/client";
import { verifyPassword } from "@/server/services/auth";
import { createSessionCookie, SESSION_COOKIE } from "@/server/services/session";
import { loginSchema } from "@/shared/validators/login";

export const login = actionClient
  .inputSchema(loginSchema)
  .action(async ({ parsedInput: { password } }) => {
    if (!(await verifyPassword(db, password))) {
      returnValidationErrors(loginSchema, {
        password: { _errors: ["Mot de passe incorrect."] },
      });
    }

    const { value, expiresAt } = await createSessionCookie();
    const cookieStore = await cookies();
    cookieStore.set(SESSION_COOKIE, value, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      expires: expiresAt,
    });

    return { success: true as const };
  });
