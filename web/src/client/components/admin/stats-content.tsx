"use client";

import { AffluenceCard } from "@/client/components/admin/affluence-card";
import {
  CanalDonutCard,
  type CanalVentes,
} from "@/client/components/admin/canal-donut-card";
import { EntreesRadialCard } from "@/client/components/admin/entrees-radial-card";
import { Stat } from "@/client/components/ui/stat";
import { useAutoRefresh } from "@/client/hooks/use-auto-refresh";
import type { TrancheAffluence } from "@/shared/lib/affluence";
import { formatEuros } from "@/shared/lib/prix";
import type { Evenement, StatsEvenement } from "@/shared/lib/types";
import {
  calculerVentesParCanal,
  totalVentesCentimes,
} from "@/shared/lib/ventes";

const COULEURS: Record<string, string> = {
  helloasso: "var(--color-accent)",
  permanence: "var(--color-accent-3)",
  sur_place: "var(--color-warn)",
};

const formatteurHeure = new Intl.DateTimeFormat("fr-FR", {
  timeZone: "Europe/Paris",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
});

const RAFRAICHISSEMENT_MS = 30_000;

export function StatsContent({
  evenement,
  stats,
  tranches,
  miseAJour,
}: {
  evenement: Evenement;
  stats: StatsEvenement;
  tranches: TrancheAffluence[];
  /** Instant ISO du calcul des chiffres, pour afficher leur fraîcheur. */
  miseAJour: string;
}) {
  useAutoRefresh(RAFRAICHISSEMENT_MS);

  const ventes = calculerVentesParCanal(evenement, stats);
  const canaux: CanalVentes[] = ventes.map((v) => ({
    ...v,
    color: COULEURS[v.id],
  }));

  return (
    <div className="flex flex-col gap-5 px-4 py-6 sm:gap-6 sm:px-6 sm:py-8 md:px-9">
      <div className="flex flex-col gap-1">
        <h1 className="font-display font-extrabold text-[24px] tracking-tight sm:text-[30px]">
          Statistiques
        </h1>
        <p className="text-[13px] text-muted">
          Mis à jour à {formatteurHeure.format(new Date(miseAJour))}, puis
          toutes les 30 secondes.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:gap-3.5 lg:grid-cols-4">
        <Stat
          label="Ventes totales"
          value={formatEuros(totalVentesCentimes(ventes))}
          hint="Estimation, billets et tickets boisson"
        />
        <Stat label="Billets vendus" value={stats.billetsVendus} />
        <Stat label="Tickets boisson vendus" value={stats.ticketsBoisson} />
        <Stat
          label="Personnes entrées"
          value={`${stats.entreesScannees} / ${stats.billetsVendus}`}
        />
      </div>

      <AffluenceCard tranches={tranches} />

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <CanalDonutCard canaux={canaux} />
        <EntreesRadialCard stats={stats} />
      </div>
    </div>
  );
}
