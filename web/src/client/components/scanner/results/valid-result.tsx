import Link from "next/link";
import { ResultIconCircle } from "@/client/components/scanner/result-icon-circle";
import type { Ticket } from "@/shared/lib/types";

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

export function ValidResult({ ticket }: { ticket: Ticket }) {
  return (
    <main className="mx-auto flex min-h-screen max-w-sm flex-col bg-[#071410] px-6 text-[#EAF7F1]">
      <div className="flex flex-1 flex-col items-center gap-5 pt-11">
        <ResultIconCircle className="bg-good">
          <CheckIcon />
        </ResultIconCircle>
        <div className="flex flex-col items-center gap-2 text-center">
          <div className="font-display font-extrabold text-[40px] text-good tracking-tight">
            VALIDE
          </div>
          <div className="font-bold font-display text-[25px] tracking-tight">
            {ticket.nom}
          </div>
          <div className="text-[#93B7A8] text-[13.5px]">
            {ticket.origine === "helloasso"
              ? "Acheté sur HelloAsso"
              : "Billet de permanence"}{" "}
            · {ticket.creeA}
          </div>
        </div>

        <div className="grid w-full grid-cols-2 gap-3">
          <div className="flex flex-col items-center gap-1.5 rounded-[20px] border border-good-line bg-good-bg px-4 py-5">
            <div className="text-center font-bold text-[#93B7A8] text-[11px] uppercase tracking-[0.14em]">
              Font entrer
            </div>
            <span className="font-display font-extrabold text-[64px] leading-none tracking-tight">
              {ticket.entrees}
            </span>
            <span className="font-bold text-[14px]">
              {ticket.entrees > 1 ? "personnes" : "personne"}
            </span>
          </div>
          <div className="flex flex-col items-center gap-1.5 rounded-[20px] border border-good-line bg-good-bg px-4 py-5">
            <div className="text-center font-bold text-[#93B7A8] text-[11px] uppercase tracking-[0.14em]">
              À remettre
            </div>
            <span className="font-display font-extrabold text-[64px] leading-none tracking-tight">
              {ticket.ticketsBoisson}
            </span>
            <span className="text-center font-bold text-[14px]">
              tickets boisson
            </span>
          </div>
        </div>

        {ticket.entrees > 1 && (
          <div className="flex items-start gap-2.5 rounded-2xl border border-[#17402F] bg-[#0B1F18] px-4 py-3.5 text-[#C2DACF] text-[12.5px] leading-relaxed">
            Compte les {ticket.entrees} personnes avant de les laisser passer :
            le billet vient d&apos;être{" "}
            <strong className="font-bold text-[#EAF7F1]">
              consommé en entier
            </strong>
            .
          </div>
        )}

        <div className="flex items-center gap-2 text-[#93B7A8] text-[13px]">
          Entrée enregistrée à {ticket.scanneA}
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
