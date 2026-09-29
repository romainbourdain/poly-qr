import Link from "next/link";
import { ResultIconCircle } from "@/client/components/scanner/result-icon-circle";
import { Separator } from "@/client/components/ui/separator";
import type { BilletScanne } from "@/shared/lib/types";

function ClockIcon() {
  return (
    <svg
      width="48"
      height="48"
      viewBox="0 0 24 24"
      fill="none"
      stroke="#1A1103"
      strokeWidth="2.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="9" />
      <path d="M12 6.5v6l3.5 2.2" />
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
  const titre = outcome === "invalide" ? "INVALIDÉ" : "DÉJÀ SCANNÉ";

  return (
    <main className="mx-auto flex min-h-dvh max-w-sm flex-col bg-[#191206] px-6 text-[#F8EFDD]">
      <div className="flex flex-1 flex-col items-center gap-5 pt-11">
        <ResultIconCircle className="bg-warn">
          <ClockIcon />
        </ResultIconCircle>
        <div className="flex flex-col items-center gap-2 text-center">
          <h1 className="font-display font-extrabold text-[34px] text-warn tracking-tight">
            {titre}
          </h1>
          <div className="font-bold font-display text-[25px] tracking-tight">
            {billet.nom}
          </div>
          <div className="max-w-70 text-[#C6B189] text-[14px] leading-relaxed">
            {outcome === "invalide"
              ? "Ce billet a été invalidé par un organisateur. Ne laisse pas entrer sans vérification."
              : "Ce billet a déjà servi à entrer. Les tickets boisson ont déjà été remis."}
          </div>
        </div>

        <div className="flex w-full flex-col gap-3.5 rounded-[20px] border border-warn-line bg-warn-bg px-5.5 py-5">
          <div className="flex items-center justify-between gap-3">
            <span className="text-[#C6B189] text-[14px]">
              {outcome === "invalide" ? "Statut" : "Première entrée"}
            </span>
            <span className="font-bold text-[15px]">
              {outcome === "invalide" ? "Invalidé" : billet.scanneA}
            </span>
          </div>
          {outcome === "deja_scanne" && (
            <>
              <Separator className="bg-warn-line" />
              <div className="flex items-center justify-between gap-3">
                <span className="text-[#C6B189] text-[14px]">
                  Entrées sur ce billet
                </span>
                <span className="font-bold text-[15px]">1</span>
              </div>
              <Separator className="bg-warn-line" />
              <div className="flex items-center justify-between gap-3">
                <span className="text-[#C6B189] text-[14px]">
                  Tickets boisson
                </span>
                <span className="font-bold text-[15px]">
                  {billet.ticketsBoisson}
                </span>
              </div>
            </>
          )}
        </div>

        <div className="max-w-72.5 text-center text-[#C6B189] text-[13px] leading-relaxed">
          Si la personne conteste, vérifie son identité avant de la laisser
          entrer.
        </div>
      </div>
      <div className="pb-8">
        <Link
          href={retourHref}
          className="flex h-14.5 items-center justify-center rounded-2xl bg-warn font-bold text-[#1A1103] text-[17px]"
        >
          Scanner le suivant
        </Link>
      </div>
    </main>
  );
}
