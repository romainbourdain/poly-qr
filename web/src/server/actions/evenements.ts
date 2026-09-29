"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/server/db/client";
import {
  creerEvenement,
  listerEvenements,
  modifierEvenementActif,
  obtenirEvenementActif,
} from "@/server/services/evenements";
import { parseEuros } from "@/shared/lib/prix";
import {
  type EvenementInput,
  evenementSchema,
} from "@/shared/validators/evenement";

export async function obtenirEvenementActifAction() {
  return obtenirEvenementActif(db);
}

export async function listerEvenementsAction() {
  return listerEvenements(db);
}

/**
 * `creer` : nouvel événement actif (désactive le précédent, mot de passe requis).
 * `modifier` : édite l'événement actif (mot de passe vide = inchangé).
 */
export async function enregistrerEvenementAction(
  mode: "creer" | "modifier",
  input: EvenementInput,
): Promise<{ success: true } | { success: false; error: string }> {
  const parsed = evenementSchema.safeParse(input);
  const prixBilletCentimes = parseEuros(input.prixBillet);
  const prixTicketBoissonCentimes = parseEuros(input.prixTicketBoisson);
  if (
    !parsed.success ||
    prixBilletCentimes === null ||
    prixTicketBoissonCentimes === null
  ) {
    return { success: false, error: "Formulaire invalide." };
  }

  if (mode === "creer" && !parsed.data.motDePasse) {
    return { success: false, error: "Le mot de passe est requis." };
  }

  const donnees = {
    nom: parsed.data.nom,
    date: parsed.data.date,
    heure: parsed.data.heure,
    lieu: parsed.data.lieu,
    prixBilletCentimes,
    prixTicketBoissonCentimes,
    motDePasse: parsed.data.motDePasse,
  };

  try {
    if (mode === "creer") {
      await creerEvenement(db, donnees);
    } else {
      await modifierEvenementActif(db, donnees);
    }
  } catch {
    return { success: false, error: "Aucun événement actif à modifier." };
  }

  revalidatePath("/", "layout");
  return { success: true };
}
