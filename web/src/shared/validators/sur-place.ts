import type { z } from "zod";
import { permanenceCommandeSchema } from "@/shared/validators/permanence";

/** Vente sur place : comme la permanence, mais sans email (aucun QR n'est envoyé). */
export const surPlaceCommandeSchema = permanenceCommandeSchema.omit({
  email: true,
});

export type SurPlaceCommandeInput = z.infer<typeof surPlaceCommandeSchema>;
