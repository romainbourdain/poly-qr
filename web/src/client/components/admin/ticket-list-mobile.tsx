import { Button } from "@/client/components/ui/button";
import { STATUT_LABEL, STATUT_TEXT_CLASS } from "@/shared/lib/tickets";
import type { Ticket } from "@/shared/lib/types";

export function TicketListMobile({
  tickets,
  onToggleStatut,
}: {
  tickets: Ticket[];
  onToggleStatut: (ticket: Ticket) => void;
}) {
  return (
    <div className="flex flex-col gap-2.5 md:hidden">
      {tickets.map((t) => (
        <div
          key={t.id}
          className="flex flex-col gap-3 rounded-2xl border border-line bg-ink-2 p-4"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex min-w-0 flex-col gap-0.5">
              <span className="truncate font-bold text-[15px]">{t.nom}</span>
              <span className="truncate text-[#8B88A3] text-[12.5px]">
                {t.email}
              </span>
            </div>
            <span
              className={`shrink-0 text-right font-bold text-[12.5px] ${STATUT_TEXT_CLASS[t.statut]}`}
            >
              {STATUT_LABEL[t.statut]}
              {t.statut === "scanne" && t.scanneA ? ` · ${t.scanneA}` : ""}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-[#C7C4DA] text-[12.5px]">
            <span className="rounded-full border border-line-2 bg-ink-4 px-2.5 py-1 font-semibold">
              {t.origine === "helloasso" ? "HelloAsso" : "Permanence"}
            </span>
            <span className="rounded-full border border-line-2 bg-ink-4 px-2.5 py-1 font-semibold">
              {t.entrees} entrée{t.entrees > 1 ? "s" : ""}
            </span>
            <span className="rounded-full border border-line-2 bg-ink-4 px-2.5 py-1 font-semibold">
              {t.ticketsBoisson} ticket{t.ticketsBoisson > 1 ? "s" : ""}
            </span>
          </div>

          <Button
            variant="secondary"
            className="h-10 text-[13px]"
            onClick={() => onToggleStatut(t)}
          >
            {t.statut === "invalide" ? "Réactiver" : "Invalider"}
          </Button>
        </div>
      ))}
    </div>
  );
}
