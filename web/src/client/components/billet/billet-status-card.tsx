import { Badge } from "@/client/components/ui/badge";
import { STATUT_BADGE_VARIANT, STATUT_LABEL } from "@/shared/lib/tickets";
import type { BilletListe } from "@/shared/lib/types";

export function BilletStatusCard({ billet }: { billet: BilletListe }) {
  return (
    <div className="grid grid-cols-2 gap-2.5">
      <div className="flex flex-col gap-1.5 rounded-2xl border border-line bg-ink-3 px-4 py-3.5">
        <Badge variant={STATUT_BADGE_VARIANT[billet.statut]} className="w-fit">
          {STATUT_LABEL[billet.statut]}
        </Badge>
        <div className="text-[12px] text-muted">
          {billet.scanneA ? `À ${billet.scanneA}` : "Ce billet"}
        </div>
      </div>
      <div className="flex flex-col gap-1 rounded-2xl border border-line bg-ink-3 px-4 py-3.5">
        <div className="flex items-baseline gap-1.5">
          <span className="font-display font-extrabold text-3xl text-accent-3">
            {billet.ticketsBoisson}
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
