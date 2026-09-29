import type { AnyFieldApi } from "@tanstack/react-form";
import { Field } from "@/client/components/ui/field";
import { cn } from "@/shared/lib/cn";

export function SelectField({
  field,
  label,
  placeholder,
  options,
}: {
  field: AnyFieldApi;
  label: string;
  placeholder: string;
  options: { value: string; label: string }[];
}) {
  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
  const errorMessage = field.state.meta.errors
    .map((error: unknown) =>
      typeof error === "string"
        ? error
        : (error as { message?: string })?.message,
    )
    .filter(Boolean)
    .join(", ");

  return (
    <Field.Root invalid={isInvalid}>
      <Field.Label htmlFor={field.name}>{label}</Field.Label>
      <select
        id={field.name}
        name={field.name}
        value={field.state.value}
        onBlur={field.handleBlur}
        onChange={(e) => field.handleChange(e.target.value)}
        aria-invalid={isInvalid || undefined}
        className={cn(
          "h-12.5 w-full rounded-xl border border-line-2 bg-ink-3 px-3.5 text-[15.5px] text-fg outline-none focus:border-accent aria-[invalid]:border-bad",
          field.state.value === "" && "text-faint",
        )}
      >
        <option value="" disabled>
          {placeholder}
        </option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <Field.Error match={isInvalid}>{errorMessage}</Field.Error>
    </Field.Root>
  );
}
