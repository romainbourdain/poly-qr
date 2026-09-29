"use client";

import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import { CameraScanner } from "@/client/components/scanner/camera-scanner";
import { ScanSimulator } from "@/client/components/scanner/scan-simulator";
import { ScannerHeader } from "@/client/components/scanner/scanner-header";
import { useScanResultStore } from "@/client/store/scan-result-store";
import {
  obtenirStatsBilletsScannerAction,
  scannerBilletAction,
} from "@/server/actions/tickets";
import {
  GENERIC_SERVER_ERROR,
  UNAUTHORIZED_ERROR,
} from "@/shared/lib/form-errors";
import type { BilletSimulable } from "@/shared/lib/types";

export function ScannerClient({
  evenementId,
  evenementNom,
  entreesInitial,
  billets,
}: {
  evenementId: string;
  evenementNom: string;
  entreesInitial: number;
  billets: BilletSimulable[];
}) {
  const router = useRouter();
  const setResultat = useScanResultStore((state) => state.setResultat);
  const [entrees, setEntrees] = useState(entreesInitial);
  const [erreur, setErreur] = useState<string | null>(null);

  const traiterScan = useCallback(
    async (code: string | null) => {
      if (!code) {
        setResultat({ type: "inconnu" });
        router.push(`/scanner/${evenementId}/resultat`);
        return;
      }
      setErreur(null);
      const scan = await scannerBilletAction(code);
      if (!scan?.data) {
        // Rien n'a été consommé : on ne le présente pas comme un billet inconnu.
        if (scan?.serverError === UNAUTHORIZED_ERROR) {
          router.push(`/scanner/${evenementId}/login`);
        } else {
          setErreur(scan?.serverError ?? GENERIC_SERVER_ERROR);
        }
        return;
      }
      const resultat = scan.data;
      if (resultat.type === "valide") {
        const stats = await obtenirStatsBilletsScannerAction();
        if (stats?.data) setEntrees(stats.data.scannes);
      }
      setResultat(resultat);
      router.push(`/scanner/${evenementId}/resultat`);
    },
    [router, setResultat, evenementId],
  );

  const handleDecode = useCallback(
    (text: string) => {
      traiterScan(text.startsWith("polyqr:") ? text.slice(7) : null);
    },
    [traiterScan],
  );

  return (
    <main className="mx-auto flex min-h-dvh max-w-sm flex-col bg-[#08080C] px-5">
      <ScannerHeader evenementNom={evenementNom} entrees={entrees} />

      <div className="flex flex-1 flex-col items-center justify-center gap-6 py-6">
        <CameraScanner onDecode={handleDecode} />
        {erreur && (
          <div role="alert" className="font-semibold text-[14px] text-bad">
            {erreur}
          </div>
        )}
      </div>

      <ScanSimulator
        billets={billets}
        onSimulate={traiterScan}
        onSimulateUnknown={() => traiterScan(null)}
      />
    </main>
  );
}
