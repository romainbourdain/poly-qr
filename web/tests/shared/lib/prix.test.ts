import { describe, expect, it } from "vitest";
import {
  calculerTotalCentimes,
  formatDateLongue,
  formatEuros,
  formatHeureEvenement,
  montantCentimes,
  parseEuros,
  prixBillet,
  prixPrevente,
  prixSurPlace,
} from "@/shared/lib/prix";

describe("prix", () => {
  const prix = { billet: 600, billetCotisant: 400, ticketBoisson: 150 };

  it("calcule le total billets + tickets boisson, au tarif cotisant ou non de chaque billet", () => {
    expect(
      calculerTotalCentimes(prix, [
        { ticketsBoisson: 2, cotisant: false },
        { ticketsBoisson: 0, cotisant: true },
      ]),
    ).toBe(600 + 400 + 2 * 150);
  });

  it("choisit le prix d'un billet selon la cotisation", () => {
    expect(prixBillet(prix, true)).toBe(400);
    expect(prixBillet(prix, false)).toBe(600);
  });

  it("calcule le montant d'un canal avec ses cotisants", () => {
    expect(
      montantCentimes(prix, { billets: 5, cotisants: 2, ticketsBoisson: 3 }),
    ).toBe(3 * 600 + 2 * 400 + 3 * 150);
  });

  it("formate en euros", () => {
    expect(formatEuros(650)).toBe("6,50 €");
    expect(formatEuros(500)).toBe("5,00 €");
  });

  it("parse une saisie en euros vers des centimes", () => {
    expect(parseEuros("6,50")).toBe(650);
    expect(parseEuros("6.5")).toBe(650);
    expect(parseEuros("5")).toBe(500);
    expect(parseEuros("")).toBeNull();
    expect(parseEuros("abc")).toBeNull();
    expect(parseEuros("-1")).toBeNull();
  });

  it("formate date et heure en français", () => {
    expect(formatDateLongue("2026-03-14")).toBe("Samedi 14 mars");
    expect(formatHeureEvenement("22:00:00")).toBe("22h00");
    expect(formatHeureEvenement("09:05")).toBe("09h05");
  });
});

describe("prixPrevente / prixSurPlace", () => {
  const evenement = {
    prixBilletCentimes: 800,
    prixBilletCotisantCentimes: 600,
    prixBilletSurPlaceCentimes: 1000,
    prixBilletSurPlaceCotisantCentimes: 800,
    prixTicketBoissonCentimes: 200,
  };

  it("reprend les prix de pré-vente de l'événement", () => {
    expect(prixPrevente(evenement)).toEqual({
      billet: 800,
      billetCotisant: 600,
      ticketBoisson: 200,
    });
  });

  it("reprend les prix de vente sur place de l'événement", () => {
    expect(prixSurPlace(evenement)).toEqual({
      billet: 1000,
      billetCotisant: 800,
      ticketBoisson: 200,
    });
  });
});
