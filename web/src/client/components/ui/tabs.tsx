import { Tabs as BaseTabs } from "@base-ui/react/tabs";
import type { ComponentProps } from "react";
import { cn } from "@/shared/lib/cn";

export function Tabs({
  className,
  ...props
}: ComponentProps<typeof BaseTabs.Root>) {
  return (
    <BaseTabs.Root className={cn("flex flex-col", className)} {...props} />
  );
}

export function TabsList({
  className,
  ...props
}: ComponentProps<typeof BaseTabs.List>) {
  return (
    <BaseTabs.List
      className={cn(
        "-mx-4 flex gap-1.5 overflow-x-auto px-4 sm:mx-0 sm:px-0",
        className,
      )}
      {...props}
    />
  );
}

export function TabsTab({
  className,
  ...props
}: ComponentProps<typeof BaseTabs.Tab>) {
  return (
    <BaseTabs.Tab
      className={cn(
        "h-11.5 shrink-0 rounded-xl border border-line-2 bg-ink-3 px-4 font-semibold text-[13.5px] text-muted outline-none",
        "data-active:border-[#3B3B55] data-active:bg-[#252538] data-active:font-bold data-active:text-fg",
        className,
      )}
      {...props}
    />
  );
}
