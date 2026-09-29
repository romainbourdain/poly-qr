import { cookies } from "next/headers";
import { createSafeActionClient } from "next-safe-action";
import {
  ADMIN_SESSION_COOKIE,
  ADMIN_SUBJECT,
  readSessionCookie,
  SCANNER_SESSION_COOKIE,
  verifySessionCookie,
} from "@/server/services/session";
import {
  GENERIC_SERVER_ERROR,
  UNAUTHORIZED_ERROR,
} from "@/shared/lib/form-errors";

function extraireEvenementId(subject: string): string | null {
  const prefix = "scanner:";
  return subject.startsWith(prefix) ? subject.slice(prefix.length) : null;
}

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

/** Admin session: the shared admin password, valid for every event. */
export const adminActionClient = actionClient.use(async ({ next }) => {
  const cookieStore = await cookies();
  const cookie = cookieStore.get(ADMIN_SESSION_COOKIE)?.value;
  if (!(await verifySessionCookie(cookie, ADMIN_SUBJECT))) {
    throw new UnauthorizedError();
  }
  return next();
});

/**
 * Scanner session: issued for one event only. The event id comes from the
 * signed cookie, never from the client, so a scanner cannot act on another event.
 */
export const scannerActionClient = actionClient.use(async ({ next }) => {
  const cookieStore = await cookies();
  const subject = await readSessionCookie(
    cookieStore.get(SCANNER_SESSION_COOKIE)?.value,
  );
  const evenementId = subject ? extraireEvenementId(subject) : null;
  if (!evenementId) throw new UnauthorizedError();
  return next({ ctx: { evenementId } });
});

type ActionResult<T> =
  | { data?: T; serverError?: string; validationErrors?: unknown }
  | undefined;

/**
 * For server components: returns the action's data, or throws so the failure
 * reaches the error boundary instead of rendering as empty data.
 */
export function unwrapAction<T>(result: ActionResult<T>): T {
  if (result?.data === undefined) {
    throw new Error(result?.serverError ?? "Action sans résultat.");
  }
  return result.data;
}
