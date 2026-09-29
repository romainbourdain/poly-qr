"use client";

import { useParams } from "next/navigation";
import { UnknownResult } from "@/client/components/scanner/results/unknown-result";
import { ValidResult } from "@/client/components/scanner/results/valid-result";
import { WarnResult } from "@/client/components/scanner/results/warn-result";
import { useScanResultStore } from "@/client/store/scan-result-store";

export default function ResultatPage() {
  const resultat = useScanResultStore((state) => state.resultat);
  const { evenementId } = useParams<{ evenementId: string }>();
  const retourHref = `/scanner/${evenementId}`;

  if (!resultat || resultat.type === "inconnu") {
    return <UnknownResult retourHref={retourHref} />;
  }

  if (resultat.type === "valide") {
    return <ValidResult billet={resultat.billet} retourHref={retourHref} />;
  }

  return (
    <WarnResult
      billet={resultat.billet}
      outcome={resultat.type}
      retourHref={retourHref}
    />
  );
}
