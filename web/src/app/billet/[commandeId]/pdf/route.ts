import { obtenirCommandeAction } from "@/server/actions/tickets";
import { db } from "@/server/db/client";
import { obtenirEvenementDeCommande } from "@/server/services/evenements";
import { genererPdfCommande } from "@/server/services/pdf";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ commandeId: string }> },
) {
  const { commandeId } = await params;
  const commande = (await obtenirCommandeAction(commandeId))?.data;
  if (!commande || commande.billets.length === 0) {
    return new Response("Commande introuvable.", { status: 404 });
  }

  const evenement = await obtenirEvenementDeCommande(db, commande.commandeId);
  if (!evenement) {
    return new Response("Événement introuvable.", { status: 404 });
  }

  const pdf = await genererPdfCommande(commande, evenement);

  return new Response(new Uint8Array(pdf), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="billets-${commande.commandeId}.pdf"`,
    },
  });
}
