"use client";

import { Collapsible } from "@base-ui/react/collapsible";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { type ReactNode, useState } from "react";
import {
  type EvenementOption,
  EvenementSwitcher,
} from "@/client/components/admin/evenement-switcher";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/client/components/ui/sidebar";
import { cn } from "@/shared/lib/cn";

function Icon({ children }: { children: ReactNode }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {children}
    </svg>
  );
}

const NAV_DEBUT = [
  {
    href: "/admin",
    label: "Événement",
    icon: (
      <Icon>
        <rect x="3.5" y="5" width="17" height="15" rx="2.5" />
        <path d="M8 3v4M16 3v4M3.5 10h17" />
      </Icon>
    ),
  },
  {
    href: "/admin/statistiques",
    label: "Statistiques",
    icon: (
      <Icon>
        <path d="M4 20V10M10 20V4M16 20v-7M22 20H2" />
      </Icon>
    ),
  },
];

const NAV_FIN = [
  {
    href: "/admin/billets",
    label: "Billets",
    icon: (
      <Icon>
        <path d="M9 6h11M9 12h11M9 18h11M4.5 6h.01M4.5 12h.01M4.5 18h.01" />
      </Icon>
    ),
  },
];

/** Les trois façons d'ajouter des billets, regroupées sous une seule entrée repliable. */
const NOUVEAU_BILLET = {
  label: "Nouveau billet",
  icon: (
    <Icon>
      <path d="M3.5 9V7a2 2 0 0 1 2-2h13a2 2 0 0 1 2 2v2a2.5 2.5 0 0 0 0 5v2a2 2 0 0 1-2 2h-13a2 2 0 0 1-2-2v-2a2.5 2.5 0 0 0 0-5Z" />
      <path d="M12 9.5v5M9.5 12h5" />
    </Icon>
  ),
  pages: [
    { href: "/admin/nouveau/pre-vente", label: "Vente à l'avance" },
    { href: "/admin/nouveau/sur-place", label: "Vente sur place" },
    { href: "/admin/nouveau/boisson", label: "Tickets boisson" },
  ],
};

function LienMenu({
  item,
  pathname,
  avecEvenement,
}: {
  item: { href: string; label: string; icon: ReactNode };
  pathname: string;
  avecEvenement: (href: string) => string;
}) {
  return (
    <SidebarMenuItem>
      <SidebarMenuButton
        isActive={pathname === item.href}
        render={<Link href={avecEvenement(item.href)} />}
      >
        {item.icon}
        {item.label}
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
}

function NouveauBilletMenu({
  pathname,
  avecEvenement,
}: {
  pathname: string;
  avecEvenement: (href: string) => string;
}) {
  const [ouvert, setOuvert] = useState(pathname.startsWith("/admin/nouveau"));

  return (
    <SidebarMenuItem>
      <Collapsible.Root open={ouvert} onOpenChange={setOuvert}>
        <Collapsible.Trigger render={<SidebarMenuButton />}>
          {NOUVEAU_BILLET.icon}
          {NOUVEAU_BILLET.label}
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
            className={cn(
              "ml-auto transition-transform",
              ouvert && "rotate-90",
            )}
          >
            <path d="m9 6 6 6-6 6" />
          </svg>
        </Collapsible.Trigger>
        <Collapsible.Panel>
          <SidebarMenuSub>
            {NOUVEAU_BILLET.pages.map((page) => (
              <SidebarMenuSubItem key={page.href}>
                <SidebarMenuSubButton
                  isActive={pathname === page.href}
                  render={<Link href={avecEvenement(page.href)} />}
                >
                  {page.label}
                </SidebarMenuSubButton>
              </SidebarMenuSubItem>
            ))}
          </SidebarMenuSub>
        </Collapsible.Panel>
      </Collapsible.Root>
    </SidebarMenuItem>
  );
}

export function AdminSidebar({
  evenements,
  evenementId,
  avecEvenement,
}: {
  evenements: EvenementOption[];
  evenementId: string | null;
  /** Ajoute l'événement sélectionné (`?evenement=`) à un lien. */
  avecEvenement: (href: string) => string;
}) {
  const pathname = usePathname();

  return (
    <Sidebar label="Menu d'administration">
      <SidebarHeader>
        <div className="flex items-center gap-3 px-1">
          <div
            aria-hidden="true"
            className="grid size-9 place-items-center rounded-[10px] bg-accent text-white [&_svg]:size-5"
          >
            <Icon>
              <rect x="4" y="4" width="6" height="6" rx="1" />
              <rect x="14" y="4" width="6" height="6" rx="1" />
              <rect x="4" y="14" width="6" height="6" rx="1" />
              <path d="M14 14h2v2h-2zM18 18h2M14 20h2" />
            </Icon>
          </div>
          <div className="flex flex-col leading-tight">
            <span className="font-display font-extrabold text-[17px] tracking-tight">
              PolyQR
            </span>
            <span className="text-[12px] text-muted">BDE TPS</span>
          </div>
        </div>
        <EvenementSwitcher evenements={evenements} evenementId={evenementId} />
      </SidebarHeader>

      {evenementId && (
        <SidebarContent>
          <SidebarGroup>
            <nav aria-label="Administration">
              <SidebarMenu>
                {NAV_DEBUT.map((item) => (
                  <LienMenu
                    key={item.href}
                    item={item}
                    pathname={pathname}
                    avecEvenement={avecEvenement}
                  />
                ))}
                <NouveauBilletMenu
                  pathname={pathname}
                  avecEvenement={avecEvenement}
                />
                {NAV_FIN.map((item) => (
                  <LienMenu
                    key={item.href}
                    item={item}
                    pathname={pathname}
                    avecEvenement={avecEvenement}
                  />
                ))}
              </SidebarMenu>
            </nav>
          </SidebarGroup>
        </SidebarContent>
      )}
    </Sidebar>
  );
}
