import { createSearchParamsCache } from "nuqs/server";
import { AucunEvenement } from "@/client/components/admin/aucun-evenement";
import { NouveauBilletContent } from "@/client/components/admin/nouveau-billet-content";
import { db } from "@/server/db/client";
import { resoudreEvenementAdmin } from "@/server/services/evenements";
import { adminSearchParams } from "@/shared/lib/search-params";

export const dynamic = "force-dynamic";

const searchParamsCache = createSearchParamsCache(adminSearchParams);

export default async function AdminNouveauBilletPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { evenement: demande } = await searchParamsCache.parse(searchParams);
  const evenement = await resoudreEvenementAdmin(db, demande);
  if (!evenement) return <AucunEvenement />;

  return (
    <NouveauBilletContent
      evenementId={evenement.id}
      evenementNom={evenement.nom}
      prix={{
        billet: evenement.prixBilletCentimes,
        ticketBoisson: evenement.prixTicketBoissonCentimes,
      }}
    />
  );
}
