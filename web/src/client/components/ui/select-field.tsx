import { Select } from "@base-ui/react/select";
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
  const selected = options.find((option) => option.value === field.state.value);

  return (
    <Field.Root invalid={isInvalid}>
      <Select.Root
        name={field.name}
        value={field.state.value === "" ? null : field.state.value}
        onValueChange={(value) => field.handleChange(value ?? "")}
        items={options}
      >
        <Select.Label className="font-bold text-[13px] text-muted">
          {label}
        </Select.Label>
        <Select.Trigger
          onBlur={field.handleBlur}
          className={cn(
            INPUT_CLASSES,
            "flex items-center justify-between gap-2 text-left",
            isInvalid && "border-bad",
          )}
        >
          <Select.Value
            className={cn(!selected && "text-faint")}
            data-testid="moyen-paiement-value"
          >
            {selected?.label ?? placeholder}
          </Select.Value>
          <Select.Icon className="text-faint">▾</Select.Icon>
        </Select.Trigger>
        <Select.Portal>
          <Select.Positioner
            sideOffset={6}
            alignItemWithTrigger={false}
            className="z-50"
          >
            <Select.Popup className="min-w-(--anchor-width) rounded-xl border border-line-2 bg-ink-3 p-1 shadow-lg outline-none">
              <Select.List>
                {options.map((option) => (
                  <Select.Item
                    key={option.value}
                    value={option.value}
                    className="flex h-11 cursor-default items-center rounded-lg px-3 text-[15px] text-fg outline-none data-[highlighted]:bg-ink-4 data-[selected]:font-bold"
                  >
                    <Select.ItemText>{option.label}</Select.ItemText>
                  </Select.Item>
                ))}
              </Select.List>
            </Select.Popup>
          </Select.Positioner>
        </Select.Portal>
      </Select.Root>
      <Field.Error match={isInvalid}>{errorMessage}</Field.Error>
    </Field.Root>
  );
}
