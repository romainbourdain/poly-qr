import { createSearchParamsCache } from "nuqs/server";
import { AucunEvenement } from "@/client/components/admin/aucun-evenement";
import { StatsContent } from "@/client/components/admin/stats-content";
import { db } from "@/server/db/client";
import { resoudreEvenementAdmin } from "@/server/services/evenements";
import {
  listerScansEvenement,
  obtenirStatsEvenement,
} from "@/server/services/tickets";
import { construireAffluence } from "@/shared/lib/affluence";
import { adminSearchParams } from "@/shared/lib/search-params";

export const dynamic = "force-dynamic";

const searchParamsCache = createSearchParamsCache(adminSearchParams);

export default async function AdminStatistiquesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { evenement: demande } = await searchParamsCache.parse(searchParams);
  const evenement = await resoudreEvenementAdmin(db, demande);
  if (!evenement) return <AucunEvenement />;

  const [stats, scans] = await Promise.all([
    obtenirStatsEvenement(db, evenement.id),
    listerScansEvenement(db, evenement.id),
  ]);

  return (
    <StatsContent
      evenement={evenement}
      stats={stats}
      tranches={construireAffluence(scans, {
        date: evenement.dateIso,
        heure: evenement.heureIso,
      })}
    />
  );
}
