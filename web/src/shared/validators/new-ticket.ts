import { z } from "zod";

export const newTicketSchema = z.object({
  nom: z.string().trim().min(1, "Le nom est requis."),
  email: z
    .string()
    .trim()
    .min(1, "L'email est requis.")
    .email("Email invalide."),
  entrees: z.number().int().min(1, "Au moins une entrée."),
  boisson: z.number().int().min(0),
});

export type NewTicketInput = z.infer<typeof newTicketSchema>;
