"use client";

import { useForm } from "@tanstack/react-form";
import { TicketStepperField } from "@/client/components/admin/ticket-stepper-field";
import { Button } from "@/client/components/ui/button";
import { CARD_CLASSES } from "@/client/components/ui/card";
import { Separator } from "@/client/components/ui/separator";
import { TextField } from "@/client/components/ui/text-field";
import { useTicketStore } from "@/client/store/ticket-store";
import { cn } from "@/shared/lib/cn";
import type { Ticket } from "@/shared/lib/types";
import { newTicketSchema } from "@/shared/validators/new-ticket";

export function NewTicketForm({
  onCreated,
}: {
  onCreated: (ticket: Ticket) => void;
}) {
  const { addTicket } = useTicketStore();

  const form = useForm({
    defaultValues: {
      nom: "",
      email: "",
      entrees: 1,
      boisson: 0,
    },
    validators: {
      onChange: newTicketSchema,
    },
    onSubmit: ({ value }) => {
      const ticket = addTicket({
        nom: value.nom.trim(),
        email: value.email.trim(),
        entrees: value.entrees,
        ticketsBoisson: value.boisson,
      });
      onCreated(ticket);
      form.reset();
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
            description="C'est l'adresse qui recevra le QR code."
          />
        )}
      </form.Field>

      <form.Field name="entrees">
        {(field) => (
          <TicketStepperField
            field={field}
            label="Nombre d'entrées sur ce billet"
            hint={
              "1 = une seule personne.\nAu-delà, tout le monde entre au même scan."
            }
            min={1}
          />
        )}
      </form.Field>

      <form.Field name="boisson">
        {(field) => (
          <TicketStepperField
            field={field}
            label="Tickets boisson achetés (total)"
            hint={
              "Remis en papier à l'entrée,\nen une fois, au scan du billet."
            }
          />
        )}
      </form.Field>

      <Separator />

      <form.Subscribe selector={(state) => state.canSubmit}>
        {(canSubmit) => (
          <Button
            type="submit"
            disabled={!canSubmit}
            className="h-13 text-[15.5px]"
          >
            Créer et envoyer le QR
          </Button>
        )}
      </form.Subscribe>
    </form>
  );
}
