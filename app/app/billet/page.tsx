"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Qr } from "@/components/Qr";
import { EVENT, useStore } from "@/lib/store";

function BilletContent() {
  const params = useSearchParams();
  const id = params.get("id") ?? "t2";
  const { getTicket } = useStore();
  const ticket = getTicket(id);

  if (!ticket) {
    return (
      <main className="mx-auto flex min-h-screen max-w-md flex-col items-center justify-center gap-3 px-6 text-center">
        <div className="font-display text-2xl font-extrabold">
          Billet introuvable
        </div>
        <p className="text-[14px] text-muted">
          Cet identifiant de billet n&apos;existe pas dans la démo.
        </p>
      </main>
    );
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col px-6 py-7">
      <div className="flex flex-col gap-1.5">
        <div className="text-[11px] font-bold tracking-[0.18em] text-muted uppercase">
          Association Poly
        </div>
        <h1 className="font-display text-3xl font-extrabold tracking-tight">
          {EVENT.nom}
        </h1>
        <div className="text-[14px] text-muted">
          {EVENT.date} · {EVENT.heure} · {EVENT.lieu}
        </div>
      </div>

      <div className="flex flex-1 flex-col justify-center gap-3 py-5">
        <div className="flex flex-col items-center gap-4 rounded-3xl bg-[#F7F6FB] px-6 py-6">
          <Qr seed={ticket.id} size={226} />
          <div className="flex flex-col items-center gap-0.5">
            <div className="font-display text-[21px] font-bold tracking-tight text-[#14131C]">
              {ticket.nom}
            </div>
            <div className="text-[13px] tracking-wide text-[#56536B]">
              Billet {ticket.code} · {ticket.entrees}{" "}
              {ticket.entrees > 1 ? "entrées" : "entrée"}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2.5">
          <div className="flex flex-col gap-1 rounded-2xl border border-line bg-ink-3 px-4 py-3.5">
            <div className="flex items-baseline gap-1.5">
              <span className="font-display text-3xl font-extrabold">
                {ticket.entrees}
              </span>
              <span className="text-[14px] font-bold">
                {ticket.entrees > 1 ? "entrées" : "entrée"}
              </span>
            </div>
            <div className="text-[12px] text-muted">Sur ce billet</div>
          </div>
          <div className="flex flex-col gap-1 rounded-2xl border border-line bg-ink-3 px-4 py-3.5">
            <div className="flex items-baseline gap-1.5">
              <span className="font-display text-3xl font-extrabold text-accent-3">
                {ticket.ticketsBoisson}
              </span>
              <span className="text-[14px] font-bold">tickets</span>
            </div>
            <div className="text-[12px] text-muted">Boisson, remis à l&apos;entrée</div>
          </div>
        </div>

        {ticket.entrees > 1 && (
          <div className="flex items-start gap-2.5 rounded-2xl border border-[#2E2E4A] bg-[#17172A] px-4 py-3.5 text-[12.5px] leading-relaxed text-[#C7C4DA]">
            Présentez-vous <strong className="font-bold text-fg">tous en même temps</strong>{" "}
            : le QR est scanné une seule fois, pour les {ticket.entrees} entrées.
          </div>
        )}

        <div className="flex items-start gap-2.5 px-1 text-[12.5px] leading-relaxed text-muted">
          <span>
            Valable <strong className="font-bold text-fg">une seule fois</strong>.
            Monte la luminosité de ton écran avant de le présenter.
          </span>
        </div>
      </div>

      <div className="border-t border-[#22222F] pt-3.5 text-[12px] text-faint">
        Reçu par email après ton paiement HelloAsso.
      </div>
    </main>
  );
}

export default function BilletPage() {
  return (
    <Suspense>
      <BilletContent />
    </Suspense>
  );
}
