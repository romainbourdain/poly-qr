import { describe, expect, it } from "vitest";
import { MOYENS_PAIEMENT } from "@/shared/lib/types";
import { permanenceCommandeSchema } from "@/shared/validators/permanence";
import { surPlaceCommandeSchema } from "@/shared/validators/sur-place";

const base = {
  email: "sacha@etu-poly.fr",
  billets: [
    { nom: "Lemoine", prenom: "Sacha", cotisant: false, ticketsBoisson: 0 },
  ],
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

  it("exige un nom et un prénom sur chaque billet", () => {
    const resultat = permanenceCommandeSchema.safeParse({
      ...base,
      moyenPaiement: "especes",
      billets: [
        { nom: "Lemoine", prenom: "Sacha", cotisant: false, ticketsBoisson: 0 },
        { nom: "", prenom: "Robin", cotisant: false, ticketsBoisson: 1 },
        { nom: "Petit", prenom: " ", cotisant: true, ticketsBoisson: 0 },
      ],
    });
    expect(resultat.success).toBe(false);
    if (resultat.success) return;
    const chemins = resultat.error.issues.map((i) => i.path.join("."));
    expect(chemins).toEqual(["billets.1.nom", "billets.2.prenom"]);
  });
});

describe("surPlaceCommandeSchema", () => {
  it("n'exige pas d'email, mais toujours un nom et un prénom", () => {
    expect(
      surPlaceCommandeSchema.safeParse({
        moyenPaiement: "especes",
        billets: base.billets,
      }).success,
    ).toBe(true);
    expect(
      surPlaceCommandeSchema.safeParse({
        moyenPaiement: "especes",
        billets: [{ nom: "", prenom: "", cotisant: false, ticketsBoisson: 0 }],
      }).success,
    ).toBe(false);
  });
});
