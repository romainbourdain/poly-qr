import { Card } from "@/client/components/ui/card";
import { Stat } from "@/client/components/ui/stat";
import type { Evenement } from "@/shared/lib/types";

export function EventSummaryCard({
  evenement,
  billets,
  entreesVendues,
  entreesScannees,
  ticketsBoissonDus,
}: {
  evenement: Evenement;
  billets: number;
  entreesVendues: number;
  entreesScannees: number;
  ticketsBoissonDus: number;
}) {
  return (
    <Card className="flex flex-col gap-5">
      <div className="flex flex-col gap-1.5">
        <h1 className="font-bold font-display text-[20px] tracking-tight sm:text-[23px]">
          {evenement.nom}
        </h1>
        <div className="text-[13.5px] text-muted">
          {evenement.date} · {evenement.heure} · {evenement.lieu}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-3.5">
        <Stat label="Billets émis" value={billets} />
        <Stat label="Entrées vendues" value={entreesVendues} />
        <Stat label="Entrées scannées" value={entreesScannees} />
        <Stat label="Tickets boisson dus" value={ticketsBoissonDus} />
      </div>
    </Card>
  );
}
