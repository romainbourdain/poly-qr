import { eq, sql } from "drizzle-orm";
import type { PostgresJsDatabase } from "drizzle-orm/postgres-js";
import type * as schema from "@/server/db/schema";
import { billets, commandes, lignesBoisson } from "@/server/db/schema";
import { obtenirEvenement } from "@/server/services/evenements";
import { type CelluleCsv, versCsv } from "@/shared/lib/csv";
import { montantCentimes, type PrixEvenement } from "@/shared/lib/prix";
import { MOYEN_PAIEMENT_LABEL, ORIGINE_LABEL } from "@/shared/lib/tickets";
import type { Evenement } from "@/shared/lib/types";

type Db = PostgresJsDatabase<typeof schema>;

const EN_TETE = [
  "Date",
  "Heure",
  "Canal",
  "Moyen de paiement",
  "Acheteur",
  "Email",
  "Billets",
  "Dont cotisants",
  "Tickets boisson",
  "Billets invalidés",
  "Montant (€)",
];

const formatteurDate = new Intl.DateTimeFormat("fr-FR", {
  timeZone: "Europe/Paris",
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
});
const formatteurHeure = new Intl.DateTimeFormat("fr-FR", {
  timeZone: "Europe/Paris",
  hour: "2-digit",
  minute: "2-digit",
  hourCycle: "h23",
});

function prixDeLOrigine(
  evenement: Evenement,
  origine: "helloasso" | "permanence" | "sur_place",
): PrixEvenement {
  return origine === "sur_place"
    ? {
        billet: evenement.prixBilletSurPlaceCentimes,
        billetCotisant: evenement.prixBilletSurPlaceCotisantCentimes,
        ticketBoisson: evenement.prixTicketBoissonCentimes,
      }
    : {
        billet: evenement.prixBilletCentimes,
        billetCotisant: evenement.prixBilletCotisantCentimes,
        ticketBoisson: evenement.prixTicketBoissonCentimes,
      };
}

/** « Soirée d'hiver » + 2030-03-14 → `soiree-d-hiver-2030-03-14.csv`. */
export function nomFichierExport(evenement: {
  nom: string;
  dateIso: string;
}): string {
  const slug = evenement.nom
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  return `${slug || "evenement"}-${evenement.dateIso}.csv`;
}

/**
 * Justificatif des paiements d'un événement : une ligne par commande (billets
 * vendus et/ou tickets boisson achetés), au prix de l'événement. Les billets
 * invalidés (et leurs tickets) sont comptés à part et exclus du montant : ils
 * ont été remboursés.
 */
export async function exporterCommandesCsv(
  db: Db,
  evenementId: string,
): Promise<{ nomFichier: string; csv: string } | null> {
  const evenement = await obtenirEvenement(db, evenementId);
  if (!evenement) return null;

  const [lignesCommandes, lignesBillets, lignesTickets] = await Promise.all([
    db
      .select()
      .from(commandes)
      .where(eq(commandes.evenementId, evenementId))
      .orderBy(commandes.creeA),
    db
      .select({
        commandeId: billets.commandeId,
        valides: sql<number>`count(*) filter (where ${billets.statut} <> 'invalide')::int`,
        cotisants: sql<number>`count(*) filter (where ${billets.statut} <> 'invalide' and ${billets.cotisant})::int`,
        invalides: sql<number>`count(*) filter (where ${billets.statut} = 'invalide')::int`,
      })
      .from(billets)
      .where(eq(billets.evenementId, evenementId))
      .groupBy(billets.commandeId),
    db
      .select({
        commandeId: lignesBoisson.commandeId,
        quantite: sql<number>`coalesce(sum(${lignesBoisson.quantite}), 0)::int`,
      })
      .from(lignesBoisson)
      .innerJoin(billets, eq(lignesBoisson.billetId, billets.id))
      .where(
        sql`${lignesBoisson.evenementId} = ${evenementId} and ${billets.statut} <> 'invalide'`,
      )
      .groupBy(lignesBoisson.commandeId),
  ]);

  const parCommandeBillets = new Map(
    lignesBillets.map((l) => [l.commandeId, l]),
  );
  const parCommandeTickets = new Map(
    lignesTickets.map((l) => [l.commandeId, l.quantite]),
  );

  const lignes: CelluleCsv[][] = [EN_TETE];
  for (const commande of lignesCommandes) {
    const b = parCommandeBillets.get(commande.id);
    const billetsValides = b?.valides ?? 0;
    const cotisants = b?.cotisants ?? 0;
    const tickets = parCommandeTickets.get(commande.id) ?? 0;
    const montant = montantCentimes(
      prixDeLOrigine(evenement, commande.origine),
      {
        billets: billetsValides,
        cotisants,
        ticketsBoisson: tickets,
      },
    );
    lignes.push([
      formatteurDate.format(commande.creeA),
      formatteurHeure.format(commande.creeA),
      ORIGINE_LABEL[commande.origine],
      MOYEN_PAIEMENT_LABEL[commande.moyenPaiement],
      commande.nom,
      commande.email ?? "",
      billetsValides,
      cotisants,
      tickets,
      b?.invalides ?? 0,
      montant / 100,
    ]);
  }

  return { nomFichier: nomFichierExport(evenement), csv: versCsv(lignes) };
}
