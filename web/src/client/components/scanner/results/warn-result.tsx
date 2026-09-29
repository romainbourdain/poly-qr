import {
  BilletIdentity,
  ScanResultLayout,
} from "@/client/components/scanner/results/scan-result-layout";
import type { BilletScanne } from "@/shared/lib/types";

function ClockIcon() {
  return (
    <svg
      className="size-full"
      viewBox="0 0 48 48"
      fill="none"
      stroke="currentColor"
      strokeWidth="4"
      strokeLinecap="round"
      aria-hidden="true"
    >
      <circle cx="24" cy="24" r="19" />
      <path d="M24 12v13l9 6" />
    </svg>
  );
}

function BlockIcon() {
  return (
    <svg
      className="size-full"
      viewBox="0 0 48 48"
      fill="none"
      stroke="currentColor"
      strokeWidth="4"
      strokeLinecap="round"
      aria-hidden="true"
    >
      <circle cx="24" cy="24" r="19" />
      <path d="M11 11 37 37" />
    </svg>
  );
}

export function WarnResult({
  billet,
  outcome,
  retourHref,
}: {
  billet: BilletScanne;
  outcome: "deja_scanne" | "invalide";
  retourHref: string;
}) {
  const isInvalid = outcome === "invalide";

  return (
    <ScanResultLayout
      tone={isInvalid ? "bad" : "warn"}
      icon={isInvalid ? <BlockIcon /> : <ClockIcon />}
      title="Entrée refusée"
      reason={isInvalid ? "Billet invalidé" : "Billet déjà scanné"}
      instruction={
        isInvalid
          ? "Ne laisse pas entrer et ne remets aucun ticket. Demande une vérification à un organisateur."
          : "Ne laisse pas entrer et ne remets aucun nouveau ticket. Demande une vérification à un organisateur."
      }
      retourHref={retourHref}
    >
      <BilletIdentity billet={billet} showScanTime={!isInvalid} />
    </ScanResultLayout>
  );
}
