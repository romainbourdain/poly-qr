import { RealQr } from "@/client/components/billet/real-qr";
import type { BilletListe } from "@/shared/lib/types";

export function BilletQrCard({
  nom,
  billet,
}: {
  nom: string;
  billet: BilletListe;
}) {
  return (
    <div className="flex flex-col items-center gap-4 rounded-3xl bg-[#F7F6FB] p-6">
      <RealQr value={`polyqr:${billet.code}`} size={226} />
      <div className="flex flex-col items-center gap-0.5">
        <div className="font-bold font-display text-[#14131C] text-[21px] tracking-tight">
          {nom}
        </div>
        <div className="text-[#56536B] text-[13px] tracking-wide">
          Billet {billet.code}
        </div>
      </div>
    </div>
  );
}
