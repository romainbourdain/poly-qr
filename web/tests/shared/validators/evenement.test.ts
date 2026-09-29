import { describe, expect, it } from "vitest";
import { enregistrerEvenementSchema } from "@/shared/validators/evenement";

const base = {
  nom: "Soirée",
  date: "2026-10-01",
  heure: "20:00",
  lieu: "Hangar",
  prixBillet: "5,50",
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
      enregistrerEvenementSchema.safeParse({ ...base, mode: "modifier" })
        .success,
    ).toBe(true);
  });
});
