import { relations } from "drizzle-orm";
import {
  date,
  integer,
  pgEnum,
  pgTable,
  text,
  time,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";
import { MOYENS_PAIEMENT } from "@/shared/lib/types";

export const origineCommande = pgEnum("origine_commande", [
  "helloasso",
  "permanence",
  "sur_place",
]);

export const moyenPaiement = pgEnum("moyen_paiement", MOYENS_PAIEMENT);

export const statutBillet = pgEnum("statut_billet", [
  "non_scanne",
  "scanne",
  "invalide",
]);

export const evenements = pgTable("evenements", {
  id: uuid("id").primaryKey().defaultRandom(),
  nom: text("nom").notNull(),
  date: date("date").notNull(),
  heure: time("heure").notNull(),
  lieu: text("lieu").notNull(),
  motDePasseHash: text("mot_de_passe_hash").notNull(),
  // Prix en centimes, jamais stockés sur une commande ou un billet : ils servent
  // au total des formulaires de vente et à l'estimation des ventes. Le prix du
  // billet en pré-vente vaut pour HelloAsso et la permanence.
  prixBilletCentimes: integer("prix_billet_centimes").notNull().default(0),
  prixBilletSurPlaceCentimes: integer("prix_billet_sur_place_centimes")
    .notNull()
    .default(0),
  prixTicketBoissonCentimes: integer("prix_ticket_boisson_centimes")
    .notNull()
    .default(0),
  creeA: timestamp("cree_a", { withTimezone: true }).notNull().defaultNow(),
});

export const commandes = pgTable("commandes", {
  id: uuid("id").primaryKey().defaultRandom(),
  evenementId: uuid("evenement_id")
    .notNull()
    .references(() => evenements.id),
  nom: text("nom").notNull(),
  // Absent pour une vente sur place : aucun QR n'est envoyé.
  email: text("email"),
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
  // Billet nominatif : chaque billet porte le nom de la personne qui entre.
  nom: text("nom").notNull(),
  prenom: text("prenom").notNull(),
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
