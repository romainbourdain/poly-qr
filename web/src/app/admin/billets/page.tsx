import { createSearchParamsCache } from "nuqs/server";
import { AdminBilletsContent } from "@/client/components/admin/admin-billets-content";
import { AucunEvenement } from "@/client/components/admin/aucun-evenement";
import { unwrapAction } from "@/server/actions/safe-action";
import {
  listerBilletsAction,
  obtenirStatsBilletsAction,
} from "@/server/actions/tickets";
import { db } from "@/server/db/client";
import { resoudreEvenementAdmin } from "@/server/services/evenements";
import { listerAchatsSansBillet } from "@/server/services/tickets";
import {
  adminSearchParams,
  ticketFiltersSearchParams,
} from "@/shared/lib/search-params";

const searchParamsCache = createSearchParamsCache({
  ...ticketFiltersSearchParams,
  ...adminSearchParams,
});

export const dynamic = "force-dynamic";

export default async function AdminBilletsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const {
    q,
    statut,
    tri,
    ordre,
    page,
    evenement: demande,
  } = await searchParamsCache.parse(searchParams);
  const evenement = await resoudreEvenementAdmin(db, demande);
  if (!evenement) return <AucunEvenement />;

  const [billets, stats, achatsSansBillet] = await Promise.all([
    listerBilletsAction({
      evenementId: evenement.id,
      q,
      statut,
      tri,
      ordre,
      page,
    }),
    obtenirStatsBilletsAction({ evenementId: evenement.id }),
    // Les filtres de statut ne concernent que les billets.
    statut === "tous"
      ? listerAchatsSansBillet(db, evenement.id, q)
      : Promise.resolve([]),
  ]);

  const resultat = unwrapAction(billets);
  return (
    <AdminBilletsContent
      evenementId={evenement.id}
      billets={resultat.billets}
      totalPages={resultat.totalPages}
      stats={unwrapAction(stats)}
      achatsSansBillet={achatsSansBillet}
    />
  );
}
