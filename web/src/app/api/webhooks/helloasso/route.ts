import { db } from "@/server/db/client";
import {
  creerSmtpSender,
  envoyerEmailCommande,
  getAppUrl,
} from "@/server/services/email";
import { mapperPayloadHelloAsso } from "@/server/services/helloasso-payload";
import {
  creerCommandeDepuisHelloAsso,
  versBilletListe,
} from "@/server/services/tickets";
import { EVENT } from "@/shared/mock/event";
import { helloassoCommandeSchema } from "@/shared/validators/helloasso";

/**
 * HelloAsso ne signe pas ses webhooks : la vérification se fait via un
 * secret partagé, configuré comme paramètre de l'URL de callback déclarée
 * dans le back-office HelloAsso (`.../webhooks/helloasso?secret=...`).
 */
function secretValide(request: Request): boolean {
  const secret = process.env.HELLOASSO_WEBHOOK_SECRET;
  if (!secret) {
    throw new Error("HELLOASSO_WEBHOOK_SECRET n'est pas défini");
  }

  const url = new URL(request.url);
  return url.searchParams.get("secret") === secret;
}

export async function POST(request: Request) {
  if (!secretValide(request)) {
    return Response.json({ error: "Signature invalide." }, { status: 401 });
  }

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return Response.json({ error: "Payload invalide." }, { status: 400 });
  }

  let entree: unknown;
  try {
    entree = mapperPayloadHelloAsso(payload);
  } catch {
    return Response.json({ error: "Payload invalide." }, { status: 400 });
  }

  const parsed = helloassoCommandeSchema.safeParse(entree);
  if (!parsed.success) {
    return Response.json({ error: "Payload invalide." }, { status: 400 });
  }

  let resultat: Awaited<ReturnType<typeof creerCommandeDepuisHelloAsso>>;
  try {
    resultat = await creerCommandeDepuisHelloAsso(db, parsed.data);
  } catch {
    return Response.json({ error: "Aucun événement actif." }, { status: 500 });
  }

  if (!resultat.dejaTraitee) {
    try {
      await envoyerEmailCommande(
        creerSmtpSender(),
        {
          commandeId: resultat.commande.id,
          nom: resultat.commande.nom,
          email: resultat.commande.email,
          billets: resultat.billets.map(versBilletListe),
        },
        EVENT,
        getAppUrl(),
      );
    } catch (error) {
      console.error("Échec de l'envoi de l'email de commande HelloAsso", error);
    }
  }

  return Response.json({ success: true });
}
