"use server";

import { cookies } from "next/headers";
import { db } from "@/server/db/client";
import { verifyPassword } from "@/server/services/auth";
import { createSessionCookie, SESSION_COOKIE } from "@/server/services/session";

export async function login(
  password: string,
): Promise<{ success: true } | { success: false; error: string }> {
  const valid = await verifyPassword(db, password);
  if (!valid) {
    return { success: false, error: "Mot de passe incorrect." };
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

  return { success: true };
}
