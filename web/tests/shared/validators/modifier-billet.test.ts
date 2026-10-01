import { describe, expect, it } from "vitest";
import { modifierBilletSchema } from "@/shared/validators/modifier-billet";

describe("modifierBilletSchema", () => {
  it("nettoie les espaces autour du nom et du prénom", () => {
    expect(
      modifierBilletSchema.parse({
        nom: " Lemoine ",
        prenom: " Sacha ",
        cotisant: true,
      }),
    ).toEqual({ nom: "Lemoine", prenom: "Sacha", cotisant: true });
  });

  it("refuse un nom ou un prénom vide", () => {
    expect(
      modifierBilletSchema.safeParse({
        nom: " ",
        prenom: "Sacha",
        cotisant: false,
      }).success,
    ).toBe(false);
    expect(
      modifierBilletSchema.safeParse({
        nom: "Lemoine",
        prenom: "",
        cotisant: false,
      }).success,
    ).toBe(false);
  });
});
