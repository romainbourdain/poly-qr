import { createSearchParamsCache } from "nuqs/server";
import { AucunEvenement } from "@/client/components/admin/aucun-evenement";
import { NouveauBilletShell } from "@/client/components/admin/nouveau-billet-shell";
import { VenteForm } from "@/client/components/admin/vente-form";
import { db } from "@/server/db/client";
import { resoudreEvenementAdmin } from "@/server/services/evenements";
import { prixPrevente } from "@/shared/lib/prix";
import { adminSearchParams } from "@/shared/lib/search-params";

export const dynamic = "force-dynamic";

const searchParamsCache = createSearchParamsCache(adminSearchParams);

export default async function PageVenteAvance({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { evenement: demande } = await searchParamsCache.parse(searchParams);
  const evenement = await resoudreEvenementAdmin(db, demande);
  if (!evenement) return <AucunEvenement />;

  return (
    <NouveauBilletShell
      titre="Vente à l'avance"
      evenementNom={evenement.nom}
      description="Vente en main propre avant l'événement. Le QR part par email tout de suite."
    >
      <VenteForm
        mode="permanence"
        evenementId={evenement.id}
        prix={prixPrevente(evenement)}
      />
    </NouveauBilletShell>
  );
}
