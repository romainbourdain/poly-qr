import { Badge } from "@/client/components/ui/badge";
import { STATUT_BADGE_VARIANT, STATUT_LABEL } from "@/shared/lib/tickets";
import type { BilletListe } from "@/shared/lib/types";

export function BilletStatusCard({ billet }: { billet: BilletListe }) {
  return (
    <div className="grid grid-cols-2 gap-4 px-6 pt-5 pb-6">
      <div className="flex flex-col items-start gap-1.5">
        <Badge variant={STATUT_BADGE_VARIANT[billet.statut]}>
          {STATUT_LABEL[billet.statut]}
        </Badge>
        {billet.scanneA && (
          <div className="text-[13px] text-muted">
            Scanné à {billet.scanneA}
          </div>
        )}
      </div>
      <div className="flex flex-col gap-1">
        <div className="flex items-baseline gap-1.5">
          <span className="font-display font-extrabold text-3xl text-accent-3 tabular-nums">
            {billet.ticketsBoisson}
          </span>
          <span className="font-bold text-[14px]">
            ticket{billet.ticketsBoisson > 1 ? "s" : ""}
          </span>
        </div>
        <div className="text-[13px] text-muted">
          Boisson, remis à l&apos;entrée
        </div>
      </div>
    </div>
  );
}
