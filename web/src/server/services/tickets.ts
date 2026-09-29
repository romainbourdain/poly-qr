import { randomBytes } from "node:crypto";
import { and, asc, desc, eq, ilike, or, sql } from "drizzle-orm";
import type { PostgresJsDatabase } from "drizzle-orm/postgres-js";
import type * as schema from "@/server/db/schema";
import { billets, commandes } from "@/server/db/schema";
import type { StatutFilter } from "@/shared/lib/search-params";
import { formatHeure, nomComplet } from "@/shared/lib/tickets";
import type {
  BilletAdmin,
  BilletListe,
  CommandeAvecBillets,
  ResultatScan,
  StatsEvenement,
} from "@/shared/lib/types";
import type { HelloassoCommandeInput } from "@/shared/validators/helloasso";
import type { PermanenceCommandeInput } from "@/shared/validators/permanence";
import type { SurPlaceCommandeInput } from "@/shared/validators/sur-place";

type Db = PostgresJsDatabase<typeof schema>;

export function genererCodeBillet(): string {
  return randomBytes(5).toString("hex").toUpperCase();
}

/** Convertit une ligne billet (DB) vers le format d'affichage `BilletListe`. */
export function versBilletListe(billet: {
  id: string;
  code: string;
  nom: string;
  prenom: string;
  ticketsBoisson: number;
  statut: BilletListe["statut"];
  scanneA: Date | null;
}): BilletListe {
  return {
    id: billet.id,
    code: billet.code,
    nom: billet.nom,
    prenom: billet.prenom,
    ticketsBoisson: billet.ticketsBoisson,
    statut: billet.statut,
    scanneA: billet.scanneA ? formatHeure(billet.scanneA) : null,
  };
}

/** L'acheteur·se d'une vente en main propre est la personne du premier billet. */
function nomAcheteur(billetsSaisis: { nom: string; prenom: string }[]): string {
  return nomComplet(billetsSaisis[0].prenom, billetsSaisis[0].nom);
}

/**
 * Crée une commande de permanence (bénévole → billets vendus en main propre)
 * et ses billets en une seule transaction.
 */
export async function creerCommandePermanence(
  db: Db,
  evenementId: string,
  input: PermanenceCommandeInput,
) {
  return db.transaction(async (tx) => {
    const [commande] = await tx
      .insert(commandes)
      .values({
        evenementId,
        nom: nomAcheteur(input.billets),
        email: input.email,
        origine: "permanence",
        moyenPaiement: input.moyenPaiement,
      })
      .returning();

    const nouveauxBillets = await tx
      .insert(billets)
      .values(
        input.billets.map((billet) => ({
          commandeId: commande.id,
          code: genererCodeBillet(),
          nom: billet.nom,
          prenom: billet.prenom,
          cotisant: billet.cotisant,
          ticketsBoisson: billet.ticketsBoisson,
        })),
      )
      .returning();

    return { commande, billets: nouveauxBillets };
  });
}

/**
 * Crée une vente sur place : la personne paye et entre tout de suite, donc ses
 * billets naissent « scannés » (l'heure de vente est son heure d'entrée). Ni
 * email ni QR envoyés.
 */
