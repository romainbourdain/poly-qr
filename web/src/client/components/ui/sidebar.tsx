"use client";

import { Dialog } from "@base-ui/react/dialog";
import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
import { usePathname, useSearchParams } from "next/navigation";
import {
  type ComponentProps,
  createContext,
  type ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import { Button } from "@/client/components/ui/button";
import { cn } from "@/shared/lib/cn";

const SidebarContext = createContext<{
  openMobile: boolean;
  setOpenMobile: (open: boolean) => void;
} | null>(null);

function useSidebar() {
  const context = useContext(SidebarContext);
  if (!context) throw new Error("Sidebar doit être dans un SidebarProvider.");
  return context;
}

/**
 * Sidebar fixe dès `md`, tiroir sur mobile : le même contenu, ouvert par
 * `SidebarTrigger`, qui se referme tout seul à chaque navigation.
 */
export function SidebarProvider({
  className,
  ...props
}: ComponentProps<"div">) {
  const [openMobile, setOpenMobile] = useState(false);
  const pathname = usePathname();
  const searchParams = useSearchParams().toString();

  // biome-ignore lint/correctness/useExhaustiveDependencies: on referme à chaque navigation
  useEffect(() => {
    setOpenMobile(false);
  }, [pathname, searchParams]);

  return (
    <SidebarContext.Provider value={{ openMobile, setOpenMobile }}>
      <div
        className={cn("flex min-h-dvh flex-col md:flex-row", className)}
        {...props}
      />
    </SidebarContext.Provider>
  );
}

export function Sidebar({
  label,
  children,
}: {
  /** Nom accessible du tiroir mobile. */
  label: string;
  children: ReactNode;
}) {
  const { openMobile, setOpenMobile } = useSidebar();

  return (
    <>
      <aside className="sticky top-0 hidden h-dvh w-64 shrink-0 flex-col border-line border-r bg-ink-5 md:flex">
        {children}
      </aside>
      <Dialog.Root open={openMobile} onOpenChange={setOpenMobile}>
        <Dialog.Portal>
          <Dialog.Backdrop className="fixed inset-0 z-40 bg-black/60 transition-opacity data-[ending-style]:opacity-0 data-[starting-style]:opacity-0 md:hidden" />
          <Dialog.Popup className="fixed inset-y-0 left-0 z-50 flex w-72 max-w-[85vw] flex-col border-line border-r bg-ink-5 shadow-xl transition-transform duration-200 data-[ending-style]:-translate-x-full data-[starting-style]:-translate-x-full md:hidden">
            <Dialog.Title className="sr-only">{label}</Dialog.Title>
            {children}
          </Dialog.Popup>
        </Dialog.Portal>
      </Dialog.Root>
    </>
  );
}

/** Barre du haut de la zone de contenu, collée en haut au défilement. */
export function SidebarTopBar({
  className,
  ...props
}: ComponentProps<"header">) {
  return (
    <header
      className={cn(
        "sticky top-0 z-30 flex h-16 shrink-0 items-center gap-3 border-line border-b bg-ink/90 px-4 backdrop-blur md:px-6",
        className,
      )}
      {...props}
    />
  );
}

export function SidebarTrigger({
  className,
  ...props
}: ComponentProps<typeof Button>) {
  const { openMobile, setOpenMobile } = useSidebar();
  return (
    <Button
      variant="secondary"
      size="icon"
      aria-label="Ouvrir le menu"
      aria-expanded={openMobile}
      onClick={() => setOpenMobile(!openMobile)}
      className={cn("md:hidden", className)}
      {...props}
    >
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        aria-hidden="true"
      >
        <path d="M4 7h16M4 12h16M4 17h16" />
      </svg>
    </Button>
  );
}

export function SidebarInset({ className, ...props }: ComponentProps<"div">) {
  return (
    <div className={cn("flex min-w-0 flex-1 flex-col", className)} {...props} />
  );
}

export function SidebarHeader({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      className={cn("flex flex-col gap-4 px-4 pt-5 pb-4", className)}
      {...props}
    />
  );
}

export function SidebarContent({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "flex flex-1 flex-col gap-5 overflow-y-auto px-4 py-2",
        className,
      )}
      {...props}
    />
  );
}

export function SidebarFooter({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "mt-auto flex flex-col gap-1 border-line border-t p-4",
        className,
      )}
      {...props}
    />
  );
}

export function SidebarGroup({ className, ...props }: ComponentProps<"div">) {
  return <div className={cn("flex flex-col gap-1.5", className)} {...props} />;
}

export function SidebarGroupLabel({
  className,
  ...props
}: ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "px-2 font-bold text-[11.5px] text-faint uppercase tracking-[0.12em]",
        className,
      )}
      {...props}
    />
  );
}

export function SidebarMenu({ className, ...props }: ComponentProps<"ul">) {
  return <ul className={cn("flex flex-col gap-0.5", className)} {...props} />;
}

export function SidebarMenuItem(props: ComponentProps<"li">) {
  return <li {...props} />;
}

/** Entrée de menu ; `render={<Link … />}` pour en faire un lien. */
export function SidebarMenuButton({
  isActive = false,
  render,
  className,
  ...props
}: useRender.ComponentProps<"button"> & { isActive?: boolean }) {
  return useRender({
    defaultTagName: "button",
    render,
    props: mergeProps<"button">(
      {
        "aria-current": isActive ? "page" : undefined,
        className: cn(
          "group/menu relative flex h-11 w-full items-center gap-3 rounded-[10px] px-3 text-left font-semibold text-[14px] transition-colors [&_svg]:size-[18px] [&_svg]:shrink-0",
          isActive
            ? "bg-ink-4 font-bold text-fg before:absolute before:inset-y-2.5 before:-left-4 before:w-[3px] before:rounded-r-full before:bg-accent-2 [&_svg]:text-accent-3"
            : "text-muted hover:bg-ink-4 hover:text-fg [&_svg]:text-faint hover:[&_svg]:text-fg",
          className,
        ),
      },
      props,
    ),
  });
}
