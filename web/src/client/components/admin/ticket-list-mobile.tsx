import { Button } from "@/client/components/ui/button";
import {
  MOYEN_PAIEMENT_LABEL,
  ORIGINE_LABEL,
  STATUT_LABEL,
  STATUT_TEXT_CLASS,
} from "@/shared/lib/tickets";
import type { CommandeAvecBillets, Statut } from "@/shared/lib/types";

export function TicketListMobile({
  commandes,
  onToggleStatut,
}: {
  commandes: CommandeAvecBillets[];
  onToggleStatut: (billetId: string, statutActuel: Statut) => void;
}) {
  return (
    <div className="flex flex-col gap-3 md:hidden">
      {commandes.map((commande) => (
        <div
          key={commande.commandeId}
          className="flex flex-col gap-3 rounded-2xl border border-line bg-ink-2 p-4"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex min-w-0 flex-col gap-0.5">
              <span className="truncate font-bold text-[15px]">
                {commande.nom}
              </span>
              <span className="truncate text-[#8B88A3] text-[12.5px]">
                {commande.email}
              </span>
            </div>
            <span className="shrink-0 rounded-full border border-line-2 bg-ink-4 px-2.5 py-1 font-semibold text-[#C7C4DA] text-[12px]">
              {ORIGINE_LABEL[commande.origine]} ·{" "}
              {MOYEN_PAIEMENT_LABEL[commande.moyenPaiement]}
            </span>
          </div>

          <div className="flex flex-col gap-2">
            {commande.billets.map((billet) => (
              <div
                key={billet.id}
                className="flex flex-col gap-2.5 rounded-xl border border-line-2 bg-ink-3 p-3"
              >
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
                    className="h-9 text-[12.5px]"
                    onClick={() => onToggleStatut(billet.id, billet.statut)}
                  >
                    {billet.statut === "invalide" ? "Réactiver" : "Invalider"}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
