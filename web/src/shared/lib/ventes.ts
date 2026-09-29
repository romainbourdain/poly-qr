import { montantCentimes } from "@/shared/lib/prix";
import type { Evenement, StatsEvenement } from "@/shared/lib/types";

export type CanalId = "helloasso" | "permanence";

export interface VentesCanal {
  id: CanalId;
  label: string;
  billets: number;
  ticketsBoisson: number;
  /** Aux prix de l'événement : le système ne stocke pas les montants réellement payés. */
  montantCentimes: number;
}

/** Ventes de chaque canal, valorisées aux prix de l'événement. */
export function calculerVentesParCanal(
  evenement: Pick<
    Evenement,
    "prixBilletCentimes" | "prixTicketBoissonCentimes"
  >,
  stats: StatsEvenement,
): VentesCanal[] {
  const prix = {
    billet: evenement.prixBilletCentimes,
    ticketBoisson: evenement.prixTicketBoissonCentimes,
  };
  const canal = (
    id: CanalId,
    label: string,
    billets: number,
    ticketsBoisson: number,
  ): VentesCanal => ({
    id,
    label,
    billets,
    ticketsBoisson,
    montantCentimes: montantCentimes(prix, { billets, ticketsBoisson }),
  });

  return [
    canal(
      "helloasso",
      "HelloAsso",
      stats.billetsHelloasso,
      stats.ticketsBoisson - stats.ticketsBoissonPermanence,
    ),
    canal(
      "permanence",
      "Permanence",
      stats.billetsPermanence,
      stats.ticketsBoissonPermanence,
    ),
  ];
}

export function totalVentesCentimes(canaux: VentesCanal[]): number {
  return canaux.reduce((somme, c) => somme + c.montantCentimes, 0);
}
