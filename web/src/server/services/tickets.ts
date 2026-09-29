import { randomBytes } from "node:crypto";
import { and, asc, desc, eq, ilike, or } from "drizzle-orm";
import type { PostgresJsDatabase } from "drizzle-orm/postgres-js";
import type * as schema from "@/server/db/schema";
import { billets, commandes, evenements } from "@/server/db/schema";
import type { StatutFilter } from "@/shared/lib/search-params";
import { formatHeure } from "@/shared/lib/tickets";
import type {
  BilletListe,
  CommandeAvecBillets,
  ResultatScan,
} from "@/shared/lib/types";
import type { HelloassoCommandeInput } from "@/shared/validators/helloasso";
import type { PermanenceCommandeInput } from "@/shared/validators/permanence";

type Db = PostgresJsDatabase<typeof schema>;

export function genererCodeBillet(): string {
  return randomBytes(5).toString("hex").toUpperCase();
}

/** Convertit une ligne billet (DB) vers le format d'affichage `BilletListe`. */
export function versBilletListe(billet: {
  id: string;
  code: string;
  ticketsBoisson: number;
  statut: BilletListe["statut"];
  scanneA: Date | null;
}): BilletListe {
  return {
    id: billet.id,
    code: billet.code,
    ticketsBoisson: billet.ticketsBoisson,
    statut: billet.statut,
    scanneA: billet.scanneA ? formatHeure(billet.scanneA) : null,
  };
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
 * Vérifie si un paiement HelloAsso a déjà été traité, avant tout appel à
 * l'API HelloAsso (résolution des options par item) — évite ces appels
 * réseau superflus quand le webhook est rejoué pour un paiement déjà connu.
 */
export async function commandeHelloassoExiste(
  db: Db,
  helloassoPaymentId: string,
): Promise<boolean> {
  const [existante] = await db
    .select({ id: commandes.id })
    .from(commandes)
    .where(eq(commandes.helloassoPaymentId, helloassoPaymentId))
    .limit(1);
  return existante !== undefined;
}

/**
 * Crée une commande à partir d'un paiement HelloAsso déjà normalisé.
 * Idempotent sur `helloassoPaymentId` : un paiement déjà traité renvoie la
 * commande existante sans créer de nouveaux billets (webhook rejoué).
 */
export async function creerCommandeDepuisHelloAsso(
  db: Db,
  input: HelloassoCommandeInput,
) {
  const [existante] = await db
    .select()
    .from(commandes)
    .where(eq(commandes.helloassoPaymentId, input.helloassoPaymentId))
    .limit(1);

  if (existante) {
    const billetsExistants = await db
      .select()
      .from(billets)
      .where(eq(billets.commandeId, existante.id));
    return {
      commande: existante,
      billets: billetsExistants,
      dejaTraitee: true as const,
    };
  }

  const evenementId = await obtenirEvenementActifId(db);
  if (!evenementId) {
    throw new Error("Aucun événement actif.");
  }

  const { commande, billets: nouveauxBillets } = await db.transaction(
    async (tx) => {
      const [commande] = await tx
        .insert(commandes)
        .values({
          evenementId,
          nom: input.nom,
          email: input.email,
          origine: "helloasso",
          helloassoPaymentId: input.helloassoPaymentId,
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
    },
  );

  return { commande, billets: nouveauxBillets, dejaTraitee: false as const };
}

/**
 * Liste les billets de l'événement actif, filtrés côté serveur par
 * recherche nom/email et par statut, groupés par commande.
 */
export async function listerBillets(
  db: Db,
  filtres: { q: string; statut: StatutFilter },
  /** Par défaut l'événement actif ; passer un id pour consulter un événement passé. */
  evenementIdCible?: string,
): Promise<CommandeAvecBillets[]> {
  const evenementId = evenementIdCible ?? (await obtenirEvenementActifId(db));
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
      id: billets.id,
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

    groupe.billets.push(versBilletListe(ligne));
  }

  return Array.from(groupes.values());
}

/**
 * Récupère une commande et ses billets pour la page participant, quel que
 * soit son événement — un participant doit pouvoir revoir son billet même
 * après la fin de l'événement.
 */
export async function obtenirCommandeAvecBillets(
  db: Db,
  commandeId: string,
): Promise<CommandeAvecBillets | null> {
  const lignes = await db
    .select({
      commandeId: commandes.id,
      nom: commandes.nom,
      email: commandes.email,
      origine: commandes.origine,
      id: billets.id,
      code: billets.code,
      ticketsBoisson: billets.ticketsBoisson,
      statut: billets.statut,
      scanneA: billets.scanneA,
    })
    .from(billets)
    .innerJoin(commandes, eq(billets.commandeId, commandes.id))
    .where(eq(commandes.id, commandeId))
    .orderBy(asc(billets.creeA));

  if (lignes.length === 0) return null;

  return {
    commandeId: lignes[0].commandeId,
    nom: lignes[0].nom,
    email: lignes[0].email,
    origine: lignes[0].origine,
    billets: lignes.map(versBilletListe),
  };
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

/**
 * Scanne un billet à l'entrée : le marque scanné s'il est encore valide,
 * sans jamais toucher aux autres billets de sa commande.
 */
export async function scannerBillet(
  db: Db,
  code: string,
): Promise<ResultatScan> {
  const [ligne] = await db
    .select({
      id: billets.id,
      statut: billets.statut,
      ticketsBoisson: billets.ticketsBoisson,
      scanneA: billets.scanneA,
      nom: commandes.nom,
      email: commandes.email,
      origine: commandes.origine,
    })
    .from(billets)
    .innerJoin(commandes, eq(billets.commandeId, commandes.id))
    .where(eq(billets.code, code))
    .limit(1);

  if (!ligne) return { type: "inconnu" };

  const versBillet = (scanneA: Date | null) => ({
    nom: ligne.nom,
    email: ligne.email,
    origine: ligne.origine,
    ticketsBoisson: ligne.ticketsBoisson,
    scanneA: scanneA ? formatHeure(scanneA) : null,
  });

  if (ligne.statut === "invalide") {
    return { type: "invalide", billet: versBillet(ligne.scanneA) };
  }

  if (ligne.statut === "scanne") {
    return { type: "deja_scanne", billet: versBillet(ligne.scanneA) };
  }

  const maintenant = new Date();
  const [misAJour] = await db
    .update(billets)
    .set({ statut: "scanne", scanneA: maintenant })
    .where(and(eq(billets.id, ligne.id), eq(billets.statut, "non_scanne")))
    .returning({ scanneA: billets.scanneA });

  if (!misAJour) {
    // Scanné entre-temps par un autre poste : on relit l'état réel pour
    // retomber sur "déjà scanné" avec la vraie heure du premier scan.
    const [actuel] = await db
      .select({ scanneA: billets.scanneA })
      .from(billets)
      .where(eq(billets.id, ligne.id));
    return { type: "deja_scanne", billet: versBillet(actuel?.scanneA ?? null) };
  }

  return { type: "valide", billet: versBillet(misAJour.scanneA) };
}
