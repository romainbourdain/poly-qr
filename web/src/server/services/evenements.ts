import { desc, eq, sql } from "drizzle-orm";
import type { PostgresJsDatabase } from "drizzle-orm/postgres-js";
import type * as schema from "@/server/db/schema";
import { billets, commandes, evenements } from "@/server/db/schema";
import { hashPassword } from "@/server/services/auth";
import { resoudreEvenementId } from "@/shared/lib/evenements";
import { formatDateLongue, formatHeureEvenement } from "@/shared/lib/prix";
import type { Evenement, EvenementResume } from "@/shared/lib/types";

type Db = PostgresJsDatabase<typeof schema>;

export class EvenementIntrouvableError extends Error {
  constructor() {
    super("Événement introuvable.");
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
  prixBilletCotisantCentimes: number;
  prixBilletSurPlaceCentimes: number;
  prixBilletSurPlaceCotisantCentimes: number;
  prixTicketBoissonCentimes: number;
  /** Vide à la modification = mot de passe inchangé. */
  motDePasse: string;
}

type LigneEvenement = typeof evenements.$inferSelect;

function versEvenement(ligne: LigneEvenement): Evenement {
  return {
    id: ligne.id,
    nom: ligne.nom,
    dateIso: ligne.date,
    heureIso: ligne.heure.slice(0, 5),
    date: formatDateLongue(ligne.date),
    heure: formatHeureEvenement(ligne.heure),
    lieu: ligne.lieu,
    prixBilletCentimes: ligne.prixBilletCentimes,
    prixBilletCotisantCentimes: ligne.prixBilletCotisantCentimes,
    prixBilletSurPlaceCentimes: ligne.prixBilletSurPlaceCentimes,
    prixBilletSurPlaceCotisantCentimes:
      ligne.prixBilletSurPlaceCotisantCentimes,
    prixTicketBoissonCentimes: ligne.prixTicketBoissonCentimes,
  };
}

/** Un événement pour l'affichage (jamais le hash du mot de passe), `null` s'il n'existe pas. */
export async function obtenirEvenement(
  db: Db,
  evenementId: string,
): Promise<Evenement | null> {
  const [ligne] = await db
    .select()
    .from(evenements)
    .where(eq(evenements.id, evenementId))
    .limit(1);
  return ligne ? versEvenement(ligne) : null;
}

/** Événement auquel appartient une commande. */
export async function obtenirEvenementDeCommande(
  db: Db,
  commandeId: string,
): Promise<Evenement | null> {
  const [ligne] = await db
    .select({ evenement: evenements })
    .from(commandes)
    .innerJoin(evenements, eq(commandes.evenementId, evenements.id))
    .where(eq(commandes.id, commandeId))
    .limit(1);
  return ligne ? versEvenement(ligne.evenement) : null;
}

/** Tous les événements (récents d'abord) avec leurs volumes. */
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
    ...versEvenement(evenement),
    nbCommandes,
    nbBillets,
  }));
}

/** Événement affiché dans l'admin : celui demandé dans l'URL, sinon le plus récent. */
export async function resoudreEvenementAdmin(
  db: Db,
  demande: string | null,
): Promise<EvenementResume | null> {
  const tous = await listerEvenements(db);
  const id = resoudreEvenementId(tous, demande);
  return tous.find((e) => e.id === id) ?? null;
}

/** Crée un événement (sans toucher aux autres). */
export async function creerEvenement(
  db: Db,
  donnees: EvenementDonnees,
): Promise<Evenement> {
  const motDePasseHash = await hashPassword(donnees.motDePasse);

  const [ligne] = await db
    .insert(evenements)
    .values({
      nom: donnees.nom,
      date: donnees.date,
      heure: donnees.heure,
      lieu: donnees.lieu,
      prixBilletCentimes: donnees.prixBilletCentimes,
      prixBilletCotisantCentimes: donnees.prixBilletCotisantCentimes,
      prixBilletSurPlaceCentimes: donnees.prixBilletSurPlaceCentimes,
      prixBilletSurPlaceCotisantCentimes:
        donnees.prixBilletSurPlaceCotisantCentimes,
      prixTicketBoissonCentimes: donnees.prixTicketBoissonCentimes,
      motDePasseHash,
    })
    .returning();

  return versEvenement(ligne);
}

/** Modifie un événement ; un mot de passe vide conserve l'actuel. */
export async function modifierEvenement(
  db: Db,
  evenementId: string,
  donnees: EvenementDonnees,
): Promise<Evenement> {
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
      prixBilletCotisantCentimes: donnees.prixBilletCotisantCentimes,
      prixBilletSurPlaceCentimes: donnees.prixBilletSurPlaceCentimes,
      prixBilletSurPlaceCotisantCentimes:
        donnees.prixBilletSurPlaceCotisantCentimes,
      prixTicketBoissonCentimes: donnees.prixTicketBoissonCentimes,
      ...(motDePasseHash ? { motDePasseHash } : {}),
    })
    .where(eq(evenements.id, evenementId))
    .returning();

  if (!ligne) throw new EvenementIntrouvableError();
  return versEvenement(ligne);
}
