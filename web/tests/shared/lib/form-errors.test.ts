import { describe, expect, it } from "vitest";
import {
  actionErrorsToForm,
  GENERIC_SERVER_ERROR,
  toFormErrors,
} from "@/shared/lib/form-errors";

describe("toFormErrors", () => {
  it("renvoie undefined sans erreur", () => {
    expect(toFormErrors(undefined)).toBeUndefined();
    expect(toFormErrors({ formErrors: [], fieldErrors: {} })).toBeUndefined();
  });

  it("mappe les erreurs de champ et de formulaire", () => {
    expect(
      toFormErrors({
        formErrors: ["Global"],
        fieldErrors: { nom: ["a", "b"], email: undefined },
      }),
    ).toEqual({ form: "Global", fields: { nom: "a, b" } });
  });
});

describe("actionErrorsToForm", () => {
  it("préfère les erreurs de validation", () => {
    expect(
      actionErrorsToForm({
        validationErrors: { formErrors: [], fieldErrors: { nom: ["x"] } },
        serverError: "ignoré",
      }),
    ).toEqual({ form: undefined, fields: { nom: "x" } });
  });

  it("utilise l'erreur serveur puis le message générique", () => {
    expect(actionErrorsToForm({ serverError: "Oups" })).toEqual({
      form: "Oups",
      fields: {},
    });
    expect(actionErrorsToForm(undefined)).toEqual({
      form: GENERIC_SERVER_ERROR,
      fields: {},
    });
  });
});
