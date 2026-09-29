import { createSearchParamsCache } from "nuqs/server";
import { AdminBilletsContent } from "@/client/components/admin/admin-billets-content";
import { unwrapAction } from "@/server/actions/safe-action";
import {
  listerBilletsAction,
  obtenirStatsBilletsAction,
} from "@/server/actions/tickets";
import { ticketFiltersSearchParams } from "@/shared/lib/search-params";

const searchParamsCache = createSearchParamsCache(ticketFiltersSearchParams);

export default async function AdminBilletsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { q, statut } = await searchParamsCache.parse(searchParams);

  const [commandes, stats] = await Promise.all([
    listerBilletsAction({ q, statut }),
    obtenirStatsBilletsAction(),
  ]);

  return (
    <AdminBilletsContent
      commandes={unwrapAction(commandes)}
      stats={unwrapAction(stats)}
    />
  );
}
