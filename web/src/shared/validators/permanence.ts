import { z } from "zod";
import { MOYENS_PAIEMENT } from "@/shared/lib/types";

/** Un billet nominatif : la personne qui entre, et ses tickets boisson. */
export const permanenceBilletSchema = z.object({
  nom: z.string().trim().min(1, "Le nom est requis."),
  prenom: z.string().trim().min(1, "Le prénom est requis."),
  ticketsBoisson: z.number().int().min(0),
});

/**
 * Le premier billet est celui de l'acheteur·se : son nom et son prénom sont
 * ceux de la commande.
 */
export const permanenceCommandeSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, "L'email est requis.")
    .email("Email invalide."),
  moyenPaiement: z.enum(MOYENS_PAIEMENT, {
    message: "Le moyen de paiement est requis.",
  }),
  billets: z
    .array(permanenceBilletSchema)
    .min(1, "Au moins un billet est requis."),
});

export type PermanenceCommandeInput = z.infer<typeof permanenceCommandeSchema>;
