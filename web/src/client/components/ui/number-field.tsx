import { NumberField as BaseNumberField } from "@base-ui/react/number-field";
import type { ComponentProps } from "react";
import { cn } from "@/shared/lib/cn";

function MinusIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="#EDEBF5"
      strokeWidth="2.4"
      strokeLinecap="round"
      aria-hidden="true"
    >
      <path d="M5 12h14" />
    </svg>
  );
}

function PlusIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="#EDEBF5"
      strokeWidth="2.4"
      strokeLinecap="round"
      aria-hidden="true"
    >
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}

export function NumberField({
  className,
  ...props
}: ComponentProps<typeof BaseNumberField.Root>) {
  return (
    <BaseNumberField.Root
      className={cn("flex items-center", className)}
      {...props}
    >
      <BaseNumberField.Group className="flex items-center gap-3">
        <BaseNumberField.Decrement
          className="flex size-12.5 shrink-0 items-center justify-center rounded-xl border border-line-2 bg-ink-4 disabled:opacity-40"
          aria-label="Retirer un ticket"
        >
          <MinusIcon />
        </BaseNumberField.Decrement>
        <BaseNumberField.Input className="h-12.5 w-21 shrink-0 rounded-xl border border-line-2 bg-ink-3 text-center font-bold font-display text-[22px] text-fg focus:border-accent" />
        <BaseNumberField.Increment
          className="flex size-12.5 shrink-0 items-center justify-center rounded-xl border border-line-2 bg-ink-4 disabled:opacity-40"
          aria-label="Ajouter un ticket"
        >
          <PlusIcon />
        </BaseNumberField.Increment>
      </BaseNumberField.Group>
    </BaseNumberField.Root>
  );
}
