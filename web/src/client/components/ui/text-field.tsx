import type { AnyFieldApi } from "@tanstack/react-form";
import type { ComponentProps } from "react";
import { Field } from "@/client/components/ui/field";
import { Input } from "@/client/components/ui/input";

export function TextField({
  field,
  label,
  description,
  className,
  ...inputProps
}: {
  field: AnyFieldApi;
  label: string;
  description?: string;
} & Omit<ComponentProps<typeof Input>, "value" | "onValueChange" | "onBlur">) {
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
      <Input
        id={field.name}
        name={field.name}
        value={field.state.value}
        onBlur={field.handleBlur}
        onValueChange={field.handleChange}
        className={className}
        {...inputProps}
      />
      {description && !isInvalid ? (
        <Field.Description>{description}</Field.Description>
      ) : null}
      <Field.Error match={isInvalid}>{errorMessage}</Field.Error>
    </Field.Root>
  );
}
