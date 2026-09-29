import { Card } from "@/client/components/ui/card";
import { formatEuros, montantCentimes } from "@/shared/lib/prix";
import type { Evenement, StatsEvenement } from "@/shared/lib/types";

/** Ventes réparties entre HelloAsso et permanence, avec la part de chacune. */
export function SalesBreakdownCard({
  evenement,
  stats,
}: {
  evenement: Evenement;
  stats: StatsEvenement;
}) {
  const prix = {
    billet: evenement.prixBilletCentimes,
    ticketBoisson: evenement.prixTicketBoissonCentimes,
  };
  const lignes = [
    {
      nom: "HelloAsso",
      billets: stats.billetsHelloasso,
      boissons: stats.ticketsBoisson - stats.ticketsBoissonPermanence,
      couleur: "bg-accent",
    },
    {
      nom: "Permanence",
      billets: stats.billetsPermanence,
      boissons: stats.ticketsBoissonPermanence,
      couleur: "bg-accent-3",
    },
  ].map((l) => ({
    ...l,
    montant: montantCentimes(prix, {
      billets: l.billets,
      ticketsBoisson: l.boissons,
    }),
  }));
  const total = lignes.reduce((somme, l) => somme + l.montant, 0);

  return (
    <Card className="flex flex-col gap-4">
      <h2 className="font-bold text-[16px]">Ventes par canal</h2>
      <div
        role="img"
        aria-label="Part de chaque canal dans les ventes"
        className="flex h-2.5 overflow-hidden rounded-full bg-ink-4"
      >
        {total > 0 &&
          lignes.map((l) => (
            <div
              key={l.nom}
              className={l.couleur}
              style={{ width: `${(l.montant / total) * 100}%` }}
            />
          ))}
      </div>
      <ul className="flex flex-col gap-3">
        {lignes.map((l) => (
          <li key={l.nom} className="flex items-center gap-3">
            <span
              aria-hidden="true"
              className={`size-2.5 shrink-0 rounded-full ${l.couleur}`}
            />
            <div className="flex min-w-0 flex-1 flex-col leading-tight">
              <span className="font-semibold text-[14px]">{l.nom}</span>
              <span className="text-[12.5px] text-muted">
                {l.billets} {l.billets > 1 ? "billets" : "billet"} ·{" "}
                {l.boissons}{" "}
                {l.boissons > 1 ? "tickets boisson" : "ticket boisson"}
              </span>
            </div>
            <span className="font-bold font-display text-[18px] tabular-nums">
              {formatEuros(l.montant)}
            </span>
          </li>
        ))}
      </ul>
    </Card>
  );
}
