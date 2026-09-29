"use client";

import { useForm } from "@tanstack/react-form";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/client/components/ui/button";
import { CARD_CLASSES } from "@/client/components/ui/card";
import { Field } from "@/client/components/ui/field";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/client/components/ui/input-group";
import { TextField } from "@/client/components/ui/text-field";
import { applyFieldErrors } from "@/client/lib/apply-action-errors";
import { enregistrerEvenementAction } from "@/server/actions/evenements";
import { cn } from "@/shared/lib/cn";
import { actionErrorsToForm } from "@/shared/lib/form-errors";
import { centimesVersSaisie } from "@/shared/lib/prix";
import type { Evenement } from "@/shared/lib/types";
import { evenementSchema } from "@/shared/validators/evenement";

function LockIcon({ ouvert = false }: { ouvert?: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect x="5" y="11" width="14" height="9" rx="2" />
      <path
        d={ouvert ? "M8 11V8a4 4 0 0 1 7.5-2" : "M8 11V8a4 4 0 0 1 8 0v3"}
      />
    </svg>
  );
}

export function EvenementForm({
  mode,
  initial,
  titre,
}: {
  mode: "creer" | "modifier";
  initial?: Evenement | null;
  /** Titre affiché en tête de la card. */
  titre?: string;
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [changerMotDePasse, setChangerMotDePasse] = useState(false);

  const form = useForm({
    defaultValues: {
      nom: initial?.nom ?? "",
      date: initial?.dateIso ?? "",
      heure: initial?.heureIso ?? "",
      lieu: initial?.lieu ?? "",
      prixBillet: centimesVersSaisie(initial?.prixBilletCentimes ?? 0),
      prixBilletSurPlace: centimesVersSaisie(
        initial?.prixBilletSurPlaceCentimes ?? 0,
      ),
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
      setChangerMotDePasse(false);
      form.setFieldValue("motDePasse", "");
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
      {titre && <h2 className="font-bold text-[16px]">{titre}</h2>}
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

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
        <form.Field name="prixBillet">
          {(field) => (
            <TextField
              field={field}
              label="Billet en pré-vente (€)"
              inputMode="decimal"
            />
          )}
        </form.Field>
        <form.Field name="prixBilletSurPlace">
          {(field) => (
            <TextField
              field={field}
              label="Billet sur place (€)"
              inputMode="decimal"
            />
          )}
        </form.Field>
        <form.Field name="prixTicketBoisson">
          {(field) => (
            <TextField
              field={field}
              label="Ticket boisson (€)"
              inputMode="decimal"
            />
          )}
        </form.Field>
      </div>

      {mode === "modifier" && !changerMotDePasse ? (
        <Field.Root>
          <Field.Label htmlFor="mot-de-passe-actuel">
            Mot de passe scanner
          </Field.Label>
          <InputGroup>
            <InputGroupAddon>
              <LockIcon />
            </InputGroupAddon>
            <InputGroupInput
              id="mot-de-passe-actuel"
              value="••••••••"
              disabled
              readOnly
              aria-describedby="mot-de-passe-actuel-aide"
            />
            <InputGroupButton onClick={() => setChangerMotDePasse(true)}>
              Changer
            </InputGroupButton>
          </InputGroup>
          <Field.Description id="mot-de-passe-actuel-aide">
            Masqué : définis-en un nouveau pour le remplacer.
          </Field.Description>
        </Field.Root>
      ) : (
        <form.Field name="motDePasse">
          {(field) =>
            mode === "modifier" ? (
              <Field.Root>
                <Field.Label htmlFor={field.name}>
                  Nouveau mot de passe scanner
                </Field.Label>
                <InputGroup>
                  <InputGroupAddon>
                    <LockIcon ouvert />
                  </InputGroupAddon>
                  <InputGroupInput
                    id={field.name}
                    name={field.name}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onValueChange={field.handleChange}
                    autoComplete="off"
                    autoFocus
                  />
                  <InputGroupButton
                    onClick={() => {
                      field.handleChange("");
                      setChangerMotDePasse(false);
                    }}
                  >
                    Garder l&apos;actuel
                  </InputGroupButton>
                </InputGroup>
                <Field.Description>
                  Demandé pour scanner les QR codes de cet événement
                </Field.Description>
              </Field.Root>
            ) : (
              <TextField
                field={field}
                label="Mot de passe scanner"
                description="Demandé pour scanner les QR codes de cet événement"
                autoComplete="off"
              />
            )
          }
        </form.Field>
      )}

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
