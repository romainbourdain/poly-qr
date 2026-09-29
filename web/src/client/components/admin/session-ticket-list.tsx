import { Card } from "@/client/components/ui/card";
import { Separator } from "@/client/components/ui/separator";
import { nomComplet } from "@/shared/lib/tickets";
import type { CommandeCreee } from "@/shared/lib/types";

export function SessionTicketList({
  commandes,
}: {
  commandes: CommandeCreee[];
}) {
  const billets = commandes.flatMap((commande) =>
    commande.billets.map((billet) => ({
      ...billet,
      origine: commande.origine,
    })),
  );

  return (
    <Card className="flex flex-col gap-3 py-5 sm:px-6 sm:py-5.5">
      <div className="font-bold text-[12px] text-muted uppercase tracking-[0.14em]">
        Créés pendant cette session
      </div>
      {billets.length === 0 ? (
        <div className="text-[13.5px] text-muted">
          Aucun billet créé pour l&apos;instant.
        </div>
      ) : (
        billets.map((billet, i) => (
          <div key={billet.id} className="flex flex-col gap-3">
            {i > 0 && <Separator className="bg-line" />}
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
              <span className="flex-1 truncate font-semibold text-[14.5px]">
                {nomComplet(billet.prenom, billet.nom)}
              </span>
              <span className="text-[13px] text-muted">
                {billet.ticketsBoisson} ticket
                {billet.ticketsBoisson > 1 ? "s" : ""}
              </span>
              <span className="font-semibold text-[12.5px] text-good">
                {billet.origine === "sur_place" ? "entré" : "envoyé"}
              </span>
            </div>
          </div>
        ))
      )}
    </Card>
  );
}
