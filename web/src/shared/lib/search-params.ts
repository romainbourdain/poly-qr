import { parseAsString, parseAsStringLiteral } from "nuqs/server";
import type { Statut } from "./types";

export const STATUT_FILTERS = [
  "tous",
  "scanne",
  "non_scanne",
  "invalide",
] as const;

export type StatutFilter = "tous" | Statut;

export const ticketFiltersSearchParams = {
  q: parseAsString.withDefault(""),
  statut: parseAsStringLiteral(STATUT_FILTERS).withDefault("tous"),
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
