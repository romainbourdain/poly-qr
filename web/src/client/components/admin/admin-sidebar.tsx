"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import {
  type EvenementOption,
  EvenementSwitcher,
} from "@/client/components/admin/evenement-switcher";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/client/components/ui/sidebar";

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

const NAV = [
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
  {
    href: "/admin/nouveau",
    label: "Nouveau billet",
    icon: (
      <Icon>
        <path d="M3.5 9V7a2 2 0 0 1 2-2h13a2 2 0 0 1 2 2v2a2.5 2.5 0 0 0 0 5v2a2 2 0 0 1-2 2h-13a2 2 0 0 1-2-2v-2a2.5 2.5 0 0 0 0-5Z" />
        <path d="M12 9.5v5M9.5 12h5" />
      </Icon>
    ),
  },
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
                {NAV.map((item) => (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      isActive={pathname === item.href}
                      render={<Link href={avecEvenement(item.href)} />}
                    >
                      {item.icon}
                      {item.label}
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </nav>
          </SidebarGroup>
        </SidebarContent>
      )}

      {evenementId && (
        <SidebarFooter>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                render={<Link href={`/scanner/${evenementId}`} />}
              >
                <Icon>
                  <path d="M4 8V6a2 2 0 0 1 2-2h2M16 4h2a2 2 0 0 1 2 2v2M20 16v2a2 2 0 0 1-2 2h-2M8 20H6a2 2 0 0 1-2-2v-2M4 12h16" />
                </Icon>
                Ouvrir le scanner
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      )}
    </Sidebar>
  );
}
