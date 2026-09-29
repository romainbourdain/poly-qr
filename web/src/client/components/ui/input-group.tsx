import { Input as BaseInput } from "@base-ui/react/input";
import type { ComponentProps } from "react";
import { Button } from "@/client/components/ui/button";
import { cn } from "@/shared/lib/cn";

/** Champ composé : une boîte unique qui réunit icône, saisie et action (façon shadcn). */
export function InputGroup({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "flex h-12.5 w-full items-center gap-2 rounded-xl border border-line-2 bg-ink-3 pr-1.5 pl-3.5 focus-within:border-accent has-[input:disabled]:bg-ink-4",
        className,
      )}
      {...props}
    />
  );
}

export function InputGroupAddon({
  className,
  ...props
}: ComponentProps<"span">) {
  return (
    <span
      className={cn(
        "flex shrink-0 items-center text-faint [&_svg]:size-4",
        className,
      )}
      {...props}
    />
  );
}

export function InputGroupInput({
  className,
  ...props
}: ComponentProps<typeof BaseInput>) {
  return (
    <BaseInput
      className={cn(
        "h-full min-w-0 flex-1 bg-transparent text-base text-fg outline-none placeholder:text-faint disabled:cursor-not-allowed disabled:text-muted",
        className,
      )}
      {...props}
    />
  );
}

export function InputGroupButton({
  className,
  ...props
}: ComponentProps<typeof Button>) {
  return (
    <Button
      variant="ghost"
      size="sm"
      className={cn("h-9 shrink-0 rounded-lg px-3", className)}
      {...props}
    />
  );
}
