"use server";

import { revalidatePath } from "next/cache";
import { returnServerError } from "next-safe-action";
import { z } from "zod";
import {
  actionClient,
  adminActionClient,
  scannerActionClient,
} from "@/server/actions/safe-action";
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
  reactiverBillet,
  scannerBillet,
  versBilletListe,
} from "@/server/services/tickets";
import { STATUT_FILTERS } from "@/shared/lib/search-params";
import {
  billetIdSchema,
  commandeIdSchema,
  scanCodeSchema,
} from "@/shared/validators/commande";
import { permanenceCommandeSchema } from "@/shared/validators/permanence";

const AUCUN_EVENEMENT_ACTIF = "Aucun événement actif.";

const filtresSchema = z.object({
  q: z.string(),
  statut: z.enum(STATUT_FILTERS),
});

export const creerPermanenceAction = adminActionClient
  .inputSchema(permanenceCommandeSchema)
  .action(async ({ parsedInput }) => {
    const creation = await creerCommandePermanence(db, parsedInput).catch(
      (error) => {
        if (error instanceof Error && error.message === AUCUN_EVENEMENT_ACTIF) {
          return returnServerError(
            "Aucun événement actif : impossible de créer le billet.",
          );
        }
        throw error;
      },
    );
    const { commande, billets } = creation;
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

    return { commande, billets, emailError };
  });

export const invaliderBilletAction = adminActionClient
  .inputSchema(billetIdSchema)
  .action(async ({ parsedInput: billetId }) => {
    await invaliderBillet(db, billetId);
    revalidatePath("/admin/billets");
  });

export const reactiverBilletAction = adminActionClient
  .inputSchema(billetIdSchema)
  .action(async ({ parsedInput: billetId }) => {
    await reactiverBillet(db, billetId);
    revalidatePath("/admin/billets");
  });

export const listerBilletsAction = scannerActionClient
  .inputSchema(filtresSchema)
  .action(({ parsedInput }) => listerBillets(db, parsedInput));

export const obtenirStatsBilletsAction = scannerActionClient.action(() =>
  obtenirStatsBillets(db),
);

/** Public : la page billet est accessible à l'acheteur via l'UUID de sa commande. */
export const obtenirCommandeAction = actionClient
  .inputSchema(commandeIdSchema)
  .action(({ parsedInput: commandeId }) =>
    obtenirCommandeAvecBillets(db, commandeId),
  );

export const scannerBilletAction = scannerActionClient
  .inputSchema(scanCodeSchema)
  .action(async ({ parsedInput: code }) => {
    const resultat = await scannerBillet(db, code);
    if (resultat.type === "valide") {
      revalidatePath("/admin/billets");
    }
    return resultat;
  });
