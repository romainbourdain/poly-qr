import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import type { Sql } from "postgres";
import { afterAll, afterEach, beforeAll, describe, expect, it } from "vitest";
import { POST } from "@/app/api/webhooks/helloasso/[evenementId]/route";
import {
  billets,
  commandes,
  evenements,
  lignesBoisson,
} from "@/server/db/schema";
import {
  creerTestDb,
  fermerTestDb,
  nettoyerTestDb,
  type TestDb,
} from "@/server/db/test-utils/test-db";
import { hashPassword } from "@/server/services/auth";

const ENDPOINT = "http://localhost:3000/api/webhooks/helloasso";
const EVENEMENT_INCONNU = "00000000-0000-4000-8000-000000000000";
const SECRET = process.env.HELLOASSO_WEBHOOK_SECRET as string;

const DOSSIER_PAYLOADS = resolve(process.cwd(), "../docs/helloasso-webhooks");

/** Webhook réel capturé sur HelloAsso Sandbox (docs/helloasso-webhooks/). */
function payloadReel(nom: string) {
  return JSON.parse(readFileSync(`${DOSSIER_PAYLOADS}/${nom}.json`, "utf8"));
}

function payloadValide(overrides: { id?: number | string } = {}) {
  const payload = payloadReel("01-billet-cotisant.order");
  if (overrides.id !== undefined) payload.data.id = overrides.id;
  return payload;
}

