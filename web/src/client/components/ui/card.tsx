import type { ComponentProps } from "react";
import { cn } from "@/shared/lib/cn";

export const CARD_CLASSES =
  "rounded-[18px] border border-line bg-ink-2 px-5 py-5 sm:px-7 sm:py-6.5";

export function Card({ className, ...props }: ComponentProps<"div">) {
  return <div className={cn(CARD_CLASSES, className)} {...props} />;
}
