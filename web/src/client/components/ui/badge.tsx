import { cva, type VariantProps } from "class-variance-authority";
import type { ComponentProps } from "react";
import { cn } from "@/shared/lib/cn";

export const badgeVariants = cva(
  "inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 font-bold text-[12px]",
  {
    variants: {
      variant: {
        neutral: "border border-line-2 bg-ink-4 text-[#C7C4DA]",
        good: "border border-good-line bg-good-bg text-good",
        warn: "border border-warn-line bg-warn-bg text-warn",
        bad: "border border-bad-line bg-bad-bg text-bad",
      },
    },
    defaultVariants: {
      variant: "neutral",
    },
  },
);

export interface BadgeProps
  extends ComponentProps<"span">,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <span className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}
