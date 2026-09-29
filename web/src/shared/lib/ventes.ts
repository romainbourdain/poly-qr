import { montantCentimes } from "@/shared/lib/prix";
import type { Evenement, StatsEvenement } from "@/shared/lib/types";

export type CanalId = "helloasso" | "permanence" | "sur_place";

export interface VentesCanal {
  id: CanalId;
  label: string;
  billets: number;
  ticketsBoisson: number;
  /** Aux prix de l'événement : le système ne stocke pas les montants réellement payés. */
  montantCentimes: number;
}

/**
 * Ventes de chaque canal, valorisées aux prix de l'événement : HelloAsso et
 * permanence au prix de pré-vente, la vente sur place à son propre prix.
 */
export function calculerVentesParCanal(
  evenement: Pick<
    Evenement,
    | "prixBilletCentimes"
    | "prixBilletSurPlaceCentimes"
    | "prixTicketBoissonCentimes"
  >,
  stats: StatsEvenement,
): VentesCanal[] {
  const canal = (
    id: CanalId,
    label: string,
    billets: number,
    ticketsBoisson: number,
    prixBillet: number,
  ): VentesCanal => ({
    id,
    label,
    billets,
    ticketsBoisson,
    montantCentimes: montantCentimes(
      {
        billet: prixBillet,
        ticketBoisson: evenement.prixTicketBoissonCentimes,
      },
      { billets, ticketsBoisson },
    ),
  });

  return [
    canal(
      "helloasso",
      "HelloAsso",
      stats.billetsHelloasso,
      stats.ticketsBoisson -
        stats.ticketsBoissonPermanence -
        stats.ticketsBoissonSurPlace,
      evenement.prixBilletCentimes,
    ),
    canal(
      "permanence",
      "Permanence",
      stats.billetsPermanence,
      stats.ticketsBoissonPermanence,
      evenement.prixBilletCentimes,
    ),
    canal(
      "sur_place",
      "Sur place",
      stats.billetsSurPlace,
      stats.ticketsBoissonSurPlace,
      evenement.prixBilletSurPlaceCentimes,
    ),
  ];
}

export function totalVentesCentimes(canaux: VentesCanal[]): number {
  return canaux.reduce((somme, c) => somme + c.montantCentimes, 0);
}
