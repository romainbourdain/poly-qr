import {
  parseAsInteger,
  parseAsString,
  parseAsStringLiteral,
} from "nuqs/server";
import type { Statut } from "./types";

export const STATUT_FILTERS = [
  "tous",
  "scanne",
  "non_scanne",
  "invalide",
] as const;

export type StatutFilter = "tous" | Statut;

export const TICKET_SORTS = [
  "cree_a",
  "nom",
  "prenom",
  "email",
  "origine",
  "cotisant",
  "tickets_boisson",
  "statut",
] as const;
export type TicketSort = (typeof TICKET_SORTS)[number];

export const SORT_ORDERS = ["asc", "desc"] as const;
export type SortOrder = (typeof SORT_ORDERS)[number];

export const ticketFiltersSearchParams = {
  q: parseAsString.withDefault(""),
  statut: parseAsStringLiteral(STATUT_FILTERS).withDefault("tous"),
  tri: parseAsStringLiteral(TICKET_SORTS).withDefault("cree_a"),
  ordre: parseAsStringLiteral(SORT_ORDERS).withDefault("desc"),
  page: parseAsInteger.withDefault(1),
};

export const billetSearchParams = {
  commande: parseAsString,
};

/** Événement affiché dans l'admin (`?evenement=<id>`), absent = le plus récent. */
export const adminSearchParams = {
  evenement: parseAsString,
  /** `?nouveau=1` : l'événement vient d'être créé, on guide vers HelloAsso. */
  nouveau: parseAsString,
};
