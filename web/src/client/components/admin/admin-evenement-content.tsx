import { EvenementForm } from "@/client/components/admin/evenement-form";
import { EventSummaryCard } from "@/client/components/admin/event-summary-card";
import { HelloassoCard } from "@/client/components/admin/helloasso-card";
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
      <div className="grid grid-cols-1 items-start gap-5 xl:grid-cols-[minmax(0,22rem)_1fr]">
        <ScannerCard
          scannerUrl={scannerUrl}
          scannerPath={`/scanner/${evenement.id}`}
        />
        <section className="flex flex-col gap-3">
          <h2 className="font-bold text-[16px]">Configurer l&apos;événement</h2>
          {/* key : recharge les valeurs par défaut quand on change d'événement */}
          <EvenementForm
            key={evenement.id}
            mode="modifier"
            initial={evenement}
          />
        </section>
      </div>
    </div>
  );
}
