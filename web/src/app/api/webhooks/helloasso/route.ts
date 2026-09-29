import { db } from "@/server/db/client";
import {
  creerSmtpSender,
  envoyerEmailCommande,
  getAppUrl,
} from "@/server/services/email";
import { obtenirEvenementActif } from "@/server/services/evenements";
import {
  itemAOptionBoisson,
  obtenirTokenHelloAsso,
} from "@/server/services/helloasso-api";
import { mapperPayloadHelloAsso } from "@/server/services/helloasso-payload";
import {
  commandeHelloassoExiste,
  creerCommandeDepuisHelloAsso,
  versBilletListe,
} from "@/server/services/tickets";
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

/**
 * HelloAsso envoie un webhook par `eventType` pour un même achat (`Payment`,
 * `Order`...) ; seul `Order` est traité (voir helloasso-payload.ts). Les
 * autres sont acquittés avec un 200 sans traitement plutôt que rejetés, pour
 * éviter que HelloAsso les rejoue inutilement pendant 27h.
 */
const EVENT_TYPES_IGNORES = new Set(["Payment", "Form", "Organization"]);

function eventTypeIgnore(payload: unknown): boolean {
  return (
    typeof payload === "object" &&
    payload !== null &&
    "eventType" in payload &&
    EVENT_TYPES_IGNORES.has(
      String((payload as { eventType: unknown }).eventType),
    )
  );
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

  if (eventTypeIgnore(payload)) {
    return Response.json({ success: true, ignore: true });
  }

  let commande: ReturnType<typeof mapperPayloadHelloAsso>;
  try {
    commande = mapperPayloadHelloAsso(payload);
  } catch {
    return Response.json({ error: "Payload invalide." }, { status: 400 });
  }

  // Paiement déjà traité (webhook rejoué) : on s'arrête avant tout appel à
  // l'API HelloAsso (résolution des options) et tout envoi d'email.
  if (await commandeHelloassoExiste(db, commande.helloassoPaymentId)) {
    return Response.json({ success: true });
  }

  let billets: { ticketsBoisson: number }[];
  try {
    const token = await obtenirTokenHelloAsso();
    billets = await Promise.all(
      commande.itemIds.map(async (itemId) => ({
        ticketsBoisson: (await itemAOptionBoisson(token, itemId)) ? 1 : 0,
      })),
    );
  } catch (error) {
    console.error("Échec de la résolution des options HelloAsso", error);
    return Response.json(
      { error: "Échec de la résolution des options HelloAsso." },
      { status: 502 },
    );
  }

  const parsed = helloassoCommandeSchema.safeParse({
    nom: commande.nom,
    email: commande.email,
    helloassoPaymentId: commande.helloassoPaymentId,
    billets,
  });
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
      const evenement = await obtenirEvenementActif(db);
      if (!evenement) throw new Error("Aucun événement actif.");
      await envoyerEmailCommande(
        creerSmtpSender(),
        {
          commandeId: resultat.commande.id,
          nom: resultat.commande.nom,
          email: resultat.commande.email,
          billets: resultat.billets.map(versBilletListe),
        },
        evenement,
        getAppUrl(),
      );
    } catch (error) {
      console.error("Échec de l'envoi de l'email de commande HelloAsso", error);
    }
  }

  return Response.json({ success: true });
}
