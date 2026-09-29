"use client";

import { useState } from "react";
import { SessionTicketList } from "@/client/components/admin/session-ticket-list";
import {
  type ModeVente,
  VenteForm,
} from "@/client/components/admin/vente-form";
import { Tabs, TabsList, TabsTab } from "@/client/components/ui/tabs";
import type { PrixEvenement } from "@/shared/lib/prix";
import type { CommandeCreee } from "@/shared/lib/types";

export function NouveauBilletContent({
  evenementId,
  evenementNom,
  modeParDefaut,
  prixPrevente,
  prixSurPlace,
}: {
  evenementId: string;
  evenementNom: string;
  /** Pré-vente avant le début de l'événement, sur place ensuite. */
  modeParDefaut: ModeVente;
  prixPrevente: PrixEvenement;
  prixSurPlace: PrixEvenement;
}) {
  const [mode, setMode] = useState<ModeVente>(modeParDefaut);
  const [session, setSession] = useState<CommandeCreee[]>([]);

  return (
    <div className="flex flex-col gap-5 px-4 py-6 sm:gap-6 sm:px-6 sm:py-8 md:px-9">
      <div className="flex flex-col gap-1">
        <h1 className="font-display font-extrabold text-[24px] tracking-tight sm:text-[30px]">
          Nouveau billet
        </h1>
        <div className="text-[14px] text-muted">
          {evenementNom} ·{" "}
          {mode === "permanence"
            ? "Pré-vente en main propre. Le QR part par email tout de suite."
            : "Vente sur place. La personne entre tout de suite, sans QR."}
        </div>
      </div>

      <Tabs value={mode} onValueChange={(v) => setMode(v as ModeVente)}>
        <TabsList>
          <TabsTab value="permanence">Pré-vente</TabsTab>
          <TabsTab value="sur_place">Sur place</TabsTab>
        </TabsList>
      </Tabs>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 lg:gap-7">
        <VenteForm
          key={mode}
          mode={mode}
          evenementId={evenementId}
          prix={mode === "sur_place" ? prixSurPlace : prixPrevente}
          onCreated={(commande) => setSession((prev) => [commande, ...prev])}
        />
        <div className="flex flex-col gap-4.5">
          <SessionTicketList commandes={session} />
        </div>
      </div>
    </div>
  );
}
