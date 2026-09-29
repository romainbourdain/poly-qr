import { Card } from "@/client/components/ui/card";
import type { StatsEvenement } from "@/shared/lib/types";

/** Avancement des entrées : scannés, restants, et billets invalidés. */
export function EntriesCard({ stats }: { stats: StatsEvenement }) {
  const { entreesScannees, billetsVendus, billetsInvalides } = stats;
  const restants = billetsVendus - entreesScannees;
  const pourcentage =
    billetsVendus > 0 ? Math.round((entreesScannees / billetsVendus) * 100) : 0;

  return (
    <Card className="flex flex-col gap-4">
      <h2 className="font-bold text-[16px]">Entrées</h2>
      <div className="flex items-baseline gap-2">
        <span className="font-display font-extrabold text-[34px] tabular-nums tracking-tight">
          {pourcentage} %
        </span>
        <span className="text-[13.5px] text-muted">des billets scannés</span>
      </div>
      <div
        role="progressbar"
        aria-label="Billets scannés"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={pourcentage}
        className="h-2.5 overflow-hidden rounded-full bg-ink-4"
      >
        <div
          className="h-full rounded-full bg-good"
          style={{ width: `${pourcentage}%` }}
        />
      </div>
      <dl className="grid grid-cols-3 gap-3 text-[13px]">
        <div className="flex flex-col">
          <dt className="text-muted">Entrés</dt>
          <dd className="font-bold text-[18px] tabular-nums">
            {entreesScannees}
          </dd>
        </div>
        <div className="flex flex-col">
          <dt className="text-muted">Restants</dt>
          <dd className="font-bold text-[18px] tabular-nums">{restants}</dd>
        </div>
        <div className="flex flex-col">
          <dt className="text-muted">Invalidés</dt>
          <dd className="font-bold text-[18px] tabular-nums">
            {billetsInvalides}
          </dd>
        </div>
      </dl>
    </Card>
  );
}
