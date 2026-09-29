"use client";

import type { ReactNode } from "react";
import { AdminSidebar } from "@/client/components/admin/admin-sidebar";
import type { EvenementOption } from "@/client/components/admin/evenement-switcher";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTopBar,
  SidebarTrigger,
} from "@/client/components/ui/sidebar";
import { useEvenementSelectionne } from "@/client/hooks/use-evenement-selectionne";

export function AdminShell({
  evenements,
  children,
}: {
  evenements: EvenementOption[];
  children: ReactNode;
}) {
  const { evenementId, avecEvenement } = useEvenementSelectionne(evenements);

  return (
    <SidebarProvider>
      <SidebarTopBar>
        <SidebarTrigger />
        <div className="flex flex-col leading-tight">
          <span className="font-display font-extrabold text-[16px] tracking-tight">
            PolyQR
          </span>
          <span className="text-[12px] text-muted">
            {evenements.find((e) => e.id === evenementId)?.nom ?? "BDE TPS"}
          </span>
        </div>
      </SidebarTopBar>
      <AdminSidebar
        evenements={evenements}
        evenementId={evenementId}
        avecEvenement={avecEvenement}
      />
      <SidebarInset>{children}</SidebarInset>
    </SidebarProvider>
  );
}
