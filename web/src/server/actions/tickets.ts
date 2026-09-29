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
import {
  obtenirEvenement,
  obtenirEvenementDeCommande,
} from "@/server/services/evenements";
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
  evenementIdSchema,
  scanCodeSchema,
} from "@/shared/validators/commande";
import { permanenceCommandeSchema } from "@/shared/validators/permanence";

const filtresSchema = z.object({
  q: z.string(),
  statut: z.enum(STATUT_FILTERS),
});

const evenementSchema = z.object({ evenementId: evenementIdSchema });

export const creerPermanenceAction = adminActionClient
  .inputSchema(permanenceCommandeSchema.extend(evenementSchema.shape))
  .action(async ({ parsedInput: { evenementId, ...input } }) => {
    if (!(await obtenirEvenement(db, evenementId))) {
      return returnServerError("Cet événement n'existe plus.");
    }
    const { commande, billets } = await creerCommandePermanence(
      db,
      evenementId,
      input,
    );
    revalidatePath("/admin/billets");

    let emailError: string | undefined;
    try {
      const evenement = await obtenirEvenementDeCommande(db, commande.id);
      if (!evenement) throw new Error("Événement introuvable.");
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

/** Admin : billets d'un événement choisi. */
export const listerBilletsAction = adminActionClient
  .inputSchema(filtresSchema.extend(evenementSchema.shape))
  .action(({ parsedInput: { evenementId, ...filtres } }) =>
    listerBillets(db, evenementId, filtres),
  );

export const obtenirStatsBilletsAction = adminActionClient
  .inputSchema(evenementSchema)
  .action(({ parsedInput: { evenementId } }) =>
    obtenirStatsBillets(db, evenementId),
  );

/** Scanner : liste des billets de l'événement de la session (pour le simulateur). */
export const listerBilletsScannerAction = scannerActionClient.action(
  ({ ctx }) => listerBillets(db, ctx.evenementId, { q: "", statut: "tous" }),
);

export const obtenirStatsBilletsScannerAction = scannerActionClient.action(
  ({ ctx }) => obtenirStatsBillets(db, ctx.evenementId),
);

/** Public : la page billet est accessible à l'acheteur via l'UUID de sa commande. */
export const obtenirCommandeAction = actionClient
  .inputSchema(commandeIdSchema)
  .action(({ parsedInput: commandeId }) =>
    obtenirCommandeAvecBillets(db, commandeId),
  );

export const scannerBilletAction = scannerActionClient
  .inputSchema(scanCodeSchema)
  .action(async ({ parsedInput: code, ctx }) => {
    const resultat = await scannerBillet(db, ctx.evenementId, code);
    if (resultat.type === "valide") {
      revalidatePath("/admin/billets");
    }
    return resultat;
  });
