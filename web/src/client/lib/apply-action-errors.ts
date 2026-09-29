import type { AnyFormApi } from "@tanstack/react-form";

/**
 * Attaches per-field messages (from `actionErrorsToForm`) to a TanStack form as
 * submit errors, so they show on the matching fields like client-side ones and
 * clear on the next edit.
 */
export function applyFieldErrors(
  form: AnyFormApi,
  fields: Record<string, string>,
) {
  for (const [name, message] of Object.entries(fields)) {
    form.setFieldMeta(name, (meta) => ({
      ...meta,
      errorMap: { ...meta.errorMap, onSubmit: message },
    }));
  }
}
