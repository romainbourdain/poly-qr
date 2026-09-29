import { notFound } from "next/navigation";
import { ScannerClient } from "@/client/components/scanner/scanner-client";
import { unwrapAction } from "@/server/actions/safe-action";
import {
  listerBilletsScannerAction,
  obtenirStatsBilletsScannerAction,
} from "@/server/actions/tickets";
import { db } from "@/server/db/client";
import { obtenirEvenement } from "@/server/services/evenements";
import { evenementIdSchema } from "@/shared/validators/commande";

export const dynamic = "force-dynamic";

export default async function ScannerPage({
  params,
}: {
  params: Promise<{ evenementId: string }>;
}) {
  const evenementId = evenementIdSchema.safeParse((await params).evenementId);
  if (!evenementId.success) notFound();

  const [evenement, commandes, stats] = await Promise.all([
    obtenirEvenement(db, evenementId.data),
    listerBilletsScannerAction(),
    obtenirStatsBilletsScannerAction(),
  ]);
  if (!evenement) notFound();

  const billets = unwrapAction(commandes).flatMap((commande) =>
    commande.billets.map((billet) => ({
      code: billet.code,
      nom: commande.nom,
      statut: billet.statut,
    })),
  );

  return (
    <ScannerClient
      evenementId={evenement.id}
      evenementNom={evenement.nom}
      entreesInitial={unwrapAction(stats).scannes}
      billets={billets}
    />
  );
}
