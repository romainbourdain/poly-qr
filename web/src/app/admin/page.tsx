import { AdminEvenementsContent } from "@/client/components/admin/admin-evenements-content";
import { db } from "@/server/db/client";
import { listerEvenements } from "@/server/services/evenements";

export const dynamic = "force-dynamic";

export default async function AdminEvenementsPage() {
  const evenements = await listerEvenements(db);
  const actif = evenements.find((e) => e.actif) ?? null;
  const passes = evenements.filter((e) => !e.actif);

  return <AdminEvenementsContent actif={actif} passes={passes} />;
}
