"use client";

import { Dialog } from "@base-ui/react/dialog";
import { useForm } from "@tanstack/react-form";
import { useState } from "react";
import { Button } from "@/client/components/ui/button";
import { Checkbox } from "@/client/components/ui/checkbox";
import { TextField } from "@/client/components/ui/text-field";
import { applyFieldErrors } from "@/client/lib/apply-action-errors";
import { modifierBilletAction } from "@/server/actions/tickets";
import { actionErrorsToForm } from "@/shared/lib/form-errors";
import type { BilletAdmin } from "@/shared/lib/types";
import { modifierBilletSchema } from "@/shared/validators/modifier-billet";

/** Corrige le nom, le prénom ou le tarif d'un billet (modale ouverte depuis le menu d'actions). */
export function ModifierBilletDialog({
  billet,
  onClose,
}: {
  billet: BilletAdmin | null;
  onClose: () => void;
}) {
  return (
    <Dialog.Root
      open={billet !== null}
      onOpenChange={(ouvert) => {
        if (!ouvert) onClose();
      }}
    >
      <Dialog.Portal>
        <Dialog.Backdrop className="fixed inset-0 z-40 bg-black/70 transition-opacity data-[ending-style]:opacity-0 data-[starting-style]:opacity-0" />
        <Dialog.Popup className="fixed inset-x-4 top-[10vh] z-50 mx-auto w-full max-w-md rounded-[18px] border border-line bg-ink-2 p-5 transition-opacity data-[ending-style]:opacity-0 data-[starting-style]:opacity-0 sm:p-6">
          <Dialog.Title className="font-display font-extrabold text-[20px]">
            Modifier le billet
          </Dialog.Title>
          <Dialog.Description className="mt-1 mb-5 text-[13.5px] text-muted">
            Le nombre de tickets boisson et l&apos;email ne se changent pas ici.
          </Dialog.Description>
          {billet && (
            <ModifierBilletForm
              key={billet.id}
              billet={billet}
              onDone={onClose}
            />
          )}
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

function ModifierBilletForm({
  billet,
  onDone,
}: {
  billet: BilletAdmin;
  onDone: () => void;
}) {
  const [error, setError] = useState<string | null>(null);
  const form = useForm({
    defaultValues: {
      nom: billet.nom,
      prenom: billet.prenom,
      cotisant: billet.cotisant,
    },
    validators: { onChange: modifierBilletSchema },
    onSubmit: async ({ value }) => {
      setError(null);
      const result = await modifierBilletAction({
        ...modifierBilletSchema.parse(value),
        billetId: billet.id,
      });
      if (result?.serverError || result?.validationErrors) {
        const errors = actionErrorsToForm(result);
        applyFieldErrors(form, errors.fields);
        setError(errors.form ?? null);
        return;
      }
      onDone();
    },
  });

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        form.handleSubmit();
      }}
      className="flex flex-col gap-5"
    >
      <form.Field name="nom">
        {(field) => <TextField field={field} label="Nom" autoComplete="off" />}
      </form.Field>
      <form.Field name="prenom">
        {(field) => (
          <TextField field={field} label="Prénom" autoComplete="off" />
        )}
      </form.Field>
      <form.Field name="cotisant">
        {(field) => (
          <Checkbox
            label="Cotisant"
            checked={field.state.value}
            onCheckedChange={(coche) => field.handleChange(coche)}
          />
        )}
      </form.Field>

      {error && (
        <div role="alert" className="font-semibold text-[13px] text-bad">
          {error}
        </div>
      )}

      <form.Subscribe selector={(state) => state.canSubmit}>
        {(canSubmit) => (
          <div className="flex justify-end gap-2">
            <Dialog.Close render={<Button variant="ghost" className="h-12" />}>
              Annuler
            </Dialog.Close>
            <Button type="submit" disabled={!canSubmit} className="h-12">
              Enregistrer
            </Button>
          </div>
        )}
      </form.Subscribe>
    </form>
  );
}
