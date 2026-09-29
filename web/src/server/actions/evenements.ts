"use server";

import { revalidatePath } from "next/cache";
import { returnServerError } from "next-safe-action";
import {
  adminActionClient,
  scannerActionClient,
} from "@/server/actions/safe-action";
import { db } from "@/server/db/client";
import {
  creerEvenement,
  listerEvenements,
  modifierEvenementActif,
  obtenirEvenementActif,
} from "@/server/services/evenements";
import { parseEuros } from "@/shared/lib/prix";
import { enregistrerEvenementSchema } from "@/shared/validators/evenement";

export const obtenirEvenementActifAction = scannerActionClient.action(() =>
  obtenirEvenementActif(db),
);

export const listerEvenementsAction = adminActionClient.action(() =>
  listerEvenements(db),
);

/**
 * `creer` : nouvel événement actif (désactive le précédent, mot de passe requis).
 * `modifier` : édite l'événement actif (mot de passe vide = inchangé).
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
      prixTicketBoissonCentimes: parseEuros(parsedInput.prixTicketBoisson) ?? 0,
      motDePasse: parsedInput.motDePasse,
    };

    if (parsedInput.mode === "creer") {
      await creerEvenement(db, donnees);
    } else {
      if (!(await obtenirEvenementActif(db))) {
        returnServerError("Aucun événement actif à modifier.");
      }
      await modifierEvenementActif(db, donnees);
    }

    revalidatePath("/", "layout");
    return { success: true as const };
  });
