import { EvenementForm } from "@/client/components/admin/evenement-form";
import { EventHeaderCard } from "@/client/components/admin/event-header-card";
import { HelloassoCard } from "@/client/components/admin/helloasso-card";
import { ScannerCard } from "@/client/components/admin/scanner-card";
import type { Evenement } from "@/shared/lib/types";

export function AdminEvenementContent({
  evenement,
  helloassoUrl,
  scannerUrl,
  apresCreation,
}: {
  evenement: Evenement;
  helloassoUrl: string;
  scannerUrl: string;
  /** L'événement vient d'être créé : on met le branchement HelloAsso en avant. */
  apresCreation: boolean;
}) {
  return (
    <div className="flex flex-col gap-5 px-4 py-6 sm:gap-6 sm:px-6 sm:py-8 md:px-9">
      <EventHeaderCard evenement={evenement} />
      <HelloassoCard lien={helloassoUrl} misEnAvant={apresCreation} />
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
