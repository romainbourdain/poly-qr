"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { UnknownResult } from "@/client/components/scanner/results/unknown-result";
import { ValidResult } from "@/client/components/scanner/results/valid-result";
import { WarnResult } from "@/client/components/scanner/results/warn-result";
import { useTicket } from "@/client/store/ticket-store";

function ResultatContent() {
  const params = useSearchParams();
  const outcome = params.get("outcome") ?? "inconnu";
  const id = params.get("id");
  const ticket = useTicket(id ?? "");

  if (outcome === "valide" && ticket) {
    return <ValidResult ticket={ticket} />;
  }

  if ((outcome === "deja_scanne" || outcome === "invalide") && ticket) {
    return <WarnResult ticket={ticket} outcome={outcome} />;
  }

  return <UnknownResult />;
}

export default function ResultatPage() {
  return (
    <Suspense>
      <ResultatContent />
    </Suspense>
  );
}
