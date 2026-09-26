import type { Ticket } from "@/shared/lib/types";

export function TicketEntryStats({ ticket }: { ticket: Ticket }) {
  return (
    <div className="grid grid-cols-2 gap-2.5">
      <div className="flex flex-col gap-1 rounded-2xl border border-line bg-ink-3 px-4 py-3.5">
        <div className="flex items-baseline gap-1.5">
          <span className="font-display font-extrabold text-3xl">
            {ticket.entrees}
          </span>
          <span className="font-bold text-[14px]">
            {ticket.entrees > 1 ? "entrées" : "entrée"}
          </span>
        </div>
        <div className="text-[12px] text-muted">Sur ce billet</div>
      </div>
      <div className="flex flex-col gap-1 rounded-2xl border border-line bg-ink-3 px-4 py-3.5">
        <div className="flex items-baseline gap-1.5">
          <span className="font-display font-extrabold text-3xl text-accent-3">
            {ticket.ticketsBoisson}
          </span>
          <span className="font-bold text-[14px]">tickets</span>
        </div>
        <div className="text-[12px] text-muted">
          Boisson, remis à l&apos;entrée
        </div>
      </div>
    </div>
  );
}
