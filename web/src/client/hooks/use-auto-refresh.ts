"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

/** Recharge les données de la page toutes les `intervalMs` tant que l'onglet est visible, et au retour dessus. */
export function useAutoRefresh(intervalMs: number) {
  const router = useRouter();

  useEffect(() => {
    const rafraichir = () => {
      if (document.visibilityState === "visible") router.refresh();
    };
    const timer = setInterval(rafraichir, intervalMs);
    document.addEventListener("visibilitychange", rafraichir);
    return () => {
      clearInterval(timer);
      document.removeEventListener("visibilitychange", rafraichir);
    };
  }, [router, intervalMs]);
}
