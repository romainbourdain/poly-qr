import { describe, expect, it } from "vitest";
import type { StatsEvenement } from "@/shared/lib/types";
import {
  calculerVentesParCanal,
  totalVentesCentimes,
} from "@/shared/lib/ventes";

const stats: StatsEvenement = {
  billetsVendus: 5,
  billetsInvalides: 0,
  billetsHelloasso: 3,
  billetsPermanence: 2,
  entreesScannees: 0,
  ticketsBoisson: 4,
  ticketsBoissonPermanence: 1,
};

describe("calculerVentesParCanal", () => {
  it("valorise chaque canal aux prix de l'événement", () => {
    const canaux = calculerVentesParCanal(
      { prixBilletCentimes: 500, prixTicketBoissonCentimes: 100 },
      stats,
    );
    expect(canaux).toEqual([
      {
        id: "helloasso",
        label: "HelloAsso",
        billets: 3,
        ticketsBoisson: 3,
        montantCentimes: 1800,
      },
      {
        id: "permanence",
        label: "Permanence",
        billets: 2,
        ticketsBoisson: 1,
        montantCentimes: 1100,
      },
    ]);
    expect(totalVentesCentimes(canaux)).toBe(2900);
  });
});
