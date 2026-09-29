"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/server/db/client";
import {
  creerSmtpSender,
  envoyerEmailCommande,
  getAppUrl,
} from "@/server/services/email";
import { obtenirEvenementDeCommande } from "@/server/services/evenements";
import {
  creerCommandePermanence,
  invaliderBillet,
  listerBillets,
  obtenirCommandeAvecBillets,
  obtenirStatsBillets,
  obtenirStatsEvenement,
  reactiverBillet,
  scannerBillet,
  versBilletListe,
} from "@/server/services/tickets";
import type { StatutFilter } from "@/shared/lib/search-params";
import { commandeIdSchema } from "@/shared/validators/commande";
import {
  type PermanenceCommandeInput,
  permanenceCommandeSchema,
} from "@/shared/validators/permanence";

export async function creerPermanenceAction(input: PermanenceCommandeInput) {
  const parsed = permanenceCommandeSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false as const, error: "Formulaire invalide." };
  }

  try {
    const { commande, billets } = await creerCommandePermanence(
      db,
      parsed.data,
    );
    revalidatePath("/admin/billets");

    let emailError: string | undefined;
    try {
      const evenement = await obtenirEvenementDeCommande(db, commande.id);
      if (!evenement) throw new Error("Aucun événement actif.");
      await envoyerEmailCommande(
        creerSmtpSender(),
        {
          commandeId: commande.id,
          nom: commande.nom,
          email: commande.email,
          billets: billets.map(versBilletListe),
        },
        evenement,
        getAppUrl(),
      );
    } catch (error) {
      console.error("Échec de l'envoi de l'email de commande", error);
      emailError =
        "Billet créé, mais l'email n'a pas pu être envoyé. Réessaie ou transmets-le manuellement.";
    }

    return { success: true as const, commande, billets, emailError };
  } catch {
    return {
      success: false as const,
      error: "Aucun événement actif : impossible de créer le billet.",
    };
  }
}

export async function invaliderBilletAction(billetId: string): Promise<void> {
  await invaliderBillet(db, billetId);
  revalidatePath("/admin/billets");
}

export async function reactiverBilletAction(billetId: string): Promise<void> {
  await reactiverBillet(db, billetId);
  revalidatePath("/admin/billets");
}

export async function listerBilletsAction(filtres: {
  q: string;
  statut: StatutFilter;
}) {
  return listerBillets(db, filtres);
}

export async function obtenirStatsBilletsAction() {
  return obtenirStatsBillets(db);
}

export async function obtenirCommandeAction(commandeId: string) {
  const parsed = commandeIdSchema.safeParse(commandeId);
  if (!parsed.success) return null;
  return obtenirCommandeAvecBillets(db, parsed.data);
}

export async function scannerBilletAction(code: string) {
  const resultat = await scannerBillet(db, code);
  if (resultat.type === "valide") {
    revalidatePath("/admin/billets");
  }
  return resultat;
}
