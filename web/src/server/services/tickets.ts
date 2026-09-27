import { randomBytes } from "node:crypto";
import { and, asc, desc, eq, ilike, or } from "drizzle-orm";
import type { PostgresJsDatabase } from "drizzle-orm/postgres-js";
import type * as schema from "@/server/db/schema";
import { billets, commandes, evenements } from "@/server/db/schema";
import type { StatutFilter } from "@/shared/lib/search-params";
import { formatHeure } from "@/shared/lib/tickets";
import type { CommandeAvecBillets } from "@/shared/lib/types";
import type { PermanenceCommandeInput } from "@/shared/validators/permanence";

type Db = PostgresJsDatabase<typeof schema>;

export function genererCodeBillet(): string {
  return randomBytes(5).toString("hex").toUpperCase();
}

async function obtenirEvenementActifId(db: Db): Promise<string | null> {
  const [evenement] = await db
    .select({ id: evenements.id })
    .from(evenements)
    .where(eq(evenements.actif, true))
    .limit(1);

  return evenement?.id ?? null;
}

/**
 * Crée une commande de permanence (bénévole → billets vendus en main propre)
 * et ses billets en une seule transaction.
 */
export async function creerCommandePermanence(
  db: Db,
  input: PermanenceCommandeInput,
) {
  const evenementId = await obtenirEvenementActifId(db);
  if (!evenementId) {
    throw new Error("Aucun événement actif.");
  }

  return db.transaction(async (tx) => {
    const [commande] = await tx
      .insert(commandes)
      .values({
        evenementId,
        nom: input.nom,
        email: input.email,
        origine: "permanence",
      })
      .returning();

    const nouveauxBillets = await tx
      .insert(billets)
      .values(
        input.billets.map((billet) => ({
          commandeId: commande.id,
          code: genererCodeBillet(),
          ticketsBoisson: billet.ticketsBoisson,
        })),
      )
      .returning();

    return { commande, billets: nouveauxBillets };
  });
}

/**
 * Liste les billets de l'événement actif, filtrés côté serveur par
 * recherche nom/email et par statut, groupés par commande.
 */
export async function listerBillets(
  db: Db,
  filtres: { q: string; statut: StatutFilter },
): Promise<CommandeAvecBillets[]> {
  const evenementId = await obtenirEvenementActifId(db);
  if (!evenementId) return [];

  const conditions = [eq(commandes.evenementId, evenementId)];

  if (filtres.statut !== "tous") {
    conditions.push(eq(billets.statut, filtres.statut));
  }

  const q = filtres.q.trim();
  if (q) {
    const motif = `%${q}%`;
    const recherche = or(
      ilike(commandes.nom, motif),
      ilike(commandes.email, motif),
    );
    if (recherche) conditions.push(recherche);
  }

  const lignes = await db
    .select({
      commandeId: commandes.id,
      nom: commandes.nom,
      email: commandes.email,
      origine: commandes.origine,
      commandeCreeA: commandes.creeA,
      billetId: billets.id,
      code: billets.code,
      ticketsBoisson: billets.ticketsBoisson,
      statut: billets.statut,
      scanneA: billets.scanneA,
    })
    .from(billets)
    .innerJoin(commandes, eq(billets.commandeId, commandes.id))
    .where(and(...conditions))
    .orderBy(desc(commandes.creeA), asc(billets.creeA));

  const groupes = new Map<string, CommandeAvecBillets>();

  for (const ligne of lignes) {
    let groupe = groupes.get(ligne.commandeId);
    if (!groupe) {
      groupe = {
        commandeId: ligne.commandeId,
        nom: ligne.nom,
        email: ligne.email,
        origine: ligne.origine,
        billets: [],
      };
      groupes.set(ligne.commandeId, groupe);
    }

    groupe.billets.push({
      id: ligne.billetId,
      code: ligne.code,
      ticketsBoisson: ligne.ticketsBoisson,
      statut: ligne.statut,
      scanneA: ligne.scanneA ? formatHeure(ligne.scanneA) : null,
    });
  }

  return Array.from(groupes.values());
}

/**
 * Statistiques globales de l'événement actif, indépendantes des filtres
 * de recherche appliqués à la liste.
 */
export async function obtenirStatsBillets(
  db: Db,
): Promise<{ total: number; scannes: number }> {
  const evenementId = await obtenirEvenementActifId(db);
  if (!evenementId) return { total: 0, scannes: 0 };

  const lignes = await db
    .select({ statut: billets.statut })
    .from(billets)
    .innerJoin(commandes, eq(billets.commandeId, commandes.id))
    .where(eq(commandes.evenementId, evenementId));

  return {
    total: lignes.length,
    scannes: lignes.filter((l) => l.statut === "scanne").length,
  };
}

export async function invaliderBillet(db: Db, billetId: string): Promise<void> {
  await db
    .update(billets)
    .set({ statut: "invalide" })
    .where(eq(billets.id, billetId));
}

export async function reactiverBillet(db: Db, billetId: string): Promise<void> {
  await db
    .update(billets)
    .set({ statut: "non_scanne", scanneA: null })
    .where(eq(billets.id, billetId));
}
