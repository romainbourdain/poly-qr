import Link from "next/link";
import { ResultIconCircle } from "@/client/components/scanner/result-icon-circle";
import { MOYEN_PAIEMENT_LABEL } from "@/shared/lib/tickets";
import type { BilletScanne } from "@/shared/lib/types";

function CheckIcon() {
  return (
    <svg
      width="46"
      height="46"
      viewBox="0 0 24 24"
      fill="none"
      stroke="#04150E"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="m4.5 12.5 5 5 10-11" />
    </svg>
  );
}

export function ValidResult({ billet }: { billet: BilletScanne }) {
  return (
    <main className="mx-auto flex min-h-dvh max-w-sm flex-col bg-[#071410] px-6 text-[#EAF7F1]">
      <div className="flex flex-1 flex-col items-center gap-5 pt-11">
        <ResultIconCircle className="bg-good">
          <CheckIcon />
        </ResultIconCircle>
        <div className="flex flex-col items-center gap-2 text-center">
          <h1 className="font-display font-extrabold text-[40px] text-good tracking-tight">
            VALIDE
          </h1>
          <div className="font-bold font-display text-[25px] tracking-tight">
            {billet.nom}
          </div>
          <div className="text-[#93B7A8] text-[14px]">
            {billet.origine === "helloasso"
              ? "Acheté sur HelloAsso"
              : "Billet de permanence"}
            {" · "}
            {MOYEN_PAIEMENT_LABEL[billet.moyenPaiement]}
          </div>
        </div>

        <div className="grid w-full grid-cols-2 gap-3">
          <div className="flex flex-col items-center gap-1.5 rounded-[20px] border border-good-line bg-good-bg px-4 py-5">
            <div className="text-center font-bold text-[#93B7A8] text-[13px] uppercase tracking-[0.14em]">
              Font entrer
            </div>
            <span className="font-display font-extrabold text-[64px] leading-none tracking-tight">
              1
            </span>
            <span className="font-bold text-[14px]">personne</span>
          </div>
          <div className="flex flex-col items-center gap-1.5 rounded-[20px] border border-good-line bg-good-bg px-4 py-5">
            <div className="text-center font-bold text-[#93B7A8] text-[13px] uppercase tracking-[0.14em]">
              À remettre
            </div>
            <span className="font-display font-extrabold text-[64px] leading-none tracking-tight">
              {billet.ticketsBoisson}
            </span>
            <span className="text-center font-bold text-[14px]">
              tickets boisson
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 text-[#93B7A8] text-[14px]">
          Entrée enregistrée à {billet.scanneA}
        </div>
      </div>
      <div className="pb-8">
        <Link
          href="/scanner"
          className="flex h-14.5 items-center justify-center rounded-2xl bg-good font-bold text-[#04150E] text-[17px]"
        >
          Scanner le suivant
        </Link>
      </div>
    </main>
  );
}
