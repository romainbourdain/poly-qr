import { describe, expect, it } from "vitest";
import { enregistrerEvenementSchema } from "@/shared/validators/evenement";

const base = {
  nom: "Soirée",
  date: "2026-10-01",
  heure: "20:00",
  lieu: "Hangar",
  prixBillet: "5,50",
  prixBilletCotisant: "4",
  prixBilletSurPlace: "7",
  prixBilletSurPlaceCotisant: "6",
  prixTicketBoisson: "1",
  motDePasse: "",
};

describe("enregistrerEvenementSchema", () => {
  it("exige un mot de passe à la création", () => {
    const result = enregistrerEvenementSchema.safeParse({
      ...base,
      mode: "creer",
    });
    expect(result.success).toBe(false);
    expect(result.error?.issues[0].path).toEqual(["motDePasse"]);
  });

  it("accepte un mot de passe vide à la modification", () => {
    expect(
      enregistrerEvenementSchema.safeParse({
        ...base,
        mode: "modifier",
        evenementId: "5b1c8f0e-1c1e-4f1a-9a55-2f4b8d3c9e10",
      }).success,
    ).toBe(true);
  });

  it("exige l'événement à modifier", () => {
    const result = enregistrerEvenementSchema.safeParse({
      ...base,
      mode: "modifier",
    });
    expect(result.success).toBe(false);
    expect(result.error?.issues[0].path).toEqual(["evenementId"]);
  });
});
