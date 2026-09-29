import { type AnyFormApi, FieldApi, FormApi } from "@tanstack/react-form";
import { describe, expect, it } from "vitest";
import { applyFieldErrors } from "@/client/lib/apply-action-errors";

describe("applyFieldErrors", () => {
  it("expose le message serveur sur le champ, puis l'efface à la saisie", () => {
    const form = new FormApi({ defaultValues: { nom: "" } });
    form.mount();
    const field = new FieldApi({ form, name: "nom" });
    field.mount();

    applyFieldErrors(form as unknown as AnyFormApi, {
      nom: "Le nom est requis.",
    });

    expect(field.state.meta.errors).toEqual(["Le nom est requis."]);
    expect(field.state.meta.isValid).toBe(false);

    field.handleChange("Sacha");

    expect(field.state.meta.errors).toEqual([]);
  });
});
