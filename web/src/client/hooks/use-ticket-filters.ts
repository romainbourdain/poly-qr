"use client";

import { useQueryStates } from "nuqs";
import { useEffect, useRef, useState } from "react";
import { ticketFiltersSearchParams } from "@/shared/lib/search-params";

const DEBOUNCE_MS = 300;

export function useTicketFilters() {
  const [{ q, statut }, setFilters] = useQueryStates(
    ticketFiltersSearchParams,
    { history: "replace", shallow: false },
  );

  const [query, setLocalQuery] = useState(q);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined,
  );

  useEffect(() => {
    setLocalQuery(q);
  }, [q]);

  function setQuery(value: string) {
    setLocalQuery(value);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setFilters({ q: value });
    }, DEBOUNCE_MS);
  }

  return {
    query,
    setQuery,
    statut,
    setStatut: (value: typeof statut) => setFilters({ statut: value }),
  };
}
