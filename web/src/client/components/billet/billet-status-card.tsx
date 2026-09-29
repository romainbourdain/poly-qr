import type { BilletListe } from "@/shared/lib/types";

export function BilletStatusCard({ billet }: { billet: BilletListe }) {
  return (
    <div className="flex items-center justify-center gap-3 px-6 pt-5 pb-6">
      <span className="font-display font-extrabold text-3xl text-accent-3 tabular-nums">
        {billet.ticketsBoisson}
      </span>
      <div className="flex flex-col">
        <span className="font-bold text-[14px]">
          ticket{billet.ticketsBoisson > 1 ? "s" : ""} boisson
        </span>
        <span className="text-[13px] text-muted">Remis à l&apos;entrée</span>
      </div>
    </div>
  );
}
