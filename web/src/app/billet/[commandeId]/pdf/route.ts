import { obtenirCommandeAction } from "@/server/actions/tickets";
import { genererPdfCommande } from "@/server/services/pdf";
import { EVENT } from "@/shared/mock/event";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ commandeId: string }> },
) {
  const { commandeId } = await params;
  const commande = await obtenirCommandeAction(commandeId);
  if (!commande || commande.billets.length === 0) {
    return new Response("Commande introuvable.", { status: 404 });
  }

  const pdf = await genererPdfCommande(commande, EVENT);

  return new Response(new Uint8Array(pdf), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="billets-${commande.commandeId}.pdf"`,
    },
  });
}
