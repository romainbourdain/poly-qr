"use client";

import type { ReactNode } from "react";
import { AdminSidebar } from "@/client/components/admin/admin-sidebar";
import { AdminTopbar } from "@/client/components/admin/admin-topbar";
import type { EvenementOption } from "@/client/components/admin/evenement-switcher";
import { SidebarInset, SidebarProvider } from "@/client/components/ui/sidebar";
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
      <AdminSidebar
        evenements={evenements}
        evenementId={evenementId}
        avecEvenement={avecEvenement}
      />
      <SidebarInset>
        <AdminTopbar
          evenement={evenements.find((e) => e.id === evenementId) ?? null}
          avecEvenement={avecEvenement}
        />
        <main className="min-w-0 flex-1 overflow-x-hidden">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
