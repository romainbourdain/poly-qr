import { z } from "zod";
import { MOYENS_PAIEMENT } from "@/shared/lib/types";

export const permanenceBilletSchema = z.object({
  ticketsBoisson: z.number().int().min(0),
});

export const permanenceCommandeSchema = z.object({
  nom: z.string().trim().min(1, "Le nom est requis."),
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
