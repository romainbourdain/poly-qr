import {
  RESULT_PANEL_CLASSES,
  ScanResultLayout,
} from "@/client/components/scanner/results/scan-result-layout";
import { cn } from "@/shared/lib/cn";

function SearchOffIcon() {
  return (
    <svg
      className="size-full"
      viewBox="0 0 48 48"
      fill="none"
      stroke="currentColor"
      strokeWidth="4"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="21" cy="21" r="15" />
      <path d="m32 32 11 11M13 13l16 16" />
    </svg>
  );
}

export function UnknownResult({ retourHref }: { retourHref: string }) {
  return (
    <ScanResultLayout
      tone="bad"
      icon={<SearchOffIcon />}
      title="Entrée refusée"
      reason="Billet introuvable"
      instruction="Ne laisse pas entrer et ne remets aucun ticket. Demande une vérification à un organisateur."
      retourHref={retourHref}
    >
      <p
        className={cn(
          RESULT_PANEL_CLASSES,
          "font-semibold text-[18px] leading-snug",
        )}
      >
        Ce QR code ne correspond à aucun billet de cet événement.
      </p>
    </ScanResultLayout>
  );
}
