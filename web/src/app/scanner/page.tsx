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

  const billets = commandes.flatMap((commande) =>
    commande.billets.map((billet) => ({
      code: billet.code,
      nom: commande.nom,
      statut: billet.statut,
    })),
  );

  return (
    <ScannerClient
      evenementNom={evenement?.nom ?? "Aucun événement actif"}
      entreesInitial={stats.scannes}
      billets={billets}
    />
  );
}
