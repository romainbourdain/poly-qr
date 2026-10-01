import { createSearchParamsCache } from "nuqs/server";
import { AucunEvenement } from "@/client/components/admin/aucun-evenement";
import { BoissonForm } from "@/client/components/admin/boisson-form";
import { NouveauBilletShell } from "@/client/components/admin/nouveau-billet-shell";
import { db } from "@/server/db/client";
import { resoudreEvenementAdmin } from "@/server/services/evenements";
import { adminSearchParams } from "@/shared/lib/search-params";

export const dynamic = "force-dynamic";

const searchParamsCache = createSearchParamsCache(adminSearchParams);

export default async function PageTicketsBoisson({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { evenement: demande } = await searchParamsCache.parse(searchParams);
  const evenement = await resoudreEvenementAdmin(db, demande);
  if (!evenement) return <AucunEvenement />;

  return (
    <NouveauBilletShell
      titre="Tickets boisson"
      evenementNom={evenement.nom}
      description="Tickets en plus pour quelqu'un qui a déjà un billet."
    >
      <BoissonForm
        evenementId={evenement.id}
        prixTicketBoisson={evenement.prixTicketBoissonCentimes}
      />
    </NouveauBilletShell>
  );
}
