import { Menu } from "@base-ui/react/menu";
import type { ComponentProps } from "react";
import { cn } from "@/shared/lib/cn";

/** Menu déroulant (actions d'une ligne, etc.), sur Base UI Menu. */
export const DropdownMenu = Menu.Root;

export function DropdownMenuTrigger(
  props: ComponentProps<typeof Menu.Trigger>,
) {
  return <Menu.Trigger {...props} />;
}

export function DropdownMenuContent({
  className,
  align = "end",
  ...props
}: ComponentProps<typeof Menu.Popup> & { align?: "start" | "center" | "end" }) {
  return (
    <Menu.Portal>
      <Menu.Positioner sideOffset={6} align={align} className="z-50">
        <Menu.Popup
          className={cn(
            "min-w-48 rounded-xl border border-line-2 bg-ink-3 p-1 shadow-lg outline-none",
            className,
          )}
          {...props}
        />
      </Menu.Positioner>
    </Menu.Portal>
  );
}

export function DropdownMenuItem({
  className,
  variant = "default",
  ...props
}: ComponentProps<typeof Menu.Item> & { variant?: "default" | "danger" }) {
  return (
    <Menu.Item
      className={cn(
        "flex h-11 cursor-default items-center rounded-lg px-3 text-[14.5px] outline-none data-[highlighted]:bg-ink-4 data-[disabled]:opacity-40",
        variant === "danger" ? "text-bad" : "text-fg",
        className,
      )}
      {...props}
    />
  );
}

export function DropdownMenuSeparator({
  className,
  ...props
}: ComponentProps<typeof Menu.Separator>) {
  return (
    <Menu.Separator className={cn("my-1 h-px bg-line", className)} {...props} />
  );
}

export function DropdownMenuLabel({
  className,
  ...props
}: ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "px-3 py-2 font-bold text-[12px] text-faint uppercase tracking-[0.1em]",
        className,
      )}
      {...props}
    />
  );
}
