"use client";

import { Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useStore } from "@/lib/store";

function CheckIcon() {
  return (
    <svg width="46" height="46" viewBox="0 0 24 24" fill="none" stroke="#04150E" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="m4.5 12.5 5 5 10-11" />
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#1A1103" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 6.5v6l3.5 2.2" />
    </svg>
  );
}

function CrossIcon() {
  return (
    <svg width="46" height="46" viewBox="0 0 24 24" fill="none" stroke="#1E0709" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M6 6l12 12M18 6 6 18" />
    </svg>
  );
}

function ResultatContent() {
  const params = useSearchParams();
  const outcome = params.get("outcome") ?? "inconnu";
  const id = params.get("id");
  const { getTicket } = useStore();
  const ticket = id ? getTicket(id) : undefined;

  if (outcome === "valide" && ticket) {
    return (
      <main className="mx-auto flex min-h-screen max-w-sm flex-col bg-[#071410] px-6 text-[#EAF7F1]">
        <div className="flex flex-1 flex-col items-center gap-5 pt-11">
          <div className="flex h-24 w-24 items-center justify-center rounded-full bg-good">
            <CheckIcon />
          </div>
          <div className="flex flex-col items-center gap-2 text-center">
            <div className="font-display text-[40px] font-extrabold tracking-tight text-good">
              VALIDE
            </div>
            <div className="font-display text-[25px] font-bold tracking-tight">
              {ticket.nom}
            </div>
            <div className="text-[13.5px] text-[#93B7A8]">
              {ticket.origine === "helloasso" ? "Acheté sur HelloAsso" : "Billet de permanence"} · {ticket.creeA}
            </div>
          </div>

          <div className="grid w-full grid-cols-2 gap-3">
            <div className="flex flex-col items-center gap-1.5 rounded-[20px] border border-good-line bg-good-bg px-4 py-5">
              <div className="text-center text-[11px] font-bold tracking-[0.14em] text-[#93B7A8] uppercase">
                Font entrer
              </div>
              <span className="font-display text-[64px] leading-none font-extrabold tracking-tight">
                {ticket.entrees}
              </span>
              <span className="text-[14px] font-bold">
                {ticket.entrees > 1 ? "personnes" : "personne"}
              </span>
            </div>
            <div className="flex flex-col items-center gap-1.5 rounded-[20px] border border-good-line bg-good-bg px-4 py-5">
              <div className="text-center text-[11px] font-bold tracking-[0.14em] text-[#93B7A8] uppercase">
                À remettre
              </div>
              <span className="font-display text-[64px] leading-none font-extrabold tracking-tight">
                {ticket.ticketsBoisson}
              </span>
              <span className="text-center text-[14px] font-bold">
                tickets boisson
              </span>
            </div>
          </div>

          {ticket.entrees > 1 && (
            <div className="flex items-start gap-2.5 rounded-2xl border border-[#17402F] bg-[#0B1F18] px-4 py-3.5 text-[12.5px] leading-relaxed text-[#C2DACF]">
              Compte les {ticket.entrees} personnes avant de les laisser
              passer : le billet vient d&apos;être{" "}
              <strong className="font-bold text-[#EAF7F1]">consommé en entier</strong>.
            </div>
          )}

          <div className="flex items-center gap-2 text-[13px] text-[#93B7A8]">
            Entrée enregistrée à {ticket.scanneA}
          </div>
        </div>
        <div className="pb-8">
          <Link
            href="/scanner"
            className="flex h-14.5 items-center justify-center rounded-2xl bg-good text-[17px] font-bold text-[#04150E]"
          >
            Scanner le suivant
          </Link>
        </div>
      </main>
    );
  }

  if ((outcome === "deja_scanne" || outcome === "invalide") && ticket) {
    const titre = outcome === "invalide" ? "INVALIDÉ" : "DÉJÀ SCANNÉ";
    return (
      <main className="mx-auto flex min-h-screen max-w-sm flex-col bg-[#191206] px-6 text-[#F8EFDD]">
        <div className="flex flex-1 flex-col items-center gap-5 pt-11">
          <div className="flex h-24 w-24 items-center justify-center rounded-full bg-warn">
            <ClockIcon />
          </div>
          <div className="flex flex-col items-center gap-2 text-center">
            <div className="font-display text-[34px] font-extrabold tracking-tight text-warn">
              {titre}
            </div>
            <div className="font-display text-[25px] font-bold tracking-tight">
              {ticket.nom}
            </div>
            <div className="max-w-[280px] text-[14px] leading-relaxed text-[#C6B189]">
              {outcome === "invalide"
                ? "Ce billet a été invalidé par un organisateur. Ne laisse pas entrer sans vérification."
                : "Ce billet a déjà servi à entrer. Les tickets boisson ont déjà été remis."}
            </div>
          </div>

          <div className="flex w-full flex-col gap-3.5 rounded-[20px] border border-warn-line bg-warn-bg px-5.5 py-5">
            <div className="flex items-center justify-between gap-3">
              <span className="text-[13.5px] text-[#C6B189]">
                {outcome === "invalide" ? "Statut" : "Première entrée"}
              </span>
              <span className="text-[15px] font-bold">
                {outcome === "invalide" ? "Invalidé" : ticket.scanneA}
              </span>
            </div>
            <div className="h-px bg-warn-line" />
            <div className="flex items-center justify-between gap-3">
              <span className="text-[13.5px] text-[#C6B189]">
                Entrées sur ce billet
              </span>
              <span className="text-[15px] font-bold">{ticket.entrees}</span>
            </div>
            <div className="h-px bg-warn-line" />
            <div className="flex items-center justify-between gap-3">
              <span className="text-[13.5px] text-[#C6B189]">
                Tickets boisson
              </span>
              <span className="text-[15px] font-bold">
                {ticket.ticketsBoisson}
              </span>
            </div>
          </div>

          <div className="max-w-[290px] text-center text-[13px] leading-relaxed text-[#C6B189]">
            Si la personne conteste, vérifie son identité avant de la
            laisser entrer.
          </div>
        </div>
        <div className="pb-8">
          <Link
            href="/scanner"
            className="flex h-14.5 items-center justify-center rounded-2xl bg-warn text-[17px] font-bold text-[#1A1103]"
          >
            Scanner le suivant
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-sm flex-col bg-[#1A0C10] px-6 text-[#FBE9EC]">
      <div className="flex flex-1 flex-col items-center gap-5 pt-11">
        <div className="flex h-24 w-24 items-center justify-center rounded-full bg-bad">
          <CrossIcon />
        </div>
        <div className="flex flex-col items-center gap-2 text-center">
          <div className="font-display text-[34px] font-extrabold tracking-tight text-[#FF8A8A]">
            BILLET INCONNU
          </div>
          <div className="max-w-[290px] text-[15px] leading-relaxed text-[#DBB4B8]">
            Ce QR code ne correspond à aucun billet de cette soirée.
          </div>
        </div>

        <div className="flex w-full flex-col gap-3.5 rounded-[20px] border border-bad-line bg-bad-bg px-5.5 py-5.5">
          <div className="text-[12px] font-bold tracking-[0.14em] text-[#DBB4B8] uppercase">
            Que faire
          </div>
          {[
            "Vérifie que c'est bien le QR de cette soirée, pas d'un ancien événement.",
            "Cherche son nom dans la liste avec « Chercher par nom ».",
            "Rien trouvé ? Renvoie-la vers la file « paiement sur place ».",
          ].map((txt, i) => (
            <div key={i} className="flex items-start gap-2.5">
              <span className="flex h-5.5 w-5.5 shrink-0 items-center justify-center rounded-full bg-bad-line text-[12px] font-bold">
                {i + 1}
              </span>
              <span className="text-[14px] leading-relaxed">{txt}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="flex flex-col gap-2.5 pb-8">
        <Link
          href="/scanner"
          className="flex h-14.5 items-center justify-center rounded-2xl bg-bad text-[17px] font-bold text-[#1E0709]"
        >
          Scanner le suivant
        </Link>
      </div>
    </main>
  );
}

export default function ResultatPage() {
  return (
    <Suspense>
      <ResultatContent />
    </Suspense>
  );
}
