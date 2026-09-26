"use client";

import { useQueryStates } from "nuqs";
import { ticketFiltersSearchParams } from "@/shared/lib/search-params";

export function useTicketFilters() {
  const [{ q, statut }, setFilters] = useQueryStates(
    ticketFiltersSearchParams,
    { history: "replace" },
  );

  return {
    query: q,
    setQuery: (value: string) => setFilters({ q: value }),
    statut,
    setStatut: (value: typeof statut) => setFilters({ statut: value }),
  };
}
