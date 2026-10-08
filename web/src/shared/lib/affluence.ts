import {
  minutesMuralesEvenement,
  minutesMuralesParis,
} from "@/shared/lib/horaires";

export const TRANCHE_MINUTES = 15;
/** Plage affichée tant qu'aucune entrée n'est scannée. */
const DUREE_VIDE_MINUTES = 3 * 60;
/** Plage minimale une fois des entrées scannées : le graphe se resserre sur la soirée. */
const DUREE_MINIMALE_MINUTES = 60;
/** Les scans plus d'1 h avant le début ou 12 h après (essais du scanner, oublis) sont ignorés. */
const MARGE_AVANT_MINUTES = 60;
const MARGE_APRES_MINUTES = 12 * 60;

export interface TrancheAffluence {
  /** Début de la tranche, `HH:MM` (heure de Paris). */
  debut: string;
  /** Fin de la tranche, `HH:MM` (heure de Paris). */
  fin: string;
  entrees: number;
}

function formatHeureMurale(minutes: number): string {
  const jour = ((minutes % 1440) + 1440) % 1440;
  const h = String(Math.floor(jour / 60)).padStart(2, "0");
  const m = String(jour % 60).padStart(2, "0");
  return `${h}:${m}`;
}

/**
 * Entrées par tranche de 15 min, en heure de Paris. La plage s'ajuste aux scans proches de la soirée
 * (de 1 h avant à 12 h après le début), du début de l'événement ou du premier
 * scan jusqu'au dernier, au moins 1 h ; sans scan, 3 h depuis le début.
 * Tranches vides comprises.
 */
export function construireAffluence(
  scans: Date[],
  evenement: { date: string; heure: string },
): TrancheAffluence[] {
  const debutEvenement =
    Math.floor(
      minutesMuralesEvenement(evenement.date, evenement.heure) /
        TRANCHE_MINUTES,
    ) * TRANCHE_MINUTES;
  const minutes = scans
    .map(minutesMuralesParis)
    .filter(
      (m) =>
        m >= debutEvenement - MARGE_AVANT_MINUTES &&
        m < debutEvenement + MARGE_APRES_MINUTES,
    );
  const premier = Math.min(
    debutEvenement,
    ...minutes.map((m) => Math.floor(m / TRANCHE_MINUTES) * TRANCHE_MINUTES),
  );
  const dernier = Math.max(
    debutEvenement +
      (minutes.length > 0 ? DUREE_MINIMALE_MINUTES : DUREE_VIDE_MINUTES),
    ...minutes.map(
      (m) => (Math.floor(m / TRANCHE_MINUTES) + 1) * TRANCHE_MINUTES,
    ),
  );

  const parTranche = new Map<number, number>();
  for (const m of minutes) {
    const debut = Math.floor(m / TRANCHE_MINUTES) * TRANCHE_MINUTES;
    parTranche.set(debut, (parTranche.get(debut) ?? 0) + 1);
  }

  const tranches: TrancheAffluence[] = [];
  for (let debut = premier; debut < dernier; debut += TRANCHE_MINUTES) {
    tranches.push({
      debut: formatHeureMurale(debut),
      fin: formatHeureMurale(debut + TRANCHE_MINUTES),
      entrees: parTranche.get(debut) ?? 0,
    });
  }
  return tranches;
}
