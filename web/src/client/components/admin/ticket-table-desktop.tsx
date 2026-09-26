import { Button } from "@/client/components/ui/button";
import { STATUT_LABEL, STATUT_TEXT_CLASS } from "@/shared/lib/tickets";
import type { Ticket } from "@/shared/lib/types";

const COLUMNS = [
  "Participant",
  "Origine",
  "Entrées",
  "Boissons",
  "Statut",
  "Action",
];

export function TicketTableDesktop({
  tickets,
  onToggleStatut,
}: {
  tickets: Ticket[];
  onToggleStatut: (ticket: Ticket) => void;
}) {
  return (
    <div className="hidden overflow-hidden rounded-2xl border border-line bg-ink-2 md:block">
      <div className="grid grid-cols-[2fr_1fr_0.7fr_0.8fr_1.2fr_0.9fr] gap-3.5 border-line border-b bg-[#1B1B27] px-6 py-3.5">
        {COLUMNS.map((h, i) => (
          <span
            key={h}
            className={`font-bold text-[#8B88A3] text-[11.5px] uppercase tracking-[0.1em] ${
              i === COLUMNS.length - 1 ? "text-right" : ""
            }`}
          >
            {h}
          </span>
        ))}
      </div>

      {tickets.map((t) => (
        <div
          key={t.id}
          className="grid grid-cols-[2fr_1fr_0.7fr_0.8fr_1.2fr_0.9fr] items-center gap-3.5 border-[#22222F] border-b px-6 py-3.5 last:border-0"
        >
          <div className="flex min-w-0 flex-col gap-0.5">
            <span className="truncate font-bold text-[14.5px]">{t.nom}</span>
            <span className="truncate text-[#8B88A3] text-[12.5px]">
              {t.email}
            </span>
          </div>
          <span className="text-[#C7C4DA] text-[13.5px]">
            {t.origine === "helloasso" ? "HelloAsso" : "Permanence"}
          </span>
          <div>
            <span className="inline-flex items-center rounded-full border border-line-2 bg-ink-4 px-2.5 py-1 font-bold text-[#C7C4DA] text-[13px]">
              {t.entrees}
            </span>
          </div>
          <span className="font-bold text-[14.5px]">{t.ticketsBoisson}</span>
          <span
            className={`font-bold text-[13px] ${STATUT_TEXT_CLASS[t.statut]}`}
          >
            {STATUT_LABEL[t.statut]}
            {t.statut === "scanne" && t.scanneA ? ` · ${t.scanneA}` : ""}
          </span>
          <div className="flex justify-end">
            <Button
              variant="secondary"
              size="sm"
              className="h-8.5 px-3.5 text-[12.5px]"
              onClick={() => onToggleStatut(t)}
            >
              {t.statut === "invalide" ? "Réactiver" : "Invalider"}
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}
