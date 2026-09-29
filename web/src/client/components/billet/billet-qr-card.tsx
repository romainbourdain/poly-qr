import { BilletStatusCard } from "@/client/components/billet/billet-status-card";
import { RealQr } from "@/client/components/billet/real-qr";
import { Badge } from "@/client/components/ui/badge";
import { STATUT_BADGE_VARIANT, STATUT_LABEL } from "@/shared/lib/tickets";
import type { BilletListe } from "@/shared/lib/types";

/** Billet façon ticket : QR sur plaque claire (contraste de scan), talon tickets boisson séparé par une perforation. */
export function BilletQrCard({
  nom,
  billet,
}: {
  nom: string;
  billet: BilletListe;
}) {
  return (
    <div className="relative rounded-3xl border border-line bg-ink-2">
      <div className="flex flex-col items-center gap-4 p-6">
        <div className="rounded-2xl bg-white p-3">
          <RealQr value={`polyqr:${billet.code}`} size={210} />
        </div>
        <div className="flex flex-col items-center gap-1 text-center">
          <div className="font-bold font-display text-[21px] tracking-tight">
            {nom}
          </div>
          <div className="font-mono text-[13px] text-muted tracking-wide">
            Billet {billet.code}
          </div>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-x-2.5 gap-y-1">
          <Badge variant={STATUT_BADGE_VARIANT[billet.statut]}>
            {STATUT_LABEL[billet.statut]}
          </Badge>
          {billet.scanneA && (
            <span className="text-[13px] text-muted">à {billet.scanneA}</span>
          )}
        </div>
      </div>

      <div aria-hidden="true" className="relative h-0">
        <span className="absolute -top-3 -left-[13px] size-6 rounded-full border border-line border-l-transparent bg-ink" />
        <span className="absolute -top-3 -right-[13px] size-6 rounded-full border border-line border-r-transparent bg-ink" />
        <div className="mx-6 border-line-2 border-t border-dashed" />
      </div>

      <BilletStatusCard billet={billet} />
    </div>
  );
}
