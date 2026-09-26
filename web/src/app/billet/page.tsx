"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { TicketEntryStats } from "@/client/components/billet/ticket-entry-stats";
import { TicketQrCard } from "@/client/components/billet/ticket-qr-card";
import { useTicket } from "@/client/store/ticket-store";
import { EVENT } from "@/shared/mock/event";

function BilletContent() {
  const params = useSearchParams();
  const id = params.get("id") ?? "t2";
  const ticket = useTicket(id);

  if (!ticket) {
    return (
      <main className="mx-auto flex min-h-screen max-w-md flex-col items-center justify-center gap-3 px-6 text-center">
        <div className="font-display font-extrabold text-2xl">
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
        <div className="font-bold text-[11px] text-muted uppercase tracking-[0.18em]">
          Association Poly
        </div>
        <h1 className="font-display font-extrabold text-3xl tracking-tight">
          {EVENT.nom}
        </h1>
        <div className="text-[14px] text-muted">
          {EVENT.date} · {EVENT.heure} · {EVENT.lieu}
        </div>
      </div>

      <div className="flex flex-1 flex-col justify-center gap-3 py-5">
        <TicketQrCard ticket={ticket} />
        <TicketEntryStats ticket={ticket} />

        {ticket.entrees > 1 && (
          <div className="flex items-start gap-2.5 rounded-2xl border border-[#2E2E4A] bg-[#17172A] px-4 py-3.5 text-[#C7C4DA] text-[12.5px] leading-relaxed">
            Présentez-vous{" "}
            <strong className="font-bold text-fg">tous en même temps</strong> :
            le QR est scanné une seule fois, pour les {ticket.entrees} entrées.
          </div>
        )}

        <div className="flex items-start gap-2.5 px-1 text-[12.5px] text-muted leading-relaxed">
          <span>
            Valable{" "}
            <strong className="font-bold text-fg">une seule fois</strong>. Monte
            la luminosité de ton écran avant de le présenter.
          </span>
        </div>
      </div>

      <div className="border-[#22222F] border-t pt-3.5 text-[12px] text-faint">
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
