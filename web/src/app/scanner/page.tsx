"use client";

import { useRouter } from "next/navigation";
import { useCallback } from "react";
import { CameraScanner } from "@/client/components/scanner/camera-scanner";
import { ScanSimulator } from "@/client/components/scanner/scan-simulator";
import { ScannerHeader } from "@/client/components/scanner/scanner-header";
import { useTicketStore } from "@/client/store/ticket-store";

export default function ScannerPage() {
  const router = useRouter();
  const { tickets, scanTicket } = useTicketStore();

  const goToResult = useCallback(
    (id: string | null) => {
      if (!id) {
        router.push("/scanner/resultat?outcome=inconnu");
        return;
      }
      const outcome = scanTicket(id);
      router.push(`/scanner/resultat?outcome=${outcome.type}&id=${id}`);
    },
    [router, scanTicket],
  );

  const handleDecode = useCallback(
    (text: string) => {
      goToResult(text.startsWith("polyqr:") ? text.slice(7) : null);
    },
    [goToResult],
  );

  const entrees = tickets
    .filter((t) => t.statut === "scanne")
    .reduce((sum, t) => sum + t.entrees, 0);

  return (
    <main className="mx-auto flex min-h-screen max-w-sm flex-col bg-[#08080C] px-5">
      <ScannerHeader entrees={entrees} />

      <div className="flex flex-1 flex-col items-center justify-center gap-6 py-6">
        <CameraScanner onDecode={handleDecode} />
      </div>

      <ScanSimulator
        tickets={tickets}
        onSimulate={goToResult}
        onSimulateUnknown={() => goToResult(null)}
      />
    </main>
  );
}
