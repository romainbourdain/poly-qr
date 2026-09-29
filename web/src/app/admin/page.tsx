import { createSearchParamsCache } from "nuqs/server";
import { AdminEvenementContent } from "@/client/components/admin/admin-evenement-content";
import { AucunEvenement } from "@/client/components/admin/aucun-evenement";
import { db } from "@/server/db/client";
import { env } from "@/server/env";
import { resoudreEvenementAdmin } from "@/server/services/evenements";
import { obtenirStatsEvenement } from "@/server/services/tickets";
import { adminSearchParams } from "@/shared/lib/search-params";

export const dynamic = "force-dynamic";

const searchParamsCache = createSearchParamsCache(adminSearchParams);

export default async function AdminEvenementPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { evenement: demande, nouveau } =
    await searchParamsCache.parse(searchParams);
  const evenement = await resoudreEvenementAdmin(db, demande);
  if (!evenement) return <AucunEvenement />;

  const stats = await obtenirStatsEvenement(db, evenement.id);

  return (
    <AdminEvenementContent
      evenement={evenement}
      stats={stats}
      helloassoUrl={`${env.APP_URL}/api/webhooks/helloasso/${evenement.id}?secret=${env.HELLOASSO_WEBHOOK_SECRET}`}
      scannerUrl={`${env.APP_URL}/scanner/${evenement.id}`}
      apresCreation={nouveau === "1"}
    />
  );
}
