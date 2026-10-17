import { randomUUID } from "node:crypto";
import { describe, expect, it } from "vitest";
import { boissonSchema } from "@/shared/validators/boisson";

const valide = {
  invite: false,
  billetId: randomUUID(),
  evenementId: "",
  prenom: "",
  nom: "",
  quantite: 2,
  moyenPaiement: "especes",
};

describe("boissonSchema", () => {
  it("accepte un achat valide", () => {
    expect(boissonSchema.safeParse(valide).success).toBe(true);
  });

  it("refuse une quantité nulle ou décimale", () => {
    expect(boissonSchema.safeParse({ ...valide, quantite: 0 }).success).toBe(
      false,
    );
    expect(boissonSchema.safeParse({ ...valide, quantite: 1.5 }).success).toBe(
      false,
    );
  });

  it("refuse Lydia, qui n'est plus un moyen de paiement", () => {
    expect(
      boissonSchema.safeParse({ ...valide, moyenPaiement: "lydia" }).success,
    ).toBe(false);
  });

  it("exige un billet identifié par un UUID", () => {
    expect(boissonSchema.safeParse({ ...valide, billetId: "" }).success).toBe(
      false,
    );
  });

  describe("invité·e sans billet", () => {
    const invite = {
      ...valide,
      invite: true,
      billetId: "",
      evenementId: randomUUID(),
      prenom: "Alix",
      nom: "Martin",
    };

    it("accepte un nom, un prénom et un événement", () => {
      expect(boissonSchema.safeParse(invite).success).toBe(true);
    });

    it("exige le nom et le prénom", () => {
      expect(boissonSchema.safeParse({ ...invite, nom: " " }).success).toBe(
        false,
      );
      expect(boissonSchema.safeParse({ ...invite, prenom: "" }).success).toBe(
        false,
      );
    });

    it("n'exige pas de billet", () => {
      expect(boissonSchema.safeParse({ ...invite, billetId: "" }).success).toBe(
        true,
      );
    });
  });
});
