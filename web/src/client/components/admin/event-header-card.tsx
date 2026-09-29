import { Card } from "@/client/components/ui/card";
import type { Evenement } from "@/shared/lib/types";

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex min-w-0 flex-col gap-1 rounded-[14px] bg-ink-4 px-4 py-3.5">
      <span className="font-semibold text-[12px] text-muted">{label}</span>
      <span className="truncate font-bold text-[16px]">{value}</span>
    </div>
  );
}

export function EventHeaderCard({ evenement }: { evenement: Evenement }) {
  return (
    <Card className="flex flex-col gap-5">
      <h1 className="font-bold font-display text-[20px] tracking-tight sm:text-[23px]">
        {evenement.nom}
      </h1>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-3.5">
        <Detail label="Date" value={evenement.date} />
        <Detail label="Heure" value={evenement.heure} />
        <Detail label="Lieu" value={evenement.lieu} />
      </div>
    </Card>
  );
}
