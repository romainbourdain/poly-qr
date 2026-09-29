import { ScannerClient } from "@/client/components/scanner/scanner-client";
import { obtenirEvenementActifAction } from "@/server/actions/evenements";
import { unwrapAction } from "@/server/actions/safe-action";
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

  const billets = unwrapAction(commandes).flatMap((commande) =>
    commande.billets.map((billet) => ({
      code: billet.code,
      nom: commande.nom,
      statut: billet.statut,
    })),
  );

  return (
    <ScannerClient
      evenementNom={unwrapAction(evenement)?.nom ?? "Aucun événement actif"}
      entreesInitial={unwrapAction(stats).scannes}
      billets={billets}
    />
  );
}
