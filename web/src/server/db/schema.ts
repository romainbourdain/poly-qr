import { relations, sql } from "drizzle-orm";
import {
  boolean,
  check,
  date,
  foreignKey,
  integer,
  pgEnum,
  pgTable,
  text,
  time,
  timestamp,
  unique,
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
  // au total des formulaires de vente et à l'estimation des ventes. Le prix en
  // pré-vente vaut pour HelloAsso et la permanence ; les colonnes sans
  // « cotisant » sont les prix des non cotisants.
  prixBilletCentimes: integer("prix_billet_centimes").notNull().default(0),
  prixBilletCotisantCentimes: integer("prix_billet_cotisant_centimes")
    .notNull()
    .default(0),
  prixBilletSurPlaceCentimes: integer("prix_billet_sur_place_centimes")
    .notNull()
    .default(0),
  prixBilletSurPlaceCotisantCentimes: integer(
    "prix_billet_sur_place_cotisant_centimes",
  )
    .notNull()
    .default(0),
  prixTicketBoissonCentimes: integer("prix_ticket_boisson_centimes")
    .notNull()
    .default(0),
  creeA: timestamp("cree_a", { withTimezone: true }).notNull().defaultNow(),
});

// Une commande est un acte d'achat (un encaissement) : elle porte l'origine, le
// moyen de paiement et la date. Ce qu'elle contient vit dans `billets` (des
// personnes) et `lignes_boisson` (des tickets boisson), l'un, l'autre ou les deux.
export const commandes = pgTable(
  "commandes",
  {
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
  },
  (t) => [unique("commandes_id_evenement_unique").on(t.id, t.evenementId)],
);

// Une personne qui entre, vendue par une commande. Son nombre de tickets boisson
// n'est pas stocké : c'est la somme de ses `lignes_boisson`.
export const billets = pgTable(
  "billets",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    // Dénormalisé pour que la base garantisse le même événement sur toute la
    // chaîne commande → billet → ligne boisson (clés étrangères composites).
    evenementId: uuid("evenement_id").notNull(),
    commandeId: uuid("commande_id").notNull(),
    // Billet nominatif : chaque billet porte le nom de la personne qui entre.
    nom: text("nom").notNull(),
    prenom: text("prenom").notNull(),
    code: text("code").notNull().unique(),
    // Cotisant de l'association : le billet est au tarif cotisant.
    cotisant: boolean("cotisant").notNull().default(false),
    statut: statutBillet("statut").notNull().default("non_scanne"),
    scanneA: timestamp("scanne_a", { withTimezone: true }),
    creeA: timestamp("cree_a", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    unique("billets_id_evenement_unique").on(t.id, t.evenementId),
    foreignKey({
      name: "billets_commande_evenement_fk",
      columns: [t.commandeId, t.evenementId],
      foreignColumns: [commandes.id, commandes.evenementId],
    }),
  ],
);

// Tickets boisson achetés : `commande_id` est l'achat (origine, moyen de
// paiement, date), `billet_id` la personne qui les reçoit. Un ajout au bar est
// donc une nouvelle commande sans billet.
export const lignesBoisson = pgTable(
  "lignes_boisson",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    evenementId: uuid("evenement_id").notNull(),
    commandeId: uuid("commande_id").notNull(),
    billetId: uuid("billet_id").notNull(),
    quantite: integer("quantite").notNull(),
  },
  (t) => [
    check("lignes_boisson_quantite_positive", sql`${t.quantite} > 0`),
    foreignKey({
      name: "lignes_boisson_commande_evenement_fk",
      columns: [t.commandeId, t.evenementId],
      foreignColumns: [commandes.id, commandes.evenementId],
    }),
    foreignKey({
      name: "lignes_boisson_billet_evenement_fk",
      columns: [t.billetId, t.evenementId],
      foreignColumns: [billets.id, billets.evenementId],
    }),
  ],
);

export const evenementsRelations = relations(evenements, ({ many }) => ({
  commandes: many(commandes),
}));

export const commandesRelations = relations(commandes, ({ one, many }) => ({
  evenement: one(evenements, {
    fields: [commandes.evenementId],
    references: [evenements.id],
  }),
  billets: many(billets),
  lignesBoisson: many(lignesBoisson),
}));

export const billetsRelations = relations(billets, ({ one, many }) => ({
  commande: one(commandes, {
    fields: [billets.commandeId],
    references: [commandes.id],
  }),
  lignesBoisson: many(lignesBoisson),
}));

export const lignesBoissonRelations = relations(lignesBoisson, ({ one }) => ({
  commande: one(commandes, {
    fields: [lignesBoisson.commandeId],
    references: [commandes.id],
  }),
  billet: one(billets, {
    fields: [lignesBoisson.billetId],
    references: [billets.id],
  }),
}));
