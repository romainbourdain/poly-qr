import { ScannerClient } from "@/client/components/scanner/scanner-client";
import { obtenirEvenementActifAction } from "@/server/actions/evenements";
import {
  listerBilletsAction,
  obtenirStatsBilletsAction,
} from "@/server/actions/tickets";

export const dynamic = "force-dynamic";

export default async function ScannerPage() {
  const [evenement, commandes, stats] = await Promise.all([
    obtenirEvenementActifAction(),
    listerBilletsAction({ q: "", statut: "tous" }),
    obtenirStatsBilletsAction(),
  ]);

  const billets = (commandes?.data ?? []).flatMap((commande) =>
    commande.billets.map((billet) => ({
      code: billet.code,
      nom: commande.nom,
      statut: billet.statut,
    })),
  );

  return (
    <ScannerClient
      evenementNom={evenement?.data?.nom ?? "Aucun événement actif"}
      entreesInitial={stats?.data?.scannes ?? 0}
      billets={billets}
    />
  );
}
