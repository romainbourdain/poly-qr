import { ScannerClient } from "@/client/components/scanner/scanner-client";
import {
  listerBilletsAction,
  obtenirStatsBilletsAction,
} from "@/server/actions/tickets";

export const dynamic = "force-dynamic";

export default async function ScannerPage() {
  const [commandes, stats] = await Promise.all([
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

  return <ScannerClient entreesInitial={stats.scannes} billets={billets} />;
}
