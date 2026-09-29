"use client";

import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import { CameraScanner } from "@/client/components/scanner/camera-scanner";
import { ScanSimulator } from "@/client/components/scanner/scan-simulator";
import { ScannerHeader } from "@/client/components/scanner/scanner-header";
import { useScanResultStore } from "@/client/store/scan-result-store";
import {
  obtenirStatsBilletsAction,
  scannerBilletAction,
} from "@/server/actions/tickets";
import type { BilletSimulable } from "@/shared/lib/types";

export function ScannerClient({
  evenementNom,
  entreesInitial,
  billets,
}: {
  evenementNom: string;
  entreesInitial: number;
  billets: BilletSimulable[];
}) {
  const router = useRouter();
  const setResultat = useScanResultStore((state) => state.setResultat);
  const [entrees, setEntrees] = useState(entreesInitial);

  const traiterScan = useCallback(
    async (code: string | null) => {
      if (!code) {
        setResultat({ type: "inconnu" });
        router.push("/scanner/resultat");
        return;
      }
      const resultat = await scannerBilletAction(code);
      if (resultat.type === "valide") {
        const stats = await obtenirStatsBilletsAction();
        setEntrees(stats.scannes);
      }
      setResultat(resultat);
      router.push("/scanner/resultat");
    },
    [router, setResultat],
  );

  const handleDecode = useCallback(
    (text: string) => {
      traiterScan(text.startsWith("polyqr:") ? text.slice(7) : null);
    },
    [traiterScan],
  );

  return (
    <main className="mx-auto flex min-h-screen max-w-sm flex-col bg-[#08080C] px-5">
      <ScannerHeader evenementNom={evenementNom} entrees={entrees} />

      <div className="flex flex-1 flex-col items-center justify-center gap-6 py-6">
        <CameraScanner onDecode={handleDecode} />
      </div>

      <ScanSimulator
        billets={billets}
        onSimulate={traiterScan}
        onSimulateUnknown={() => traiterScan(null)}
      />
    </main>
  );
}
