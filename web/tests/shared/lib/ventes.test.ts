import { describe, expect, it } from "vitest";
import type { StatsEvenement } from "@/shared/lib/types";
import {
  calculerVentesParCanal,
  totalVentesCentimes,
} from "@/shared/lib/ventes";

const stats: StatsEvenement = {
  billetsVendus: 7,
  billetsInvalides: 0,
  billetsHelloasso: 3,
  cotisantsHelloasso: 1,
  cotisantsPermanence: 0,
  cotisantsSurPlace: 2,
  billetsPermanence: 2,
  billetsSurPlace: 2,
  entreesScannees: 0,
  ticketsBoisson: 6,
  ticketsBoissonPermanence: 1,
  ticketsBoissonSurPlace: 2,
};

describe("calculerVentesParCanal", () => {
  it("valorise HelloAsso et permanence au prix de pré-vente, la vente sur place à son prix", () => {
    const canaux = calculerVentesParCanal(
      {
        prixBilletCentimes: 500,
        prixBilletCotisantCentimes: 300,
        prixBilletSurPlaceCentimes: 800,
        prixBilletSurPlaceCotisantCentimes: 600,
        prixTicketBoissonCentimes: 100,
      },
      stats,
    );
    expect(canaux).toEqual([
      {
        id: "helloasso",
        label: "HelloAsso",
        billets: 3,
        ticketsBoisson: 3,
        montantCentimes: 1600,
      },
      {
        id: "permanence",
        label: "Permanence",
        billets: 2,
        ticketsBoisson: 1,
        montantCentimes: 1100,
      },
      {
        id: "sur_place",
        label: "Sur place",
        billets: 2,
        ticketsBoisson: 2,
        montantCentimes: 1400,
      },
    ]);
    expect(totalVentesCentimes(canaux)).toBe(4100);
  });
});
