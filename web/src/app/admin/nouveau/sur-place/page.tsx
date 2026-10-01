import { createSearchParamsCache } from "nuqs/server";
import { AucunEvenement } from "@/client/components/admin/aucun-evenement";
import { NouveauBilletShell } from "@/client/components/admin/nouveau-billet-shell";
import { VenteForm } from "@/client/components/admin/vente-form";
import { db } from "@/server/db/client";
import { resoudreEvenementAdmin } from "@/server/services/evenements";
import { prixSurPlace } from "@/shared/lib/prix";
import { adminSearchParams } from "@/shared/lib/search-params";

export const dynamic = "force-dynamic";

const searchParamsCache = createSearchParamsCache(adminSearchParams);

export default async function PageVenteSurPlace({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { evenement: demande } = await searchParamsCache.parse(searchParams);
  const evenement = await resoudreEvenementAdmin(db, demande);
  if (!evenement) return <AucunEvenement />;

  return (
    <NouveauBilletShell
      titre="Vente sur place"
      evenementNom={evenement.nom}
      description="La personne paye et entre tout de suite, sans QR ni email."
    >
      <VenteForm
        mode="sur_place"
        evenementId={evenement.id}
        prix={prixSurPlace(evenement)}
      />
    </NouveauBilletShell>
  );
}
