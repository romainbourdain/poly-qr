import { z } from "zod";
import { MOYENS_PAIEMENT } from "@/shared/lib/types";
import { billetIdSchema } from "@/shared/validators/commande";

/** Achat de tickets boisson pour un billet existant (sans nouveau billet). */
export const boissonSchema = z.object({
  billetId: billetIdSchema,
  quantite: z.number().int().min(1, "Au moins un ticket."),
  moyenPaiement: z.enum(MOYENS_PAIEMENT, {
    message: "Le moyen de paiement est requis.",
  }),
});

export type BoissonInput = z.infer<typeof boissonSchema>;
