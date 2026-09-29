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
 * permanence au prix de pré-vente, la vente sur place à son propre prix, chacun
 * avec son tarif cotisant.
 */
export function calculerVentesParCanal(
  evenement: Pick<
    Evenement,
    | "prixBilletCentimes"
    | "prixBilletCotisantCentimes"
    | "prixBilletSurPlaceCentimes"
    | "prixBilletSurPlaceCotisantCentimes"
    | "prixTicketBoissonCentimes"
  >,
  stats: StatsEvenement,
): VentesCanal[] {
  const canal = (
    id: CanalId,
    label: string,
    billets: number,
    cotisants: number,
    ticketsBoisson: number,
    prixBillet: { normal: number; cotisant: number },
  ): VentesCanal => ({
    id,
    label,
    billets,
    ticketsBoisson,
    montantCentimes: montantCentimes(
      {
        billet: prixBillet.normal,
        billetCotisant: prixBillet.cotisant,
        ticketBoisson: evenement.prixTicketBoissonCentimes,
      },
      { billets, cotisants, ticketsBoisson },
    ),
  });
  const prevente = {
    normal: evenement.prixBilletCentimes,
    cotisant: evenement.prixBilletCotisantCentimes,
  };

  return [
    canal(
      "helloasso",
      "HelloAsso",
      stats.billetsHelloasso,
      stats.cotisantsHelloasso,
      stats.ticketsBoisson -
        stats.ticketsBoissonPermanence -
        stats.ticketsBoissonSurPlace,
      prevente,
    ),
    canal(
      "permanence",
      "Permanence",
      stats.billetsPermanence,
      stats.cotisantsPermanence,
      stats.ticketsBoissonPermanence,
      prevente,
    ),
    canal(
      "sur_place",
      "Sur place",
      stats.billetsSurPlace,
      stats.cotisantsSurPlace,
      stats.ticketsBoissonSurPlace,
      {
        normal: evenement.prixBilletSurPlaceCentimes,
        cotisant: evenement.prixBilletSurPlaceCotisantCentimes,
      },
    ),
  ];
}

export function totalVentesCentimes(canaux: VentesCanal[]): number {
  return canaux.reduce((somme, c) => somme + c.montantCentimes, 0);
}
