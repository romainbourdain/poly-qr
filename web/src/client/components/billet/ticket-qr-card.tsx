import { RealQr } from "@/client/components/billet/real-qr";
import type { Ticket } from "@/shared/lib/types";

export function TicketQrCard({ ticket }: { ticket: Ticket }) {
  return (
    <div className="flex flex-col items-center gap-4 rounded-3xl bg-[#F7F6FB] p-6">
      <RealQr value={`polyqr:${ticket.id}`} size={226} />
      <div className="flex flex-col items-center gap-0.5">
        <div className="font-bold font-display text-[#14131C] text-[21px] tracking-tight">
          {ticket.nom}
        </div>
        <div className="text-[#56536B] text-[13px] tracking-wide">
          Billet {ticket.code} · {ticket.entrees}{" "}
          {ticket.entrees > 1 ? "entrées" : "entrée"}
        </div>
      </div>
    </div>
  );
}
