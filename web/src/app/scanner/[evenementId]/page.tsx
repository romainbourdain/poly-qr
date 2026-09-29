import { notFound } from "next/navigation";
import { ScannerClient } from "@/client/components/scanner/scanner-client";
import { unwrapAction } from "@/server/actions/safe-action";
import {
  listerBilletsScannerAction,
  obtenirStatsBilletsScannerAction,
} from "@/server/actions/tickets";
import { db } from "@/server/db/client";
import { obtenirEvenement } from "@/server/services/evenements";
import { nomComplet } from "@/shared/lib/tickets";
import { evenementIdSchema } from "@/shared/validators/commande";

export const dynamic = "force-dynamic";

export default async function ScannerPage({
  params,
}: {
  params: Promise<{ evenementId: string }>;
}) {
  const evenementId = evenementIdSchema.safeParse((await params).evenementId);
  if (!evenementId.success) notFound();

  const [evenement, tousLesBillets, stats] = await Promise.all([
    obtenirEvenement(db, evenementId.data),
    listerBilletsScannerAction(),
    obtenirStatsBilletsScannerAction(),
  ]);
  if (!evenement) notFound();

  const billets = unwrapAction(tousLesBillets).map((billet) => ({
    code: billet.code,
    nom: nomComplet(billet.prenom, billet.nom),
    statut: billet.statut,
  }));

  return (
    <ScannerClient
      evenementId={evenement.id}
      evenementNom={evenement.nom}
      entreesInitial={unwrapAction(stats).scannes}
      billets={billets}
    />
  );
}
