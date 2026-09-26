import type { AnyFieldApi } from "@tanstack/react-form";
import { Field } from "@/client/components/ui/field";
import { NumberField } from "@/client/components/ui/number-field";

export function TicketStepperField({
  field,
  label,
  hint,
  min = 0,
}: {
  field: AnyFieldApi;
  label: string;
  hint: string;
  min?: number;
}) {
  return (
    <Field.Root className="gap-2">
      <Field.Label>{label}</Field.Label>
      <div className="flex flex-wrap items-center gap-3">
        <NumberField
          min={min}
          value={field.state.value}
          onValueChange={(value) => field.handleChange(value ?? min)}
        />
        <span className="min-w-0 flex-1 basis-40 whitespace-pre-line text-[13px] text-muted leading-snug">
          {hint}
        </span>
      </div>
    </Field.Root>
  );
}
