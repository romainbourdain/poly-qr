"use client";

import { AffluenceCard } from "@/client/components/admin/affluence-card";
import {
  CanalDonutCard,
  type CanalVentes,
} from "@/client/components/admin/canal-donut-card";
import { EntreesRadialCard } from "@/client/components/admin/entrees-radial-card";
import { Stat } from "@/client/components/ui/stat";
import type { TrancheAffluence } from "@/shared/lib/affluence";
import { formatEuros } from "@/shared/lib/prix";
import { MOYEN_PAIEMENT_LABEL } from "@/shared/lib/tickets";
import {
  type Evenement,
  MOYENS_PAIEMENT,
  type MoyenPaiement,
  type StatsEvenement,
} from "@/shared/lib/types";
import {
  calculerVentesParCanal,
  totalBilletsCentimes,
  totalBoissonCentimes,
  totalVentesCentimes,
} from "@/shared/lib/ventes";

const COULEURS: Record<string, string> = {
  helloasso: "var(--color-accent)",
  permanence: "var(--color-accent-3)",
  sur_place: "var(--color-warn)",
};

const COULEURS_PAIEMENT: Record<MoyenPaiement, string> = {
  hello_asso: "var(--color-accent)",
  especes: "var(--color-warn)",
  sumup: "var(--color-accent-3)",
  virement: "var(--color-good)",
  autre: "var(--color-muted)",
};

export function StatsContent({
  evenement,
  stats,
  tranches,
}: {
  evenement: Evenement;
  stats: StatsEvenement;
  tranches: TrancheAffluence[];
}) {
  const ventes = calculerVentesParCanal(evenement, stats);
  const canaux: CanalVentes[] = ventes.map((v) => ({
    ...v,
    color: COULEURS[v.id],
  }));
  const paiements: CanalVentes[] = MOYENS_PAIEMENT.map((moyen) => {
    const { billets, ticketsBoisson } = stats.moyensPaiement[moyen];
    return {
      id: moyen,
      label: MOYEN_PAIEMENT_LABEL[moyen],
      billets,
      detail: `${ticketsBoisson} ticket${ticketsBoisson > 1 ? "s" : ""} boisson`,
      color: COULEURS_PAIEMENT[moyen],
    };
  });

  return (
    <div className="flex flex-col gap-5 px-4 py-6 sm:gap-6 sm:px-6 sm:py-8 md:px-9">
      <h1 className="font-display font-extrabold text-[24px] tracking-tight sm:text-[30px]">
        Statistiques
      </h1>

      <div className="grid grid-cols-2 gap-3 sm:gap-3.5 lg:grid-cols-4">
        <Stat
          label="Ventes totales"
          value={formatEuros(totalVentesCentimes(ventes))}
        />
        <Stat
          label="Billets"
          value={formatEuros(totalBilletsCentimes(ventes))}
          hint={`${stats.billetsVendus} vendus`}
        />
        <Stat
          label="Tickets boisson"
          value={formatEuros(totalBoissonCentimes(ventes))}
          hint={`${stats.ticketsBoisson} vendus`}
        />
        <Stat
          label="Personnes entrées"
          value={`${stats.entreesScannees} / ${stats.billetsVendus}`}
        />
      </div>

      <AffluenceCard
        tranches={tranches}
        entreesScannees={stats.entreesScannees}
      />

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <CanalDonutCard canaux={canaux} />
        <EntreesRadialCard stats={stats} />
        <CanalDonutCard
          canaux={paiements}
          titre="Billets par moyen de paiement"
        />
      </div>
    </div>
  );
}
