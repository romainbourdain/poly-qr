"use client";

import { useSearchParams } from "next/navigation";
import { resoudreEvenementId } from "@/shared/lib/evenements";

/** Événement sélectionné dans l'URL, et de quoi construire des liens qui le conservent. */
export function useEvenementSelectionne(evenements: { id: string }[]) {
  const searchParams = useSearchParams();
  const evenementId = resoudreEvenementId(
    evenements,
    searchParams.get("evenement"),
  );

  function avecEvenement(href: string) {
    return evenementId ? `${href}?evenement=${evenementId}` : href;
  }

  return { evenementId, avecEvenement };
}
