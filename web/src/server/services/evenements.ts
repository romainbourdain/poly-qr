import { desc, eq, sql } from "drizzle-orm";
import type { PostgresJsDatabase } from "drizzle-orm/postgres-js";
import type * as schema from "@/server/db/schema";
import { billets, commandes, evenements } from "@/server/db/schema";
import { hashPassword } from "@/server/services/auth";
import { formatDateLongue, formatHeureEvenement } from "@/shared/lib/prix";
import type { EvenementActif, EvenementResume } from "@/shared/lib/types";

type Db = PostgresJsDatabase<typeof schema>;

export class AucunEvenementActifError extends Error {
  constructor() {
    super("Aucun événement actif.");
  }
}

export interface EvenementDonnees {
  nom: string;
  /** `YYYY-MM-DD` */
  date: string;
  /** `HH:MM` */
  heure: string;
  lieu: string;
  prixBilletCentimes: number;
  prixTicketBoissonCentimes: number;
  /** Vide à la modification = mot de passe inchangé. */
  motDePasse: string;
}

type LigneEvenement = typeof evenements.$inferSelect;

function versEvenementActif(ligne: LigneEvenement): EvenementActif {
  return {
    id: ligne.id,
    nom: ligne.nom,
    dateIso: ligne.date,
    heureIso: ligne.heure.slice(0, 5),
    date: formatDateLongue(ligne.date),
    heure: formatHeureEvenement(ligne.heure),
    lieu: ligne.lieu,
    prixBilletCentimes: ligne.prixBilletCentimes,
    prixTicketBoissonCentimes: ligne.prixTicketBoissonCentimes,
  };
}

/** Événement actif pour l'affichage (jamais le hash du mot de passe). */
export async function obtenirEvenementActif(
  db: Db,
): Promise<EvenementActif | null> {
  const [ligne] = await db
    .select()
    .from(evenements)
    .where(eq(evenements.actif, true))
    .limit(1);
  return ligne ? versEvenementActif(ligne) : null;
}

/** Événement auquel appartient une commande, actif ou non (billet d'un ancien événement). */
export async function obtenirEvenementDeCommande(
  db: Db,
  commandeId: string,
): Promise<EvenementActif | null> {
  const [ligne] = await db
    .select({ evenement: evenements })
    .from(commandes)
    .innerJoin(evenements, eq(commandes.evenementId, evenements.id))
    .where(eq(commandes.id, commandeId))
    .limit(1);
  return ligne ? versEvenementActif(ligne.evenement) : null;
}

/** Tous les événements (récents d'abord) avec leurs volumes, actif compris. */
export async function listerEvenements(db: Db): Promise<EvenementResume[]> {
  const lignes = await db
    .select({
      evenement: evenements,
      nbCommandes: sql<number>`count(distinct ${commandes.id})::int`,
      nbBillets: sql<number>`count(${billets.id})::int`,
    })
    .from(evenements)
    .leftJoin(commandes, eq(commandes.evenementId, evenements.id))
    .leftJoin(billets, eq(billets.commandeId, commandes.id))
    .groupBy(evenements.id)
    .orderBy(desc(evenements.date), desc(evenements.creeA));

  return lignes.map(({ evenement, nbCommandes, nbBillets }) => ({
    ...versEvenementActif(evenement),
    actif: evenement.actif,
    nbCommandes,
    nbBillets,
  }));
}

/** Crée un événement actif et désactive le précédent (sans le supprimer). */
export async function creerEvenement(
  db: Db,
  donnees: EvenementDonnees,
): Promise<EvenementActif> {
  const motDePasseHash = await hashPassword(donnees.motDePasse);

  return db.transaction(async (tx) => {
    await tx
      .update(evenements)
      .set({ actif: false })
      .where(eq(evenements.actif, true));

    const [ligne] = await tx
      .insert(evenements)
      .values({
        nom: donnees.nom,
        date: donnees.date,
        heure: donnees.heure,
        lieu: donnees.lieu,
        prixBilletCentimes: donnees.prixBilletCentimes,
        prixTicketBoissonCentimes: donnees.prixTicketBoissonCentimes,
        motDePasseHash,
        actif: true,
      })
      .returning();

    return versEvenementActif(ligne);
  });
}

/** Modifie l'événement actif ; un mot de passe vide conserve l'actuel. */
export async function modifierEvenementActif(
  db: Db,
  donnees: EvenementDonnees,
): Promise<EvenementActif> {
  const motDePasseHash = donnees.motDePasse
    ? await hashPassword(donnees.motDePasse)
    : undefined;

  const [ligne] = await db
    .update(evenements)
    .set({
      nom: donnees.nom,
      date: donnees.date,
      heure: donnees.heure,
      lieu: donnees.lieu,
      prixBilletCentimes: donnees.prixBilletCentimes,
      prixTicketBoissonCentimes: donnees.prixTicketBoissonCentimes,
      ...(motDePasseHash ? { motDePasseHash } : {}),
    })
    .where(eq(evenements.actif, true))
    .returning();

  if (!ligne) throw new AucunEvenementActifError();
  return versEvenementActif(ligne);
}
