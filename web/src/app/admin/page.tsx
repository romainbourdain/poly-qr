import { AdminEvenementsContent } from "@/client/components/admin/admin-evenements-content";
import { db } from "@/server/db/client";
import { listerEvenements } from "@/server/services/evenements";
import { obtenirStatsEvenement } from "@/server/services/tickets";

export const dynamic = "force-dynamic";

export default async function AdminEvenementsPage() {
  const [evenements, stats] = await Promise.all([
    listerEvenements(db),
    obtenirStatsEvenement(db),
  ]);
  const actif = evenements.find((e) => e.actif) ?? null;
  const passes = evenements.filter((e) => !e.actif);

  return <AdminEvenementsContent actif={actif} passes={passes} stats={stats} />;
}
