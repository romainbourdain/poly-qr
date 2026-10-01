import { z } from "zod";
import { billetIdSchema } from "@/shared/validators/commande";

/** Correction de l'identité ou du tarif d'un billet existant. */
export const modifierBilletSchema = z.object({
  nom: z.string().trim().min(1, "Le nom est requis."),
  prenom: z.string().trim().min(1, "Le prénom est requis."),
  cotisant: z.boolean(),
});

export const modifierBilletActionSchema = modifierBilletSchema.extend({
  billetId: billetIdSchema,
});

export type ModifierBilletInput = z.infer<typeof modifierBilletSchema>;
