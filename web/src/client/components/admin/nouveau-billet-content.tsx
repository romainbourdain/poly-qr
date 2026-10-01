"use client";

import { useState } from "react";
import { BoissonForm } from "@/client/components/admin/boisson-form";
import {
  type ModeVente,
  VenteForm,
} from "@/client/components/admin/vente-form";
import { Tabs, TabsList, TabsTab } from "@/client/components/ui/tabs";
import type { PrixEvenement } from "@/shared/lib/prix";

type Onglet = ModeVente | "boisson";

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
  const [mode, setMode] = useState<Onglet>(modeParDefaut);

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
            : mode === "sur_place"
              ? "Vente sur place. La personne entre tout de suite, sans QR."
              : "Tickets boisson en plus pour quelqu'un qui a déjà un billet."}
        </div>
      </div>

      <Tabs value={mode} onValueChange={(v) => setMode(v as Onglet)}>
        <TabsList>
          <TabsTab value="permanence">Pré-vente</TabsTab>
          <TabsTab value="sur_place">Sur place</TabsTab>
          <TabsTab value="boisson">Ticket boisson</TabsTab>
        </TabsList>
      </Tabs>

      {mode === "boisson" ? (
        <BoissonForm
          evenementId={evenementId}
          prixTicketBoisson={prixPrevente.ticketBoisson}
        />
      ) : (
        <VenteForm
          key={mode}
          mode={mode}
          evenementId={evenementId}
          prix={mode === "sur_place" ? prixSurPlace : prixPrevente}
        />
      )}
    </div>
  );
}
