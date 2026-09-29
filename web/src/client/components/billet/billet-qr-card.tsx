import { BilletStatusCard } from "@/client/components/billet/billet-status-card";
import { RealQr } from "@/client/components/billet/real-qr";
import type { BilletListe } from "@/shared/lib/types";

/** Billet façon ticket : QR sur plaque claire (contraste de scan), talon de statut séparé par une perforation. */
export function BilletQrCard({
  nom,
  billet,
}: {
  nom: string;
  billet: BilletListe;
}) {
  return (
    <div className="relative overflow-hidden rounded-3xl border border-line bg-ink-2">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-linear-to-b from-accent/25 to-transparent"
      />
      <div className="relative flex flex-col items-center gap-4 px-6 pt-6 pb-7">
        <div className="rounded-2xl bg-white p-3 shadow-[0_0_48px_-12px_var(--color-accent)]">
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
      </div>

      <div aria-hidden="true" className="relative h-0">
        <span className="absolute -top-3 -left-3 size-6 rounded-full border border-line bg-ink" />
        <span className="absolute -top-3 -right-3 size-6 rounded-full border border-line bg-ink" />
        <div className="mx-6 border-line-2 border-t border-dashed" />
      </div>

      <BilletStatusCard billet={billet} />
    </div>
  );
}
