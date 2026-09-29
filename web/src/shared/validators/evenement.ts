import { z } from "zod";
import { parseEuros } from "@/shared/lib/prix";

const prixSchema = z
  .string()
  .refine((valeur) => parseEuros(valeur) !== null, "Prix invalide (ex. 5,50).");

/** Saisie du formulaire : prix en euros, mot de passe vide = inchangé (édition). */
export const evenementSchema = z.object({
  nom: z.string().trim().min(1, "Le nom est requis."),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "La date est requise."),
  heure: z.string().regex(/^\d{2}:\d{2}$/, "L'heure est requise."),
  lieu: z.string().trim().min(1, "Le lieu est requis."),
  prixBillet: prixSchema,
  prixTicketBoisson: prixSchema,
  motDePasse: z.string(),
});

export type EvenementInput = z.infer<typeof evenementSchema>;
