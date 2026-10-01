"use client";

import { useForm } from "@tanstack/react-form";
import { useEffect, useState } from "react";
import { TicketStepperField } from "@/client/components/admin/ticket-stepper-field";
import { Badge } from "@/client/components/ui/badge";
import { Button } from "@/client/components/ui/button";
import { CARD_CLASSES } from "@/client/components/ui/card";
import { Field } from "@/client/components/ui/field";
import { Input } from "@/client/components/ui/input";
import { SelectField } from "@/client/components/ui/select-field";
import { Separator } from "@/client/components/ui/separator";
import { applyFieldErrors } from "@/client/lib/apply-action-errors";
import {
  ajouterBoissonAction,
  listerBilletsEvenementAction,
} from "@/server/actions/tickets";
import { cn } from "@/shared/lib/cn";
import { actionErrorsToForm } from "@/shared/lib/form-errors";
import { formatEuros } from "@/shared/lib/prix";
import {
  MOYEN_PAIEMENT_LABEL,
  nomComplet,
  normaliser,
  STATUT_BADGE_VARIANT,
  STATUT_LABEL,
} from "@/shared/lib/tickets";
import {
  type BilletAdmin,
  MOYENS_PAIEMENT,
  type MoyenPaiement,
} from "@/shared/lib/types";
import { boissonSchema } from "@/shared/validators/boisson";

const MAX_RESULTATS = 8;

/**
 * Ajout de tickets boisson pour quelqu'un qui a déjà un billet : on retrouve la
 * personne par son nom ou son prénom, puis on encaisse les tickets (nouvel achat
 * avec son propre moyen de paiement, sans nouveau billet).
 */
export function BoissonForm({
  evenementId,
  prixTicketBoisson,
}: {
  evenementId: string;
  prixTicketBoisson: number;
}) {
  const [billets, setBillets] = useState<BilletAdmin[]>([]);
  const [chargement, setChargement] = useState(true);
  const [recherche, setRecherche] = useState("");
  const [choisi, setChoisi] = useState<BilletAdmin | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [succes, setSucces] = useState<string | null>(null);

  async function charger() {
    const result = await listerBilletsEvenementAction({ evenementId });
    setBillets(result?.data ?? []);
    setChargement(false);
  }

  // biome-ignore lint/correctness/useExhaustiveDependencies: chargement unique par événement
  useEffect(() => {
    charger();
  }, [evenementId]);

  const form = useForm({
    defaultValues: {
      billetId: "",
      quantite: 1,
      moyenPaiement: "" as MoyenPaiement | "",
    },
    validators: { onChange: boissonSchema },
    onSubmit: async ({ value }) => {
      setError(null);
      setSucces(null);
      const result = await ajouterBoissonAction(boissonSchema.parse(value));
      if (!result?.data) {
        const errors = actionErrorsToForm(result);
        applyFieldErrors(form, errors.fields);
        setError(errors.form ?? null);
        return;
      }
      const qui = choisi ? nomComplet(choisi.prenom, choisi.nom) : "";
      setSucces(
        `${value.quantite} ticket${value.quantite > 1 ? "s" : ""} boisson ajouté${value.quantite > 1 ? "s" : ""} pour ${qui}.`,
      );
      setChoisi(null);
      setRecherche("");
      form.reset();
      await charger();
    },
  });

  const terme = normaliser(recherche);
  const resultats =
    terme.length < 2
      ? []
      : billets
          .filter(
            (b) =>
              normaliser(`${b.prenom} ${b.nom}`).includes(terme) ||
              normaliser(`${b.nom} ${b.prenom}`).includes(terme),
          )
          .slice(0, MAX_RESULTATS);

  function choisir(billet: BilletAdmin) {
    setChoisi(billet);
    setSucces(null);
    form.setFieldValue("billetId", billet.id);
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        form.handleSubmit();
      }}
      className={cn(CARD_CLASSES, "flex w-full max-w-2xl flex-col gap-5")}
    >
      {choisi ? (
        <div className="flex items-center justify-between gap-3 rounded-2xl border border-line-2 bg-ink-3 p-4">
          <div className="flex min-w-0 flex-col gap-0.5">
            <span className="truncate font-bold text-[15px]">
              {nomComplet(choisi.prenom, choisi.nom)}
            </span>
            <span className="text-[13px] text-muted">
              {choisi.ticketsBoisson} ticket
              {choisi.ticketsBoisson > 1 ? "s" : ""} boisson actuellement
            </span>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => {
              setChoisi(null);
              form.setFieldValue("billetId", "");
            }}
          >
            Changer
          </Button>
        </div>
      ) : (
        <Field.Root>
          <Field.Label htmlFor="recherche-billet">
            Personne qui a déjà un billet
          </Field.Label>
          <Input
            id="recherche-billet"
            type="search"
            value={recherche}
            onValueChange={setRecherche}
            placeholder="Nom ou prénom"
            autoComplete="off"
          />
          {terme.length < 2 ? (
            <p className="text-[13px] text-muted">
              {chargement
                ? "Chargement des billets…"
                : "Tape au moins 2 lettres du nom ou du prénom."}
            </p>
          ) : resultats.length === 0 ? (
            <p role="status" className="text-[13px] text-muted">
              Aucun billet à ce nom.
            </p>
          ) : (
            <ul className="flex flex-col gap-1.5">
              {resultats.map((b) => {
                const invalide = b.statut === "invalide";
                return (
                  <li key={b.id}>
                    <button
                      type="button"
                      disabled={invalide}
                      onClick={() => choisir(b)}
                      className="flex min-h-12 w-full items-center gap-3 rounded-xl border border-line-2 bg-ink-3 px-4 py-2.5 text-left transition-colors enabled:hover:bg-ink-4 disabled:opacity-50"
                    >
                      <span className="flex-1 truncate font-semibold text-[15px]">
                        {nomComplet(b.prenom, b.nom)}
                      </span>
                      <Badge variant={STATUT_BADGE_VARIANT[b.statut]}>
                        {STATUT_LABEL[b.statut]}
                      </Badge>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </Field.Root>
      )}

      <form.Field name="quantite">
        {(field) => (
          <TicketStepperField
            field={field}
            label="Tickets boisson"
            min={1}
            hint={"Remis en papier tout de suite,\nà l'encaissement."}
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

      {error && (
        <div role="alert" className="font-semibold text-[13px] text-bad">
          {error}
        </div>
      )}
      {succes && !error && (
        <div role="status" className="font-semibold text-[13px] text-good">
          {succes}
        </div>
      )}

      <Separator />

      <form.Subscribe
        selector={(state) => [state.canSubmit, state.values] as const}
      >
        {([canSubmit, values]) => (
          <>
            <div className="flex items-baseline justify-between gap-3">
              <span className="font-bold text-[13px] text-muted">
                Total à payer
              </span>
              <span
                className="font-bold font-display text-[24px]"
                data-testid="total-a-payer"
              >
                {formatEuros(values.quantite * prixTicketBoisson)}
              </span>
            </div>
            <Button
              type="submit"
              disabled={!canSubmit || !choisi}
              className="h-13 text-[15.5px]"
            >
              Encaisser les tickets
            </Button>
          </>
        )}
      </form.Subscribe>
    </form>
  );
}
