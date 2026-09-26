"use client";

import { EventSummaryCard } from "@/client/components/admin/event-summary-card";
import { Button } from "@/client/components/ui/button";
import { useTicketStore } from "@/client/store/ticket-store";

export default function AdminEvenementsPage() {
  const { tickets } = useTicketStore();

  const billets = tickets.length;
  const entreesVendues = tickets.reduce((s, t) => s + t.entrees, 0);
  const entreesScannees = tickets
    .filter((t) => t.statut === "scanne")
    .reduce((s, t) => s + t.entrees, 0);
  const ticketsBoissonDus = tickets.reduce((s, t) => s + t.ticketsBoisson, 0);

  return (
    <div className="flex flex-col gap-5 px-4 py-6 sm:gap-6 sm:px-6 sm:py-8 md:px-9">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:gap-5">
        <div className="flex flex-1 flex-col gap-1">
          <h1 className="font-display font-extrabold text-[24px] tracking-tight sm:text-[30px]">
            Événements
          </h1>
          <div className="text-[14px] text-muted">
            Un événement = une liste de billets, un mot de passe, un formulaire
            HelloAsso.
          </div>
        </div>
        <Button
          disabled
          title="Démo : un seul événement"
          className="sm:self-auto"
        >
          + Nouvel événement
        </Button>
      </div>

      <EventSummaryCard
        billets={billets}
        entreesVendues={entreesVendues}
        entreesScannees={entreesScannees}
        ticketsBoissonDus={ticketsBoissonDus}
      />
    </div>
  );
}
