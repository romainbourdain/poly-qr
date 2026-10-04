import { db } from "@/server/db/client";
import { env } from "@/server/env";
import {
  creerEmailSender,
  envoyerEmailCommande,
  getAppUrl,
} from "@/server/services/email";
import {
  obtenirEvenement,
  obtenirEvenementDeCommande,
} from "@/server/services/evenements";
import {
  itemsVersBillets,
  mapperPayloadHelloAsso,
} from "@/server/services/helloasso-payload";
import {
  commandeHelloassoExiste,
  creerCommandeDepuisHelloAsso,
  versBilletListe,
} from "@/server/services/tickets";
import { evenementIdSchema } from "@/shared/validators/commande";
import { helloassoCommandeSchema } from "@/shared/validators/helloasso";

/**
 * HelloAsso ne signe pas ses webhooks : la vérification se fait via un
 * secret partagé, configuré comme paramètre de l'URL de callback déclarée
 * dans le back-office HelloAsso (`.../webhooks/helloasso/<id-evenement>?secret=...`).
 */
function secretValide(request: Request): boolean {
  const url = new URL(request.url);
  return url.searchParams.get("secret") === env.HELLOASSO_WEBHOOK_SECRET;
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

export async function POST(
  request: Request,
  { params }: { params: Promise<{ evenementId: string }> },
) {
  if (!secretValide(request)) {
    return Response.json({ error: "Signature invalide." }, { status: 401 });
  }

  // Chaque événement a sa propre URL de webhook : c'est elle qui désigne
  // l'événement auquel rattacher la commande HelloAsso.
  const evenementId = evenementIdSchema.safeParse((await params).evenementId);
  if (!evenementId.success || !(await obtenirEvenement(db, evenementId.data))) {
    return Response.json({ error: "Événement introuvable." }, { status: 404 });
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

  // Paiement déjà traité (webhook rejoué) : on s'arrête avant tout envoi d'email.
  if (await commandeHelloassoExiste(db, commande.helloassoPaymentId)) {
    return Response.json({ success: true });
  }

  const billets = itemsVersBillets(commande.items, {
    prenom: commande.payeurPrenom,
    nom: commande.payeurNom,
  });

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
    resultat = await creerCommandeDepuisHelloAsso(
      db,
      evenementId.data,
      parsed.data,
    );
  } catch (error) {
    console.error("Échec de la création de la commande HelloAsso", error);
    return Response.json(
      { error: "Échec de la création de la commande." },
      { status: 500 },
    );
  }

  if (!resultat.dejaTraitee) {
    try {
      const evenement = await obtenirEvenementDeCommande(
        db,
        resultat.commande.id,
      );
      if (!evenement) throw new Error("Événement introuvable.");
      if (!resultat.commande.email) throw new Error("Commande sans email.");
      await envoyerEmailCommande(
        creerEmailSender(),
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