function requete(body: unknown, evenementId: string, secret = SECRET) {
  return new Request(`${ENDPOINT}/${evenementId}?secret=${secret}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

/** Appelle la route comme le ferait Next.js pour `/api/webhooks/helloasso/<evenementId>`. */
function appeler(request: Request, evenementId: string) {
  return POST(request, { params: Promise.resolve({ evenementId }) });
}

describe("POST /api/webhooks/helloasso", () => {
  let db: TestDb;
  let client: Sql;

  beforeAll(async () => {
    ({ db, client } = await creerTestDb());
  });

  afterEach(async () => {
    await nettoyerTestDb(db);
  });

  afterAll(async () => {
    await fermerTestDb(client);
  });

  async function creerEvenement(nom = "Soirée de rentrée"): Promise<string> {
    const [evenement] = await db
      .insert(evenements)
      .values({
        nom,
        date: "2026-09-30",
        heure: "20:00:00",
        lieu: "Hangar",
        motDePasseHash: await hashPassword("hangar2026"),
      })
      .returning({ id: evenements.id });
    return evenement.id;
  }

  async function envoyer(nom: string) {
    const evenementId = await creerEvenement();
    const reponse = await appeler(
      requete(payloadReel(nom), evenementId),
      evenementId,
    );
    expect(reponse.status).toBe(200);

    const lignesBillets = await db.select().from(billets);
    const lignesBoissonBillet = await db.select().from(lignesBoisson);
    return lignesBillets
      .map((b) => ({
        nom: `${b.prenom} ${b.nom}`,
        cotisant: b.cotisant,
        boissons: lignesBoissonBillet
          .filter((l) => l.billetId === b.id)
          .reduce((total, l) => total + l.quantite, 0),
      }))
      .sort((x, y) => x.nom.localeCompare(y.nom));
  }

  it("crée une commande HelloAsso rattachée à l'événement, sans moyen de paiement saisi", async () => {
    await envoyer("01-billet-cotisant.order");

    const lignes = await db.select().from(commandes);
    expect(lignes).toHaveLength(1);
    expect(lignes[0].origine).toBe("helloasso");
    expect(lignes[0].moyenPaiement).toBe("hello_asso");
    expect(lignes[0].helloassoPaymentId).toBe("99078");
    expect(lignes[0].email).toBe("camille.martin.test@example.org");
  });

  it.each([
    [
      "1 billet cotisant",
      "01-billet-cotisant.order",
      [{ nom: "Alpha Durand", cotisant: true, boissons: 0 }],
    ],
    [
      "1 billet non cotisant",
      "02-billet-non-cotisant.order",
      [{ nom: "Bravo Lefevre", cotisant: false, boissons: 0 }],
    ],
    [
      "billet cotisant + 1 boisson (l'item boisson ne crée pas de billet)",
      "03-billet-cotisant-plus-boisson.order",
      [{ nom: "Charlie Moreau", cotisant: true, boissons: 1 }],
    ],
    [
      "billet + 3 boissons",
      "04-billet-plus-3-boissons.order",
      [{ nom: "Delta Garnier", cotisant: true, boissons: 3 }],
    ],
    [
      "2 billets, la boisson va au billet de la même personne",
      "05-deux-billets-une-boisson.order",
      [
        { nom: "Echo Fournier", cotisant: true, boissons: 0 },
        { nom: "Foxtrot Girard", cotisant: true, boissons: 1 },
      ],
    ],
    [
      "2 billets, une boisson chacun",
      "06-deux-billets-deux-boissons.order",
      [
        { nom: "Golf Hamel", cotisant: true, boissons: 1 },
        { nom: "Hotel Imbert", cotisant: true, boissons: 1 },
      ],
    ],
    [
      "billet cotisant et billet non cotisant dans la même commande",
      "07-cotisant-et-non-cotisant.order",
      [
        { nom: "India Jacob", cotisant: true, boissons: 0 },
        { nom: "Juliet Klein", cotisant: false, boissons: 0 },
      ],
    ],
    [
      "boisson seule : un billet non cotisant qui porte la boisson",
      "08-boisson-seule.order",
      [{ nom: "Lima Lambert", cotisant: false, boissons: 1 }],
    ],
  ])("webhook réel : %s", async (_cas, fichier, attendu) => {
    expect(await envoyer(fichier)).toEqual(attendu);
  });

  it("rejette un secret invalide sans créer de commande", async () => {
    const evenementId = await creerEvenement();

    const reponse = await appeler(
      requete(payloadValide({ id: 2 }), evenementId, "mauvais-secret"),
      evenementId,
    );

    expect(reponse.status).toBe(401);
    const lignes = await db.select().from(commandes);
    expect(lignes).toHaveLength(0);
  });

  it("ne crée pas deux commandes pour le même paiement rejoué", async () => {
    const evenementId = await creerEvenement();

    const premiere = await appeler(
      requete(payloadValide({ id: 3 }), evenementId),
      evenementId,
    );

    const rejeu = await appeler(
      requete(payloadValide({ id: 3 }), evenementId),
      evenementId,
    );

    expect(premiere.status).toBe(200);
    expect(rejeu.status).toBe(200);

    const lignes = await db.select().from(commandes);
    expect(lignes).toHaveLength(1);
  });

  it("rejette un payload malformé", async () => {
    const evenementId = await creerEvenement();

    const reponse = await appeler(
      requete({ foo: "bar" }, evenementId),
      evenementId,
    );

    expect(reponse.status).toBe(400);
    const lignes = await db.select().from(commandes);
    expect(lignes).toHaveLength(0);
  });

  it("acquitte sans traitement un eventType Payment (même achat, webhook séparé)", async () => {
    const evenementId = await creerEvenement();

    const reponse = await appeler(
      requete({ eventType: "Payment", data: { id: 99 } }, evenementId),
      evenementId,
    );

    expect(reponse.status).toBe(200);
    const lignes = await db.select().from(commandes);
    expect(lignes).toHaveLength(0);
  });

  it("rattache la commande à l'événement de l'URL du webhook", async () => {
    const soireeA = await creerEvenement("Soirée A");
    const soireeB = await creerEvenement("Soirée B");

    await appeler(requete(payloadValide({ id: 10 }), soireeB), soireeB);

    const lignes = await db.select().from(commandes);
    expect(lignes).toHaveLength(1);
    expect(lignes[0].evenementId).toBe(soireeB);
    expect(lignes[0].evenementId).not.toBe(soireeA);
  });

  it("répond 404 pour un événement inconnu, sans créer de commande", async () => {
    await creerEvenement();

    const reponse = await appeler(
      requete(payloadValide({ id: 11 }), EVENEMENT_INCONNU),
      EVENEMENT_INCONNU,
    );

    expect(reponse.status).toBe(404);
    expect(await db.select().from(commandes)).toHaveLength(0);
  });
});
