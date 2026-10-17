import { z } from "zod";
import { MOYENS_PAIEMENT } from "@/shared/lib/types";

/**
 * Achat de tickets boisson sans nouveau billet : pour un billet existant
 * (`billetId`), ou pour un·e invité·e sans billet (`invite`, avec son nom et
 * l'événement).
 *
 * Les erreurs sur `billetId` et `evenementId` sont sans chemin : ces champs ne
 * sont pas affichés dans le formulaire, et une erreur par champ y resterait
 * collée une fois ajoutée.
 */
export const boissonSchema = z
  .object({
    invite: z.boolean(),
    billetId: z.string(),
    evenementId: z.string(),
    prenom: z.string().trim(),
    nom: z.string().trim(),
    quantite: z.number().int().min(1, "Au moins un ticket."),
    moyenPaiement: z.enum(MOYENS_PAIEMENT, {
      message: "Le moyen de paiement est requis.",
    }),
  })
  .superRefine((valeur, ctx) => {
    if (!valeur.invite) {
      if (!z.string().uuid().safeParse(valeur.billetId).success) {
        ctx.addIssue({
          code: "custom",
          path: [],
          message: "Choisis une personne.",
        });
      }
      return;
    }
    if (!z.string().uuid().safeParse(valeur.evenementId).success) {
      ctx.addIssue({
        code: "custom",
        path: [],
        message: "L'événement est requis.",
      });
    }
    if (!valeur.prenom) {
      ctx.addIssue({
        code: "custom",
        path: ["prenom"],
        message: "Le prénom est requis.",
      });
    }
    if (!valeur.nom) {
      ctx.addIssue({
        code: "custom",
        path: ["nom"],
        message: "Le nom est requis.",
      });
    }
  });

export type BoissonInput = z.infer<typeof boissonSchema>;
