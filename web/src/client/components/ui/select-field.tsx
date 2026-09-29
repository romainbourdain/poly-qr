import type { AnyFieldApi } from "@tanstack/react-form";
import { Field } from "@/client/components/ui/field";
import { INPUT_CLASSES } from "@/client/components/ui/input";
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
          INPUT_CLASSES,
          "aria-[invalid]:border-bad",
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
