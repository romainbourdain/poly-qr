import { Input as BaseInput } from "@base-ui/react/input";
import type { ComponentProps } from "react";
import { cn } from "@/shared/lib/cn";

export const INPUT_CLASSES =
  "h-12.5 w-full rounded-xl border border-line-2 bg-ink-3 px-3.5 text-[15.5px] text-fg outline-none placeholder:text-faint focus:border-accent data-[invalid]:border-bad";

export function Input({
  className,
  ...props
}: ComponentProps<typeof BaseInput>) {
  return <BaseInput className={cn(INPUT_CLASSES, className)} {...props} />;
}
