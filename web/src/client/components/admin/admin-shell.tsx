"use client";

import { type ReactNode, useState } from "react";
import { DesktopSidebar } from "@/client/components/admin/desktop-sidebar";
import type { EvenementOption } from "@/client/components/admin/evenement-switcher";
import { MobileHeader } from "@/client/components/admin/mobile-header";
import { useEvenementSelectionne } from "@/client/hooks/use-evenement-selectionne";

export function AdminShell({
  evenements,
  children,
}: {
  evenements: EvenementOption[];
  children: ReactNode;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const { evenementId, avecEvenement } = useEvenementSelectionne(evenements);

  return (
    <div className="flex min-h-dvh flex-col md:flex-row">
      <MobileHeader
        open={menuOpen}
        onToggle={() => setMenuOpen((v) => !v)}
        onClose={() => setMenuOpen(false)}
        evenements={evenements}
        evenementId={evenementId}
        avecEvenement={avecEvenement}
      />
      <DesktopSidebar
        evenements={evenements}
        evenementId={evenementId}
        avecEvenement={avecEvenement}
      />
      <main className="min-w-0 flex-1 overflow-x-hidden">{children}</main>
    </div>
  );
}
