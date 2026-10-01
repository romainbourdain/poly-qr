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
  creerEmailSender,
  envoyerEmailCommande,
  getAppUrl,
} from "@/server/services/email";
import {
  obtenirEvenement,
  obtenirEvenementDeCommande,
} from "@/server/services/evenements";
import {
  ajouterTicketsBoisson,
  BilletIntrouvableError,
  BilletInvalideError,
  compterBillets,
  creerCommandePermanence,
  creerCommandeSurPlace,
  invaliderBillet,
  listerBillets,
  modifierBillet,
  obtenirCommandeAvecBillets,
  obtenirStatsBillets,
  reactiverBillet,
  scannerBillet,
} from "@/server/services/tickets";
import {
  SORT_ORDERS,
  STATUT_FILTERS,
  TICKET_SORTS,
} from "@/shared/lib/search-params";
import { boissonSchema } from "@/shared/validators/boisson";
import {
  billetIdSchema,
  commandeIdSchema,
  evenementIdSchema,
  scanCodeSchema,
} from "@/shared/validators/commande";
import { modifierBilletActionSchema } from "@/shared/validators/modifier-billet";
import { permanenceCommandeSchema } from "@/shared/validators/permanence";
import { surPlaceCommandeSchema } from "@/shared/validators/sur-place";

const filtresSchema = z.object({
  q: z.string(),
  statut: z.enum(STATUT_FILTERS),
  tri: z.enum(TICKET_SORTS),
  ordre: z.enum(SORT_ORDERS),
  page: z.number().int().min(1),
});

const evenementSchema = z.object({ evenementId: evenementIdSchema });

/** Envoie (ou renvoie) l'email complet d'une commande : ses billets valides, avec QR et PDF. */
async function envoyerCommandeParEmail(commandeId: string): Promise<void> {
  const commande = await obtenirCommandeAvecBillets(db, commandeId);
  const evenement = await obtenirEvenementDeCommande(db, commandeId);
  if (!commande || !evenement) throw new Error("Commande introuvable.");
  if (!commande.email) throw new Error("Commande sans email.");
  const billets = commande.billets.filter((b) => b.statut !== "invalide");
  if (billets.length === 0) throw new Error("Aucun billet valide.");
  await envoyerEmailCommande(
    creerEmailSender(),
    {
      commandeId: commande.commandeId,
      nom: commande.nom,
      email: commande.email,
      billets,
    },
    evenement,
    getAppUrl(),
  );
}

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
      await envoyerCommandeParEmail(commande.id);
    } catch (error) {
      console.error("Échec de l'envoi de l'email de commande", error);
      emailError =
        "Billet créé, mais l'email n'a pas pu être envoyé. Réessaie ou transmets-le manuellement.";
    }

    return { commande, billets, emailError };
  });

export const creerSurPlaceAction = adminActionClient
  .inputSchema(surPlaceCommandeSchema.extend(evenementSchema.shape))
  .action(async ({ parsedInput: { evenementId, ...input } }) => {
    if (!(await obtenirEvenement(db, evenementId))) {
      return returnServerError("Cet événement n'existe plus.");
    }
    const { commande, billets } = await creerCommandeSurPlace(
      db,
      evenementId,
      input,
    );
    revalidatePath("/admin/billets");
    revalidatePath("/admin/statistiques");
    return { commande, billets };
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

export const modifierBilletAction = adminActionClient
  .inputSchema(modifierBilletActionSchema)
  .action(async ({ parsedInput: { billetId, ...input } }) => {
    try {
      await modifierBillet(db, billetId, input);
    } catch (error) {
      if (
        error instanceof BilletIntrouvableError ||
        error instanceof BilletInvalideError
      ) {
        return returnServerError(error.message);
      }
      throw error;
    }
    revalidatePath("/admin/billets");
  });

export const renvoyerEmailCommandeAction = adminActionClient
  .inputSchema(commandeIdSchema)
  .action(async ({ parsedInput: commandeId }) => {
    try {
      await envoyerCommandeParEmail(commandeId);
    } catch (error) {
      console.error("Échec du renvoi de l'email de commande", error);
      return returnServerError("L'email n'a pas pu être envoyé.");
    }
  });

/** Admin : ajoute des tickets boisson à un billet existant (nouvel achat, sans nouveau billet). */
export const ajouterBoissonAction = adminActionClient
  .inputSchema(boissonSchema)
  .action(async ({ parsedInput }) => {
    try {
      const commande = await ajouterTicketsBoisson(db, parsedInput);
      revalidatePath("/admin/billets");
      revalidatePath("/admin/statistiques");
      return { commandeId: commande.id };
    } catch (error) {
      if (
        error instanceof BilletIntrouvableError ||
        error instanceof BilletInvalideError
      ) {
        return returnServerError(error.message);
      }
      throw error;
    }
  });

/** Admin : tous les billets d'un événement, pour la recherche par nom. */
export const listerBilletsEvenementAction = adminActionClient
  .inputSchema(evenementSchema)
  .action(({ parsedInput: { evenementId } }) =>
    listerBillets(db, evenementId, { q: "", statut: "tous" }),
  );

/** Admin : billets d'un événement choisi. */
export const listerBilletsAction = adminActionClient
  .inputSchema(filtresSchema.extend(evenementSchema.shape))
  .action(async ({ parsedInput: { evenementId, page, ...filtres } }) => {
    const limit = 20;
    const [billets, total] = await Promise.all([
      listerBillets(db, evenementId, filtres, { page, limit }),
      compterBillets(db, evenementId, filtres),
    ]);
    return {
      billets,
      totalPages: Math.max(1, Math.ceil(total / limit)),
    };
  });

export const obtenirStatsBilletsAction = adminActionClient
  .inputSchema(evenementSchema)
  .action(({ parsedInput: { evenementId } }) =>
    obtenirStatsBillets(db, evenementId),
  );

/** Scanner : billets de l'événement de la session, pour la recherche par nom. */
export const listerBilletsScannerAction = scannerActionClient.action(
  ({ ctx }) => listerBillets(db, ctx.evenementId, { q: "", statut: "tous" }),
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
