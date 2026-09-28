import { parseAsString, parseAsStringLiteral } from "nuqs/server";
import type { Statut } from "./types";

const STATUT_FILTERS = ["tous", "scanne", "non_scanne", "invalide"] as const;

export type StatutFilter = "tous" | Statut;

export const ticketFiltersSearchParams = {
  q: parseAsString.withDefault(""),
  statut: parseAsStringLiteral(STATUT_FILTERS).withDefault("tous"),
};

export const billetSearchParams = {
  commande: parseAsString,
};
