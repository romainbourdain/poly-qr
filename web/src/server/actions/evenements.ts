"use server";

import { revalidatePath } from "next/cache";
import { returnServerError } from "next-safe-action";
import { adminActionClient } from "@/server/actions/safe-action";
import { db } from "@/server/db/client";
import {
  creerEvenement,
  EvenementIntrouvableError,
  listerEvenements,
  modifierEvenement,
} from "@/server/services/evenements";
import { parseEuros } from "@/shared/lib/prix";
import { enregistrerEvenementSchema } from "@/shared/validators/evenement";

export const listerEvenementsAction = adminActionClient.action(() =>
  listerEvenements(db),
);

/**
 * `creer` : nouvel événement (mot de passe requis), renvoie son id.
 * `modifier` : édite l'événement `evenementId` (mot de passe vide = inchangé).
 */
export const enregistrerEvenementAction = adminActionClient
  .inputSchema(enregistrerEvenementSchema)
  .action(async ({ parsedInput }) => {
    // Le schéma garantit que les prix sont parsables.
    const donnees = {
      nom: parsedInput.nom,
      date: parsedInput.date,
      heure: parsedInput.heure,
      lieu: parsedInput.lieu,
      prixBilletCentimes: parseEuros(parsedInput.prixBillet) ?? 0,
      prixBilletSurPlaceCentimes:
        parseEuros(parsedInput.prixBilletSurPlace) ?? 0,
      prixTicketBoissonCentimes: parseEuros(parsedInput.prixTicketBoisson) ?? 0,
      motDePasse: parsedInput.motDePasse,
    };

    let evenementId: string;
    if (parsedInput.mode === "creer") {
      evenementId = (await creerEvenement(db, donnees)).id;
    } else {
      const id = parsedInput.evenementId as string;
      await modifierEvenement(db, id, donnees).catch((error) => {
        if (error instanceof EvenementIntrouvableError) {
          return returnServerError("Cet événement n'existe plus.");
        }
        throw error;
      });
      evenementId = id;
    }

    revalidatePath("/", "layout");
    return { success: true as const, evenementId };
  });
