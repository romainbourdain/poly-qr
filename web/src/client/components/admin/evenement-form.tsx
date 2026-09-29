"use client";

import { useForm } from "@tanstack/react-form";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/client/components/ui/button";
import { CARD_CLASSES } from "@/client/components/ui/card";
import { TextField } from "@/client/components/ui/text-field";
import { applyFieldErrors } from "@/client/lib/apply-action-errors";
import { enregistrerEvenementAction } from "@/server/actions/evenements";
import { cn } from "@/shared/lib/cn";
import { actionErrorsToForm } from "@/shared/lib/form-errors";
import { centimesVersSaisie } from "@/shared/lib/prix";
import type { Evenement } from "@/shared/lib/types";
import { evenementSchema } from "@/shared/validators/evenement";

export function EvenementForm({
  mode,
  initial,
}: {
  mode: "creer" | "modifier";
  initial?: Evenement | null;
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const form = useForm({
    defaultValues: {
      nom: initial?.nom ?? "",
      date: initial?.dateIso ?? "",
      heure: initial?.heureIso ?? "",
      lieu: initial?.lieu ?? "",
      prixBillet: centimesVersSaisie(initial?.prixBilletCentimes ?? 0),
      prixTicketBoisson: centimesVersSaisie(
        initial?.prixTicketBoissonCentimes ?? 0,
      ),
      motDePasse: "",
    },
    validators: { onChange: evenementSchema },
    onSubmit: async ({ value }) => {
      setError(null);
      setSaved(false);
      const result = await enregistrerEvenementAction({
        ...value,
        mode,
        evenementId: initial?.id,
      });
      if (!result?.data?.success) {
        const errors = actionErrorsToForm(result);
        applyFieldErrors(form, errors.fields);
        setError(errors.form ?? null);
        return;
      }
      if (mode === "creer") {
        // Étape suivante : relier HelloAsso au nouvel événement.
        router.push(`/admin?evenement=${result.data.evenementId}&nouveau=1`);
        return;
      }
      setSaved(true);
      router.refresh();
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
            label="Nom de l'événement"
            placeholder="Poly de Noël"
          />
        )}
      </form.Field>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <form.Field name="date">
          {(field) => <TextField field={field} label="Date" type="date" />}
        </form.Field>
        <form.Field name="heure">
          {(field) => <TextField field={field} label="Heure" type="time" />}
        </form.Field>
      </div>

      <form.Field name="lieu">
        {(field) => (
          <TextField field={field} label="Lieu" placeholder="Salle Poly" />
        )}
      </form.Field>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <form.Field name="prixBillet">
          {(field) => (
            <TextField
              field={field}
              label="Prix du billet (€)"
              inputMode="decimal"
            />
          )}
        </form.Field>
        <form.Field name="prixTicketBoisson">
          {(field) => (
            <TextField
              field={field}
              label="Prix du ticket boisson (€)"
              inputMode="decimal"
            />
          )}
        </form.Field>
      </div>

      <form.Field name="motDePasse">
        {(field) => (
          <TextField
            field={field}
            label="Mot de passe scanner"
            description={
              mode === "modifier"
                ? "Laisser vide pour conserver le mot de passe actuel."
                : "Demandé pour accéder au scanner de cet événement."
            }
            autoComplete="off"
          />
        )}
      </form.Field>

      {error && (
        <div role="alert" className="font-semibold text-[13px] text-bad">
          {error}
        </div>
      )}
      {saved && !error && (
        <div role="status" className="font-semibold text-[13px] text-good">
          Événement enregistré.
        </div>
      )}

      <form.Subscribe
        selector={(state) => [state.canSubmit, state.isSubmitting] as const}
      >
        {([canSubmit, isSubmitting]) => (
          <Button
            type="submit"
            disabled={!canSubmit || isSubmitting}
            className="h-12"
          >
            {mode === "creer"
              ? "Créer l'événement"
              : "Enregistrer les modifications"}
          </Button>
        )}
      </form.Subscribe>
    </form>
  );
}
