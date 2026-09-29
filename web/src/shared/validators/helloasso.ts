import { z } from "zod";
import { permanenceBilletSchema } from "@/shared/validators/permanence";

export const helloassoCommandeSchema = z.object({
  /** Nom complet de la personne qui a payé. */
  nom: z.string().trim().min(1, "Le nom est requis."),
  email: z
    .string()
    .trim()
    .min(1, "L'email est requis.")
    .email("Email invalide."),
  billets: z
    .array(permanenceBilletSchema)
    .min(1, "Au moins un billet est requis."),
  helloassoPaymentId: z
    .string()
    .trim()
    .min(1, "Le paiement HelloAsso est requis."),
});

export type HelloassoCommandeInput = z.infer<typeof helloassoCommandeSchema>;
