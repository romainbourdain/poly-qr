/** Flattened validation errors as returned by next-safe-action. */
export type FlattenedErrors = {
  formErrors: string[];
  fieldErrors: Record<string, string[] | undefined>;
};

/**
 * Maps next-safe-action's flattened `validationErrors` to the shape TanStack
 * Form expects from an async submit validator (`{ form, fields }`), or
 * `undefined` when there is nothing to report.
 */
export function toFormErrors(
  validationErrors: FlattenedErrors | undefined,
): { form?: string; fields: Record<string, string> } | undefined {
  if (!validationErrors) return undefined;
  const fields: Record<string, string> = {};
  for (const [name, messages] of Object.entries(validationErrors.fieldErrors)) {
    if (messages?.length) fields[name] = messages.join(", ");
  }
  const form = validationErrors.formErrors.join(", ") || undefined;
  if (!form && Object.keys(fields).length === 0) return undefined;
  return { form, fields };
}

export const GENERIC_SERVER_ERROR = "Une erreur est survenue. Réessaie.";
export const UNAUTHORIZED_ERROR = "Session expirée. Reconnecte-toi.";

type ActionResultLike =
  | { validationErrors?: FlattenedErrors; serverError?: string }
  | undefined;

/**
 * Turns a failed safe-action result into TanStack Form submit errors:
 * field errors on their fields, a server error (or generic fallback) on the form.
 */
export function actionErrorsToForm(result: ActionResultLike): {
  form?: string;
  fields: Record<string, string>;
} {
  return (
    toFormErrors(result?.validationErrors) ?? {
      form: result?.serverError ?? GENERIC_SERVER_ERROR,
      fields: {},
    }
  );
}
