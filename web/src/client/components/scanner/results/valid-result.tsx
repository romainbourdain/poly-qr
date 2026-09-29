import {
  BilletIdentity,
  RESULT_LABEL_CLASSES,
  RESULT_PANEL_CLASSES,
  ScanResultLayout,
} from "@/client/components/scanner/results/scan-result-layout";
import type { BilletScanne } from "@/shared/lib/types";

function CheckIcon() {
  return (
    <svg
      className="size-full"
      viewBox="0 0 48 48"
      fill="none"
      stroke="currentColor"
      strokeWidth="5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="m8 25 11 11L40 13" />
    </svg>
  );
}

export function ValidResult({
  billet,
  retourHref,
}: {
  billet: BilletScanne;
  retourHref: string;
}) {
  return (
    <ScanResultLayout
      tone="good"
      icon={<CheckIcon />}
      title="Entrée autorisée"
      reason="Billet valide"
      retourHref={retourHref}
    >
      <section
        aria-label="Tickets boisson à remettre"
        className={RESULT_PANEL_CLASSES}
      >
        <p className={RESULT_LABEL_CLASSES}>À remettre maintenant</p>
        <div className="mt-2 flex items-center gap-3.5">
          <span className="font-display font-extrabold text-[96px] tabular-nums leading-none tracking-tight">
            {billet.ticketsBoisson}
          </span>
          <span className="whitespace-nowrap font-bold text-[20px]">
            {billet.ticketsBoisson > 1 ? "tickets boisson" : "ticket boisson"}
          </span>
        </div>
      </section>
      <BilletIdentity billet={billet} />
    </ScanResultLayout>
  );
}
