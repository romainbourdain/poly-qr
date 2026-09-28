import { db } from "@/server/db/client";
import { genererPdfCommande } from "@/server/services/pdf";
import { obtenirCommandeAvecBillets } from "@/server/services/tickets";
import { EVENT } from "@/shared/mock/event";
import { commandeIdSchema } from "@/shared/validators/commande";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ commandeId: string }> },
) {
  const { commandeId } = await params;
  const parsed = commandeIdSchema.safeParse(commandeId);
  if (!parsed.success) {
    return new Response("Commande introuvable.", { status: 404 });
  }

  const commande = await obtenirCommandeAvecBillets(db, parsed.data);
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
