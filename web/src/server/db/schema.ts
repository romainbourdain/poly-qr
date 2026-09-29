import { relations, sql } from "drizzle-orm";
import {
  boolean,
  date,
  integer,
  pgEnum,
  pgTable,
  text,
  time,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

export const origineCommande = pgEnum("origine_commande", [
  "helloasso",
  "permanence",
]);

export const moyenPaiement = pgEnum("moyen_paiement", [
  "virement",
  "hello_asso",
  "lydia",
  "especes",
  "sumup",
  "autre",
]);

export const statutBillet = pgEnum("statut_billet", [
  "non_scanne",
  "scanne",
  "invalide",
]);

export const evenements = pgTable(
  "evenements",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    nom: text("nom").notNull(),
    date: date("date").notNull(),
    heure: time("heure").notNull(),
    lieu: text("lieu").notNull(),
    motDePasseHash: text("mot_de_passe_hash").notNull(),
    // Prix en centimes, utilisés uniquement pour afficher le total du formulaire
    // de vente permanence — jamais stockés sur une commande ou un billet.
    prixBilletCentimes: integer("prix_billet_centimes").notNull().default(0),
    prixTicketBoissonCentimes: integer("prix_ticket_boisson_centimes")
      .notNull()
      .default(0),
    actif: boolean("actif").notNull().default(false),
    creeA: timestamp("cree_a", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    // Un seul événement actif à la fois : index unique partiel sur les lignes actif = true.
    uniqueIndex("evenements_un_seul_actif")
      .on(table.actif)
      .where(sql`${table.actif} = true`),
  ],
);

export const commandes = pgTable("commandes", {
  id: uuid("id").primaryKey().defaultRandom(),
  evenementId: uuid("evenement_id")
    .notNull()
    .references(() => evenements.id),
  nom: text("nom").notNull(),
  email: text("email").notNull(),
  origine: origineCommande("origine").notNull(),
  // Simple marqueur pour la trésorerie : jamais de montant, jamais modifiable.
  moyenPaiement: moyenPaiement("moyen_paiement").notNull(),
  helloassoPaymentId: text("helloasso_payment_id").unique(),
  creeA: timestamp("cree_a", { withTimezone: true }).notNull().defaultNow(),
});

export const billets = pgTable("billets", {
  id: uuid("id").primaryKey().defaultRandom(),
  commandeId: uuid("commande_id")
    .notNull()
    .references(() => commandes.id),
  code: text("code").notNull().unique(),
  ticketsBoisson: integer("tickets_boisson").notNull().default(0),
  statut: statutBillet("statut").notNull().default("non_scanne"),
  scanneA: timestamp("scanne_a", { withTimezone: true }),
  creeA: timestamp("cree_a", { withTimezone: true }).notNull().defaultNow(),
});

export const evenementsRelations = relations(evenements, ({ many }) => ({
  commandes: many(commandes),
}));

export const commandesRelations = relations(commandes, ({ one, many }) => ({
  evenement: one(evenements, {
    fields: [commandes.evenementId],
    references: [evenements.id],
  }),
  billets: many(billets),
}));

export const billetsRelations = relations(billets, ({ one }) => ({
  commande: one(commandes, {
    fields: [billets.commandeId],
    references: [commandes.id],
  }),
}));
