import { cookies } from "next/headers";
import { createSafeActionClient } from "next-safe-action";
import { SESSION_COOKIE, verifySessionCookie } from "@/server/services/session";
import {
  GENERIC_SERVER_ERROR,
  UNAUTHORIZED_ERROR,
} from "@/shared/lib/form-errors";

/** Thrown by middlewares; surfaced to the client as-is (no internal detail). */
class UnauthorizedError extends Error {}

/**
 * Base client: validation errors are flattened per field, and any unexpected
 * error is logged server-side then replaced by a generic message.
 */
export const actionClient = createSafeActionClient({
  defaultValidationErrorsShape: "flattened",
  handleServerError(error) {
    if (error instanceof UnauthorizedError) return UNAUTHORIZED_ERROR;
    console.error("Erreur inattendue dans une server action", error);
    return GENERIC_SERVER_ERROR;
  },
});

async function requireSession() {
  const cookieStore = await cookies();
  if (!(await verifySessionCookie(cookieStore.get(SESSION_COOKIE)?.value))) {
    throw new UnauthorizedError();
  }
}

/**
 * Admin and scanner volunteers currently share one password and one session
 * cookie (see DECISIONS.md), so both clients enforce the same check. They stay
 * separate so a per-role session can be introduced without touching actions.
 */
export const adminActionClient = actionClient.use(async ({ next }) => {
  await requireSession();
  return next();
});

export const scannerActionClient = actionClient.use(async ({ next }) => {
  await requireSession();
  return next();
});
