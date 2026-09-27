import { Card } from "@/client/components/ui/card";
import { Separator } from "@/client/components/ui/separator";
import type { CommandeCreee } from "@/shared/lib/types";

export function SessionTicketList({
  commandes,
}: {
  commandes: CommandeCreee[];
}) {
  return (
    <Card className="flex flex-col gap-3 py-5 sm:px-6 sm:py-5.5">
      <div className="font-bold text-[12px] text-faint uppercase tracking-[0.14em]">
        Créés pendant cette permanence
      </div>
      {commandes.length === 0 ? (
        <div className="text-[13.5px] text-muted">
          Aucun billet créé pour l&apos;instant.
        </div>
      ) : (
        commandes.map((commande, i) => {
          const totalBoisson = commande.billets.reduce(
            (s, b) => s + b.ticketsBoisson,
            0,
          );
          return (
            <div key={commande.commandeId} className="flex flex-col gap-3">
              {i > 0 && <Separator className="bg-[#262636]" />}
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                <span className="flex-1 truncate font-semibold text-[14.5px]">
                  {commande.nom}
                </span>
                <span className="text-[13px] text-muted">
                  {commande.billets.length} billet
                  {commande.billets.length > 1 ? "s" : ""} · {totalBoisson}{" "}
                  ticket{totalBoisson > 1 ? "s" : ""}
                </span>
                <span className="font-semibold text-[12.5px] text-good">
                  envoyé
                </span>
              </div>
            </div>
          );
        })
      )}
    </Card>
  );
}
