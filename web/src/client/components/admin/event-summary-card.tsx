import { Card } from "@/client/components/ui/card";
import { Stat } from "@/client/components/ui/stat";
import { formatEuros, montantCentimes } from "@/shared/lib/prix";
import type { Evenement, StatsEvenement } from "@/shared/lib/types";

export function EventSummaryCard({
  evenement,
  stats,
}: {
  evenement: Evenement;
  stats: StatsEvenement;
}) {
  // Le système ne stocke pas les montants HelloAsso : tous les billets sont
  // valorisés aux prix de l'événement.
  const ventes = montantCentimes(
    {
      billet: evenement.prixBilletCentimes,
      ticketBoisson: evenement.prixTicketBoissonCentimes,
    },
    { billets: stats.billetsVendus, ticketsBoisson: stats.ticketsBoisson },
  );

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
        <Stat
          label="Ventes totales"
          value={formatEuros(ventes)}
          hint="Billets et tickets boisson"
        />
        <Stat label="Billets vendus" value={stats.billetsVendus} />
        <Stat label="Tickets boisson vendus" value={stats.ticketsBoisson} />
        <Stat
          label="Personnes entrées"
          value={`${stats.entreesScannees} / ${stats.billetsVendus}`}
        />
      </div>
    </Card>
  );
}
