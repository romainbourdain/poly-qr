"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState, useTransition } from "react";
import { BilletSearch } from "@/client/components/scanner/billet-search";
import { CameraScanner } from "@/client/components/scanner/camera-scanner";
import { ScannerHeader } from "@/client/components/scanner/scanner-header";
import { useScanResultStore } from "@/client/store/scan-result-store";
import { scannerBilletAction } from "@/server/actions/tickets";
import {
  GENERIC_SERVER_ERROR,
  UNAUTHORIZED_ERROR,
} from "@/shared/lib/form-errors";
import type { BilletRecherchable, ResultatScan } from "@/shared/lib/types";

/** Voile plein écran pendant la validation d'un billet : un scan ne reste jamais sans retour visuel. */
function ValidationEnCours() {
  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-5 bg-[#08080C]/95 px-6 text-center backdrop-blur-sm"
    >
      <div
        aria-hidden="true"
        className="size-14 animate-spin rounded-full border-4 border-line-2 border-t-accent-2"
      />
      <div className="flex flex-col gap-1">
        <div className="font-display font-extrabold text-[22px] tracking-tight">
          Validation du billet…
        </div>
        <div className="text-[14px] text-muted">
          Un instant, ne ferme pas la page.
        </div>
      </div>
    </div>
  );
}

export function ScannerClient({
  evenementId,
  evenementNom,
  billets,
}: {
  evenementId: string;
  evenementNom: string;
  billets: BilletRecherchable[];
}) {
  const router = useRouter();
  const setResultat = useScanResultStore((state) => state.setResultat);
  const [erreur, setErreur] = useState<string | null>(null);
  // Un billet est en cours de validation, ou la page de résultat est en cours
  // d'ouverture : l'écran le dit au lieu de laisser la caméra figée.
  const [validation, setValidation] = useState(false);
  const [navigationEnCours, demarrerNavigation] = useTransition();
  // Remonter la caméra (nouvelle clé) la relance après une erreur.
  const [cleCamera, setCleCamera] = useState(0);

  // Charge à l'avance l'écran de résultat pour qu'il s'ouvre sans attente.
  useEffect(() => {
    router.prefetch(`/scanner/${evenementId}/resultat`);
  }, [router, evenementId]);

  const afficherResultat = useCallback(
    (resultat: ResultatScan) => {
      setResultat(resultat);
      demarrerNavigation(() => {
        router.push(`/scanner/${evenementId}/resultat`);
      });
    },
    [router, setResultat, evenementId],
  );

  // Un QR scanné ou un billet choisi par nom passent par le même chemin : le
  // billet est validé côté serveur, puis on affiche le résultat.
  const traiterScan = useCallback(
    async (code: string | null) => {
      setErreur(null);
      setValidation(true);
      if (!code) {
        afficherResultat({ type: "inconnu" });
        return;
      }
      const scan = await scannerBilletAction(code);
      if (!scan?.data) {
        // Rien n'a été consommé : on ne le présente pas comme un billet inconnu.
        if (scan?.serverError === UNAUTHORIZED_ERROR) {
          router.push(`/scanner/${evenementId}/login`);
          return;
        }
        setErreur(scan?.serverError ?? GENERIC_SERVER_ERROR);
        setValidation(false);
        setCleCamera((cle) => cle + 1);
        return;
      }
      afficherResultat(scan.data);
    },
    [router, afficherResultat, evenementId],
  );

  const handleDecode = useCallback(
    (text: string) => {
      traiterScan(text.startsWith("polyqr:") ? text.slice(7) : null);
    },
    [traiterScan],
  );

  return (
    <main className="min-h-dvh w-full bg-[#08080C]">
      <div className="mx-auto flex min-h-dvh w-full max-w-md flex-col px-6">
        <ScannerHeader evenementNom={evenementNom} />

        <div className="flex flex-1 flex-col items-center justify-center gap-6 py-6">
          <CameraScanner key={cleCamera} onDecode={handleDecode} />
          {erreur && (
            <div role="alert" className="font-semibold text-[14px] text-bad">
              {erreur}
            </div>
          )}
        </div>

        <BilletSearch billets={billets} onSelect={traiterScan} />
      </div>

      {(validation || navigationEnCours) && <ValidationEnCours />}
    </main>
  );
}
