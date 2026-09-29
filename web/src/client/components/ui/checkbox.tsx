import { Checkbox as BaseCheckbox } from "@base-ui/react/checkbox";
import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/shared/lib/cn";

/** Case à cocher avec son libellé : toute la ligne se coche (zone de toucher de 44 px). */
export function Checkbox({
  label,
  hint,
  className,
  ...props
}: {
  label: ReactNode;
  /** Précision affichée à droite, par exemple le prix. */
  hint?: ReactNode;
} & Omit<ComponentProps<typeof BaseCheckbox.Root>, "children">) {
  return (
    // biome-ignore lint/a11y/noLabelWithoutControl: le contrôle est le Checkbox.Root imbriqué
    <label
      className={cn(
        "flex min-h-11 cursor-pointer items-center gap-3 font-semibold text-[14.5px]",
        className,
      )}
    >
      <BaseCheckbox.Root
        className="grid size-6 shrink-0 place-items-center rounded-md border border-line-2 bg-ink-2 data-[checked]:border-accent data-[checked]:bg-accent"
        {...props}
      >
        <BaseCheckbox.Indicator className="text-white">
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="m5 12 5 5 9-10" />
          </svg>
        </BaseCheckbox.Indicator>
      </BaseCheckbox.Root>
      <span className="flex-1">{label}</span>
      {hint && <span className="font-bold text-muted">{hint}</span>}
    </label>
  );
}
