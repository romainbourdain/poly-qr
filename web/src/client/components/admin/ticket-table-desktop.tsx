import { Button } from "@/client/components/ui/button";
import {
  MOYEN_PAIEMENT_LABEL,
  ORIGINE_LABEL,
  STATUT_LABEL,
  STATUT_TEXT_CLASS,
} from "@/shared/lib/tickets";
import type { CommandeAvecBillets, Statut } from "@/shared/lib/types";

export function TicketTableDesktop({
  commandes,
  onToggleStatut,
}: {
  commandes: CommandeAvecBillets[];
  onToggleStatut: (billetId: string, statutActuel: Statut) => void;
}) {
  return (
    <div className="hidden flex-col gap-3.5 md:flex">
      {commandes.map((commande) => (
        <div
          key={commande.commandeId}
          className="overflow-hidden rounded-2xl border border-line bg-ink-2"
        >
          <div className="flex items-center justify-between gap-3.5 border-line border-b bg-[#1B1B27] px-6 py-3.5">
            <div className="flex min-w-0 flex-col gap-0.5">
              <span className="truncate font-bold text-[14.5px]">
                {commande.nom}
              </span>
              {commande.email && (
                <span className="truncate text-[12.5px] text-faint">
                  {commande.email}
                </span>
              )}
            </div>
            <span className="shrink-0 font-bold text-[12px] text-faint uppercase tracking-[0.1em]">
              {ORIGINE_LABEL[commande.origine]} ·{" "}
              {MOYEN_PAIEMENT_LABEL[commande.moyenPaiement]}
            </span>
          </div>

          {commande.billets.map((billet) => (
            <div
              key={billet.id}
              className="grid grid-cols-[1fr_0.8fr_1.4fr_0.9fr] items-center gap-3.5 border-[#22222F] border-b px-6 py-3.5 last:border-0"
            >
              <span className="font-mono text-[#C7C4DA] text-[13px]">
                {billet.code}
              </span>
              <span className="font-bold text-[14.5px]">
                {billet.ticketsBoisson} ticket
                {billet.ticketsBoisson > 1 ? "s" : ""}
              </span>
              <span
                className={`font-bold text-[13px] ${STATUT_TEXT_CLASS[billet.statut]}`}
              >
                {STATUT_LABEL[billet.statut]}
                {billet.statut === "scanne" && billet.scanneA
                  ? ` · ${billet.scanneA}`
                  : ""}
              </span>
              <div className="flex justify-end">
                <Button
                  variant="secondary"
                  size="sm"
                  className="h-10 px-3.5 text-[13px]"
                  onClick={() => onToggleStatut(billet.id, billet.statut)}
                >
                  {billet.statut === "invalide" ? "Réactiver" : "Invalider"}
                </Button>
              </div>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
