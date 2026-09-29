"use client";

import { useForm } from "@tanstack/react-form";
import { useRef, useState } from "react";
import { TicketStepperField } from "@/client/components/admin/ticket-stepper-field";
import { Button } from "@/client/components/ui/button";
import { CARD_CLASSES } from "@/client/components/ui/card";
import { SelectField } from "@/client/components/ui/select-field";
import { Separator } from "@/client/components/ui/separator";
import { TextField } from "@/client/components/ui/text-field";
import { applyFieldErrors } from "@/client/lib/apply-action-errors";
import {
  creerPermanenceAction,
  creerSurPlaceAction,
} from "@/server/actions/tickets";
import { cn } from "@/shared/lib/cn";
import { actionErrorsToForm } from "@/shared/lib/form-errors";
import {
  calculerTotalCentimes,
  formatEuros,
  type PrixEvenement,
} from "@/shared/lib/prix";
import { MOYEN_PAIEMENT_LABEL, nomComplet } from "@/shared/lib/tickets";
import {
  type CommandeCreee,
  MOYENS_PAIEMENT,
  type MoyenPaiement,
} from "@/shared/lib/types";
import { permanenceCommandeSchema } from "@/shared/validators/permanence";
import { surPlaceCommandeSchema } from "@/shared/validators/sur-place";

export type ModeVente = "permanence" | "sur_place";

/**
 * Vente de billets en main propre. En permanence, le QR part par email ; sur
 * place, la personne entre tout de suite : ni email ni QR, billets déjà scannés.
 * Le parent remonte le formulaire (`key`) quand le mode change.
 */
