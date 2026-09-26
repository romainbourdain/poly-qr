import { Card } from "@/client/components/ui/card";
import { Separator } from "@/client/components/ui/separator";
import type { Ticket } from "@/shared/lib/types";

export function SessionTicketList({ tickets }: { tickets: Ticket[] }) {
  return (
    <Card className="flex flex-col gap-3 py-5 sm:px-6 sm:py-5.5">
      <div className="font-bold text-[12px] text-faint uppercase tracking-[0.14em]">
        Créés pendant cette permanence
      </div>
      {tickets.length === 0 ? (
        <div className="text-[13.5px] text-muted">
          Aucun billet créé pour l&apos;instant.
        </div>
      ) : (
        tickets.map((t, i) => (
          <div key={t.id} className="flex flex-col gap-3">
            {i > 0 && <Separator className="bg-[#262636]" />}
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
              <span className="flex-1 truncate font-semibold text-[14.5px]">
                {t.nom}
              </span>
              <span className="text-[13px] text-muted">
                {t.entrees} entrée{t.entrees > 1 ? "s" : ""} ·{" "}
                {t.ticketsBoisson} ticket{t.ticketsBoisson > 1 ? "s" : ""}
              </span>
              <span className="font-semibold text-[12.5px] text-good">
                envoyé
              </span>
            </div>
          </div>
        ))
      )}
    </Card>
  );
}