export async function creerCommandeSurPlace(
  db: Db,
  evenementId: string,
  input: SurPlaceCommandeInput,
) {
  return db.transaction(async (tx) => {
    const [commande] = await tx
      .insert(commandes)
      .values({
        evenementId,
        nom: nomAcheteur(input.billets),
        email: null,
        origine: "sur_place",
        moyenPaiement: input.moyenPaiement,
      })
      .returning();

    const maintenant = new Date();
    const nouveauxBillets = await tx
      .insert(billets)
      .values(
        input.billets.map((billet) => ({
          commandeId: commande.id,
          code: genererCodeBillet(),
          nom: billet.nom,
          prenom: billet.prenom,
          cotisant: billet.cotisant,
          ticketsBoisson: billet.ticketsBoisson,
          statut: "scanne" as const,
          scanneA: maintenant,
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
  evenementId: string,
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

  const { commande, billets: nouveauxBillets } = await db.transaction(
    async (tx) => {
      const [commande] = await tx
        .insert(commandes)
        .values({
          evenementId,
          nom: input.nom,
          email: input.email,
          origine: "helloasso",
          moyenPaiement: "hello_asso",
          helloassoPaymentId: input.helloassoPaymentId,
        })
        .returning();

      const nouveauxBillets = await tx
        .insert(billets)
        .values(
          input.billets.map((billet) => ({
            commandeId: commande.id,
            code: genererCodeBillet(),
            nom: billet.nom,
            prenom: billet.prenom,
            cotisant: billet.cotisant,
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
 * Liste à plat les billets nominatifs d'un événement (les plus récents
 * d'abord), filtrés côté serveur par recherche nom / prénom / email et par
 * statut.
 */
export async function listerBillets(
  db: Db,
  evenementId: string,
  filtres: { q: string; statut: StatutFilter },
): Promise<BilletAdmin[]> {
  const conditions = [eq(commandes.evenementId, evenementId)];

  if (filtres.statut !== "tous") {
    conditions.push(eq(billets.statut, filtres.statut));
  }

  const q = filtres.q.trim();
  if (q) {
    const motif = `%${q}%`;
    const recherche = or(
      ilike(billets.nom, motif),
      ilike(billets.prenom, motif),
      ilike(sql`${billets.prenom} || ' ' || ${billets.nom}`, motif),
      ilike(commandes.email, motif),
    );
    if (recherche) conditions.push(recherche);
  }

  const lignes = await db
    .select({
      email: commandes.email,
      origine: commandes.origine,
      moyenPaiement: commandes.moyenPaiement,
      id: billets.id,
      code: billets.code,
      nom: billets.nom,
      prenom: billets.prenom,
      ticketsBoisson: billets.ticketsBoisson,
      statut: billets.statut,
      scanneA: billets.scanneA,
    })
    .from(billets)
    .innerJoin(commandes, eq(billets.commandeId, commandes.id))
    .where(and(...conditions))
    .orderBy(desc(commandes.creeA), asc(billets.creeA), asc(billets.code));

  return lignes.map((ligne) => ({
    ...versBilletListe(ligne),
    email: ligne.email,
    origine: ligne.origine,
    moyenPaiement: ligne.moyenPaiement,
  }));
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
      nomCommande: commandes.nom,
      email: commandes.email,
      origine: commandes.origine,
      moyenPaiement: commandes.moyenPaiement,
      id: billets.id,
      code: billets.code,
      nom: billets.nom,
      prenom: billets.prenom,
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
    nom: lignes[0].nomCommande,
    email: lignes[0].email,
    origine: lignes[0].origine,
    moyenPaiement: lignes[0].moyenPaiement,
    billets: lignes.map(versBilletListe),
  };
}

/**
 * Compteurs du résumé admin pour un événement. Un billet = une personne ;
 * les billets invalidés sont comptés à part, jamais parmi les ventes.
 */
export async function obtenirStatsEvenement(
  db: Db,
  evenementId: string,
): Promise<StatsEvenement> {
  const stats: StatsEvenement = {
    billetsVendus: 0,
    billetsInvalides: 0,
    billetsPermanence: 0,
    billetsSurPlace: 0,
    billetsHelloasso: 0,
    cotisantsHelloasso: 0,
    cotisantsPermanence: 0,
    cotisantsSurPlace: 0,
    entreesScannees: 0,
    ticketsBoisson: 0,
    ticketsBoissonPermanence: 0,
    ticketsBoissonSurPlace: 0,
  };
  const lignes = await db
    .select({
      statut: billets.statut,
      ticketsBoisson: billets.ticketsBoisson,
      cotisant: billets.cotisant,
      origine: commandes.origine,
    })
    .from(billets)
    .innerJoin(commandes, eq(billets.commandeId, commandes.id))
    .where(eq(commandes.evenementId, evenementId));

  for (const ligne of lignes) {
    if (ligne.statut === "invalide") {
      stats.billetsInvalides += 1;
      continue;
    }
    stats.billetsVendus += 1;
    stats.ticketsBoisson += ligne.ticketsBoisson;
    if (ligne.origine === "permanence") {
      stats.billetsPermanence += 1;
      stats.ticketsBoissonPermanence += ligne.ticketsBoisson;
      if (ligne.cotisant) stats.cotisantsPermanence += 1;
    } else if (ligne.origine === "sur_place") {
      stats.billetsSurPlace += 1;
      stats.ticketsBoissonSurPlace += ligne.ticketsBoisson;
      if (ligne.cotisant) stats.cotisantsSurPlace += 1;
    } else {
      stats.billetsHelloasso += 1;
      if (ligne.cotisant) stats.cotisantsHelloasso += 1;
    }
    if (ligne.statut === "scanne") stats.entreesScannees += 1;
  }
  return stats;
}

/** Heures de scan des billets actuellement « scannés » d'un événement. */
export async function listerScansEvenement(
  db: Db,
  evenementId: string,
): Promise<Date[]> {
  const lignes = await db
    .select({ scanneA: billets.scanneA })
    .from(billets)
    .innerJoin(commandes, eq(billets.commandeId, commandes.id))
    .where(
      and(eq(commandes.evenementId, evenementId), eq(billets.statut, "scanne")),
    )
    .orderBy(asc(billets.scanneA));
  return lignes.flatMap((l) => (l.scanneA ? [l.scanneA] : []));
}

/**
 * Statistiques globales d'un événement, indépendantes des filtres
 * de recherche appliqués à la liste.
 */
export async function obtenirStatsBillets(
  db: Db,
  evenementId: string,
): Promise<{ total: number; scannes: number }> {
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
 * sans jamais toucher aux autres billets de sa commande. Un billet d'un autre
 * événement est traité comme inconnu.
 */
export async function scannerBillet(
  db: Db,
  evenementId: string,
  code: string,
): Promise<ResultatScan> {
  const [ligne] = await db
    .select({
      id: billets.id,
      statut: billets.statut,
      ticketsBoisson: billets.ticketsBoisson,
      scanneA: billets.scanneA,
      nom: billets.nom,
      prenom: billets.prenom,
      email: commandes.email,
      origine: commandes.origine,
      moyenPaiement: commandes.moyenPaiement,
    })
    .from(billets)
    .innerJoin(commandes, eq(billets.commandeId, commandes.id))
    .where(and(eq(billets.code, code), eq(commandes.evenementId, evenementId)))
    .limit(1);

  if (!ligne) return { type: "inconnu" };

  const versBillet = (scanneA: Date | null) => ({
    nom: nomComplet(ligne.prenom, ligne.nom),
    email: ligne.email,
    origine: ligne.origine,
    moyenPaiement: ligne.moyenPaiement,
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
