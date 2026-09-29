import { Card } from "@/client/components/ui/card";
import type { Evenement } from "@/shared/lib/types";

export function EventHeaderCard({ evenement }: { evenement: Evenement }) {
  return (
    <Card className="flex flex-col gap-1.5">
      <h1 className="font-bold font-display text-[20px] tracking-tight sm:text-[23px]">
        {evenement.nom}
      </h1>
      <div className="text-[13.5px] text-muted">
        {evenement.date} · {evenement.heure} · {evenement.lieu}
      </div>
    </Card>
  );
}