export function VenteForm({
  mode,
  evenementId,
  prix,
  onCreated,
}: {
  mode: ModeVente;
  evenementId: string;
  prix: PrixEvenement;
  onCreated: (commande: CommandeCreee) => void;
}) {
  const surPlace = mode === "sur_place";
  // Sur place, le champ email n'existe pas : le formulaire garde `email` vide et
  // le schéma sans email valide le reste (cast : TanStack veut un seul type de schéma).
  const schema = (
    surPlace ? surPlaceCommandeSchema : permanenceCommandeSchema
  ) as typeof permanenceCommandeSchema;
  const [error, setError] = useState<string | null>(null);
  const nextRowId = useRef(1);
  const [rowIds, setRowIds] = useState<number[]>([0]);

  const form = useForm({
    defaultValues: {
      email: "",
      moyenPaiement: "" as MoyenPaiement | "",
      billets: [{ nom: "", prenom: "", ticketsBoisson: 0 }],
    },
    validators: {
      onChange: schema,
    },
    onSubmit: async ({ value }) => {
      setError(null);
      // Déjà validé par le schéma ; le parse affine seulement le type de `moyenPaiement`.
      const input = schema.parse(value);
      const result = surPlace
        ? await creerSurPlaceAction({
            ...surPlaceCommandeSchema.parse(value),
            evenementId,
          })
        : await creerPermanenceAction({
            ...permanenceCommandeSchema.parse(value),
            evenementId,
          });
      const data = result?.data;
      if (!data) {
        const errors = actionErrorsToForm(result);
        applyFieldErrors(form, errors.fields);
        setError(errors.form ?? null);
        return;
      }

      const emailError = "emailError" in data ? data.emailError : undefined;
      setError(typeof emailError === "string" ? emailError : null);
      onCreated({
        commandeId: data.commande.id,
        origine: mode,
        nom: nomComplet(input.billets[0].prenom, input.billets[0].nom),
        email: "email" in input ? input.email : null,
        billets: data.billets.map((billet) => ({
          id: billet.id,
          code: billet.code,
          nom: billet.nom,
          prenom: billet.prenom,
          ticketsBoisson: billet.ticketsBoisson,
        })),
      });
      form.reset();
      nextRowId.current = 1;
      setRowIds([0]);
    },
  });

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        form.handleSubmit();
      }}
      className={cn(CARD_CLASSES, "flex flex-col gap-5")}
    >
      <form.Field name="billets" mode="array">
        {(billetsField) => {
          const nomEtPrenom = (index: number) => (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <form.Field name={`billets[${index}].nom`}>
                {(field) => (
                  <TextField
                    field={field}
                    label="Nom"
                    placeholder="Lemoine"
                    autoComplete="off"
                  />
                )}
              </form.Field>
              <form.Field name={`billets[${index}].prenom`}>
                {(field) => (
                  <TextField
                    field={field}
                    label="Prénom"
                    placeholder="Sacha"
                    autoComplete="off"
                  />
                )}
              </form.Field>
            </div>
          );
          const tickets = (index: number) => (
            <form.Field name={`billets[${index}].ticketsBoisson`}>
              {(field) => (
                <TicketStepperField
                  field={field}
                  label="Tickets boisson"
                  hint={
                    surPlace
                      ? "Remis en papier tout de suite,\nà l'encaissement."
                      : "Remis en papier à l'entrée,\nen une fois, au scan du billet."
                  }
                />
              )}
            </form.Field>
          );

          return (
            <>
              {!surPlace && (
                <form.Field name="email">
                  {(field) => (
                    <TextField
                      field={field}
                      label="Email"
                      type="email"
                      placeholder="sacha.lemoine@etu-poly.fr"
                      description="C'est l'adresse qui recevra le(s) QR code(s)."
                    />
                  )}
                </form.Field>
              )}

              <form.Field name="moyenPaiement">
                {(field) => (
                  <SelectField
                    field={field}
                    label="Moyen de paiement"
                    placeholder="Choisir un moyen de paiement"
                    options={MOYENS_PAIEMENT.map((value) => ({
                      value,
                      label: MOYEN_PAIEMENT_LABEL[value],
                    }))}
                  />
                )}
              </form.Field>

              {billetsField.state.value.map((_, index) => (
                <div
                  key={rowIds[index]}
                  className="flex flex-col gap-5 rounded-2xl border border-line-2 bg-ink-3 p-4"
                >
                  <div className="font-bold text-[13px] text-muted">
                    Billet {index + 1}
                  </div>
                  {nomEtPrenom(index)}
                  {tickets(index)}
                  {index > 0 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-11 self-start px-0 text-bad"
                      onClick={() => {
                        billetsField.removeValue(index);
                        setRowIds((prev) => prev.filter((_, j) => j !== index));
                      }}
                    >
                      Retirer ce billet
                    </Button>
                  )}
                </div>
              ))}

              <Button
                type="button"
                variant="secondary"
                size="sm"
                className="h-11 self-start px-4"
                onClick={() => {
                  billetsField.pushValue({
                    nom: "",
                    prenom: "",
                    ticketsBoisson: 0,
                  });
                  setRowIds((prev) => [...prev, nextRowId.current++]);
                }}
              >
                + Ajouter un billet
              </Button>
            </>
          );
        }}
      </form.Field>

      {error && (
        <div role="alert" className="font-semibold text-[13px] text-bad">
          {error}
        </div>
      )}

      <Separator />

      <form.Subscribe
        selector={(state) => [state.canSubmit, state.values] as const}
      >
        {([canSubmit, values]) => {
          // Le total n'apparaît que lorsque le formulaire est complet et valide.
          const pret = canSubmit && schema.safeParse(values).success;
          return (
            <>
              {pret && (
                <div className="flex items-baseline justify-between gap-3">
                  <span className="font-bold text-[13px] text-muted">
                    Total à payer
                  </span>
                  <span
                    className="font-bold font-display text-[24px]"
                    data-testid="total-a-payer"
                  >
                    {formatEuros(calculerTotalCentimes(prix, values.billets))}
                  </span>
                </div>
              )}
              <Button
                type="submit"
                disabled={!canSubmit}
                className="h-13 text-[15.5px]"
              >
                {surPlace
                  ? "Encaisser et faire entrer"
                  : "Créer et envoyer par email"}
              </Button>
            </>
          );
        }}
      </form.Subscribe>
    </form>
  );
}
