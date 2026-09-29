import { EntriesCard } from "@/client/components/admin/entries-card";
import { EvenementForm } from "@/client/components/admin/evenement-form";
import { EventSummaryCard } from "@/client/components/admin/event-summary-card";
import { HelloassoCard } from "@/client/components/admin/helloasso-card";
import { SalesBreakdownCard } from "@/client/components/admin/sales-breakdown-card";
import { ScannerCard } from "@/client/components/admin/scanner-card";
import type { Evenement, StatsEvenement } from "@/shared/lib/types";

export function AdminEvenementContent({
  evenement,
  stats,
  helloassoUrl,
  scannerUrl,
  apresCreation,
}: {
  evenement: Evenement;
  stats: StatsEvenement;
  helloassoUrl: string;
  scannerUrl: string;
  /** L'événement vient d'être créé : on met le branchement HelloAsso en avant. */
  apresCreation: boolean;
}) {
  return (
    <div className="flex flex-col gap-5 px-4 py-6 sm:gap-6 sm:px-6 sm:py-8 md:px-9">
      <HelloassoCard lien={helloassoUrl} misEnAvant={apresCreation} />
      <EventSummaryCard evenement={evenement} stats={stats} />
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <SalesBreakdownCard evenement={evenement} stats={stats} />
        <EntriesCard stats={stats} />
      </div>
      <div className="grid grid-cols-1 items-start gap-5 xl:grid-cols-[minmax(0,22rem)_1fr]">
        <ScannerCard
          scannerUrl={scannerUrl}
          scannerPath={`/scanner/${evenement.id}`}
        />
        {/* key : recharge les valeurs par défaut quand on change d'événement */}
        <EvenementForm
          key={evenement.id}
          mode="modifier"
          titre="Configurer l'événement"
          initial={evenement}
        />
      </div>
    </div>
  );
}
