import { z } from "zod";

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
  billets: z
    .array(permanenceBilletSchema)
    .min(1, "Au moins un billet est requis."),
});

export type PermanenceCommandeInput = z.infer<typeof permanenceCommandeSchema>;
