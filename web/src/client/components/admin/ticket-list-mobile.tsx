import { Button } from "@/client/components/ui/button";
import {
  MOYEN_PAIEMENT_LABEL,
  nomComplet,
  ORIGINE_LABEL,
  STATUT_LABEL,
  STATUT_TEXT_CLASS,
} from "@/shared/lib/tickets";
import type { BilletAdmin, Statut } from "@/shared/lib/types";

export function TicketListMobile({
  billets,
  onToggleStatut,
}: {
  billets: BilletAdmin[];
  onToggleStatut: (billetId: string, statutActuel: Statut) => void;
}) {
  return (
    <ul className="flex flex-col gap-3 md:hidden">
      {billets.map((billet) => (
        <li
          key={billet.id}
          className="flex flex-col gap-3 rounded-2xl border border-line bg-ink-2 p-4"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex min-w-0 flex-col gap-0.5">
              <span className="truncate font-bold text-[15px]">
                {nomComplet(billet.prenom, billet.nom)}
              </span>
              {billet.email && (
                <span className="truncate text-[12.5px] text-faint">
                  {billet.email}
                </span>
              )}
            </div>
            <span className="shrink-0 rounded-full border border-line-2 bg-ink-4 px-2.5 py-1 font-semibold text-[#C7C4DA] text-[12px]">
              {ORIGINE_LABEL[billet.origine]} ·{" "}
              {MOYEN_PAIEMENT_LABEL[billet.moyenPaiement]}
            </span>
          </div>

          <div className="flex items-center justify-between gap-2">
            <span className="font-mono text-[#C7C4DA] text-[12.5px]">
              {billet.code}
            </span>
            <span
              className={`text-right font-bold text-[12.5px] ${STATUT_TEXT_CLASS[billet.statut]}`}
            >
              {STATUT_LABEL[billet.statut]}
              {billet.statut === "scanne" && billet.scanneA
                ? ` · ${billet.scanneA}`
                : ""}
            </span>
          </div>

          <div className="flex items-center justify-between gap-2">
            <span className="rounded-full border border-line-2 bg-ink-4 px-2.5 py-1 font-semibold text-[#C7C4DA] text-[12px]">
              {billet.ticketsBoisson} ticket
              {billet.ticketsBoisson > 1 ? "s" : ""}
            </span>
            <Button
              variant="secondary"
              className="h-11 text-[13.5px]"
              onClick={() => onToggleStatut(billet.id, billet.statut)}
            >
              {billet.statut === "invalide" ? "Réactiver" : "Invalider"}
            </Button>
          </div>
        </li>
      ))}
    </ul>
  );
}
