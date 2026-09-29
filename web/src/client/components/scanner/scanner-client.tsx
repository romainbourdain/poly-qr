"use client";

import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import { BilletSearch } from "@/client/components/scanner/billet-search";
import { CameraScanner } from "@/client/components/scanner/camera-scanner";
import { ScannerHeader } from "@/client/components/scanner/scanner-header";
import { useScanResultStore } from "@/client/store/scan-result-store";
import { scannerBilletAction } from "@/server/actions/tickets";
import {
  GENERIC_SERVER_ERROR,
  UNAUTHORIZED_ERROR,
} from "@/shared/lib/form-errors";
import type { BilletRecherchable } from "@/shared/lib/types";

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

  // Un QR scanné ou un billet choisi par nom passent par le même chemin : le
  // billet est validé côté serveur, puis on affiche le résultat.
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
      setResultat(scan.data);
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
    <main className="min-h-dvh w-full bg-[#08080C]">
      <div className="mx-auto flex min-h-dvh w-full max-w-md flex-col px-6">
        <ScannerHeader evenementNom={evenementNom} />

        <div className="flex flex-1 flex-col items-center justify-center gap-6 py-6">
          <CameraScanner onDecode={handleDecode} />
          {erreur && (
            <div role="alert" className="font-semibold text-[14px] text-bad">
              {erreur}
            </div>
          )}
        </div>

        <BilletSearch billets={billets} onSelect={traiterScan} />
      </div>
    </main>
  );
}
