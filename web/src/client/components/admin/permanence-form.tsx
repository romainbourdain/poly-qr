"use client";

import { useForm } from "@tanstack/react-form";
import { useRef, useState } from "react";
import { TicketStepperField } from "@/client/components/admin/ticket-stepper-field";
import { Button } from "@/client/components/ui/button";
import { CARD_CLASSES } from "@/client/components/ui/card";
import { SelectField } from "@/client/components/ui/select-field";
import { Separator } from "@/client/components/ui/separator";
import { TextField } from "@/client/components/ui/text-field";
import { creerPermanenceAction } from "@/server/actions/tickets";
import { cn } from "@/shared/lib/cn";
import {
  calculerTotalCentimes,
  formatEuros,
  type PrixEvenement,
} from "@/shared/lib/prix";
import { MOYEN_PAIEMENT_LABEL } from "@/shared/lib/tickets";
import {
  type CommandeCreee,
  MOYENS_PAIEMENT,
  type MoyenPaiement,
} from "@/shared/lib/types";
import { permanenceCommandeSchema } from "@/shared/validators/permanence";

export function PermanenceForm({
  prix,
  onCreated,
}: {
  prix: PrixEvenement;
  onCreated: (commande: CommandeCreee) => void;
}) {
  const [error, setError] = useState<string | null>(null);
  const nextRowId = useRef(1);
  const [rowIds, setRowIds] = useState<number[]>([0]);

  const form = useForm({
    defaultValues: {
      nom: "",
      email: "",
      moyenPaiement: "" as MoyenPaiement | "",
      billets: [{ ticketsBoisson: 0 }],
    },
    validators: {
      onChange: permanenceCommandeSchema,
    },
    onSubmit: async ({ value }) => {
      setError(null);
      if (value.moyenPaiement === "") return;
      const nom = value.nom.trim();
      const email = value.email.trim();

      const result = await creerPermanenceAction({
        nom,
        email,
        moyenPaiement: value.moyenPaiement,
        billets: value.billets,
      });

      if (!result.success) {
        setError(result.error);
        return;
      }

      setError(result.emailError ?? null);
      onCreated({
        commandeId: result.commande.id,
        nom,
        email,
        billets: result.billets.map((billet) => ({
          id: billet.id,
          code: billet.code,
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
      <form.Field name="nom">
        {(field) => (
          <TextField
            field={field}
            label="Nom et prénom"
            placeholder="Sacha Lemoine"
          />
        )}
      </form.Field>

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

      <Separator />

      <form.Field name="billets" mode="array">
        {(billetsField) => (
          <div className="flex flex-col gap-4">
            {billetsField.state.value.map((_, index) => (
              <div key={rowIds[index]} className="flex flex-col gap-2">
                <form.Field name={`billets[${index}].ticketsBoisson`}>
                  {(field) => (
                    <TicketStepperField
                      field={field}
                      label={
                        billetsField.state.value.length > 1
                          ? `Tickets boisson — billet ${index + 1}`
                          : "Tickets boisson achetés (total)"
                      }
                      hint={
                        "Remis en papier à l'entrée,\nen une fois, au scan du billet."
                      }
                    />
                  )}
                </form.Field>
                {billetsField.state.value.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-8 self-start px-0 text-bad"
                    onClick={() => {
                      billetsField.removeValue(index);
                      setRowIds((prev) => prev.filter((_, i) => i !== index));
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
              className="h-9.5 self-start px-4"
              onClick={() => {
                billetsField.pushValue({ ticketsBoisson: 0 });
                setRowIds((prev) => [...prev, nextRowId.current++]);
              }}
            >
              + Ajouter un billet
            </Button>
          </div>
        )}
      </form.Field>

      {error && (
        <div className="font-semibold text-[13px] text-bad">{error}</div>
      )}

      <Separator />

      <form.Subscribe
        selector={(state) => [state.canSubmit, state.values] as const}
      >
        {([canSubmit, values]) => {
          // Le total n'apparaît que lorsque le formulaire est complet et valide.
          const pret =
            canSubmit && permanenceCommandeSchema.safeParse(values).success;
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
                Créer et envoyer le(s) QR
              </Button>
            </>
          );
        }}
      </form.Subscribe>
    </form>
  );
}
