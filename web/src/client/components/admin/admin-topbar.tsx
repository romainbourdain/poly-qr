"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { EvenementOption } from "@/client/components/admin/evenement-switcher";
import { buttonVariants } from "@/client/components/ui/button";
import { SidebarTopBar, SidebarTrigger } from "@/client/components/ui/sidebar";
import { cn } from "@/shared/lib/cn";

const PAGES: Record<string, string> = {
  "/admin/statistiques": "Statistiques",
  "/admin/nouveau": "Nouveau billet",
  "/admin/billets": "Billets",
};

interface Segment {
  label: string;
  href?: string;
}

function segments(
  pathname: string,
  evenement: EvenementOption | null,
  evenementHref: string,
): Segment[] {
  if (pathname.startsWith("/admin/evenements")) {
    return [{ label: "Événements" }, { label: "Nouvel événement" }];
  }
  if (!evenement) return [{ label: "Événements" }];
  const page = PAGES[pathname];
  return page
    ? [{ label: evenement.nom, href: evenementHref }, { label: page }]
    : [{ label: evenement.nom }];
}

/** Fil d'Ariane « Événement › Page » et création d'événement, sur chaque page admin. */
export function AdminTopbar({
  evenement,
  avecEvenement,
}: {
  evenement: EvenementOption | null;
  avecEvenement: (href: string) => string;
}) {
  const pathname = usePathname();
  const items = segments(pathname, evenement, avecEvenement("/admin"));

  return (
    <SidebarTopBar>
      <SidebarTrigger />
      <nav aria-label="Fil d'Ariane" className="min-w-0 flex-1">
        <ol className="flex items-center gap-2 text-[14px]">
          {items.map((item, i) => {
            const dernier = i === items.length - 1;
            return (
              <li
                key={item.label}
                className={cn(
                  "flex min-w-0 items-center gap-2",
                  dernier ? "font-bold text-fg" : "shrink-0 text-muted",
                  !dernier && "max-w-[40%]",
                )}
              >
                {item.href && !dernier ? (
                  <Link href={item.href} className="truncate hover:text-fg">
                    {item.label}
                  </Link>
                ) : (
                  <span
                    className="truncate"
                    aria-current={dernier ? "page" : undefined}
                  >
                    {item.label}
                  </span>
                )}
                {!dernier && (
                  <span aria-hidden="true" className="text-faint">
                    ›
                  </span>
                )}
              </li>
            );
          })}
        </ol>
      </nav>
      <Link
        href="/admin/evenements/nouveau"
        aria-label="Nouvel événement"
        className={cn(
          buttonVariants({ variant: "secondary", size: "sm" }),
          "shrink-0 max-md:size-11 max-md:px-0",
        )}
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          aria-hidden="true"
        >
          <path d="M12 5v14M5 12h14" />
        </svg>
        <span className="max-md:hidden">Nouvel événement</span>
      </Link>
    </SidebarTopBar>
  );
}
