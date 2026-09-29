import { describe, expect, it } from "vitest";
import { MOYENS_PAIEMENT } from "@/shared/lib/types";
import { permanenceCommandeSchema } from "@/shared/validators/permanence";

const base = {
  nom: "Sacha Lemoine",
  email: "sacha@etu-poly.fr",
  billets: [{ ticketsBoisson: 0 }],
};

describe("permanenceCommandeSchema", () => {
  it.each(MOYENS_PAIEMENT)(
    "accepte le moyen de paiement %s",
    (moyenPaiement) => {
      expect(
        permanenceCommandeSchema.safeParse({ ...base, moyenPaiement }).success,
      ).toBe(true);
    },
  );

  it("refuse une commande sans moyen de paiement", () => {
    expect(permanenceCommandeSchema.safeParse(base).success).toBe(false);
  });

  it("refuse un moyen de paiement hors de la liste", () => {
    expect(
      permanenceCommandeSchema.safeParse({ ...base, moyenPaiement: "cheque" })
        .success,
    ).toBe(false);
  });
});
