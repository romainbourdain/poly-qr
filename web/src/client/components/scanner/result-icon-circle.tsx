import type { ComponentProps } from "react";
import { cn } from "@/shared/lib/cn";

export function ResultIconCircle({
  className,
  ...props
}: ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "flex size-24 items-center justify-center rounded-full",
        className,
      )}
      {...props}
    />
  );
}
