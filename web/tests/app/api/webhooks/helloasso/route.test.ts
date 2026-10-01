import { eq } from "drizzle-orm";
import type { Sql } from "postgres";
import {
  afterAll,
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";
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

/** Items 1 et 3 ont l'option boisson, l'item 2 non. */
const ITEMS_AVEC_OPTION_BOISSON = new Set([1, 3]);
/** L'item 2 a une personne inscrite ; les autres tombent sur celle qui a payé. */
const INSCRITS = new Map([[2, { firstName: "Léa", lastName: "Martin" }]]);

function stubFetchHelloAsso() {
  vi.stubGlobal(
    "fetch",
    vi.fn(async (url: string) => {
      if (url.endsWith("/oauth2/token")) {
        return { ok: true, json: async () => ({ access_token: "token" }) };
      }

      const itemId = Number(new URL(url).pathname.split("/").pop());
      const options = ITEMS_AVEC_OPTION_BOISSON.has(itemId)
        ? [{ name: "Ticket boisson" }]
        : [];
      return {
        ok: true,
        json: async () => ({ options, user: INSCRITS.get(itemId) }),
      };
    }),
  );
}

function payloadValide(
  overrides: { id?: number | string; itemIds?: number[] } = {},
) {
  return {
    eventType: "Order",
    data: {
      id: overrides.id ?? 42,
      payer: {
        firstName: "Jean",
        lastName: "Dupont",
        email: "jean.dupont@example.org",
      },
      items: (overrides.itemIds ?? [1, 2]).map((id) => ({ id })),
    },
  };
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

  beforeEach(() => {
    stubFetchHelloAsso();
  });

  afterEach(async () => {
    vi.unstubAllGlobals();
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

  it("crée une commande et ses billets pour un paiement valide, avec 1 ticket boisson si l'option a été prise", async () => {
    const evenementId = await creerEvenement();

    const reponse = await appeler(
      requete(payloadValide({ id: 1, itemIds: [1, 2] }), evenementId),
      evenementId,
    );

    expect(reponse.status).toBe(200);

    const lignes = await db.select().from(commandes);
    expect(lignes).toHaveLength(1);
    expect(lignes[0].origine).toBe("helloasso");
    expect(lignes[0].helloassoPaymentId).toBe("1");

    const lignesBillets = await db
      .select()
      .from(billets)
      .where(eq(billets.commandeId, lignes[0].id));
    expect(lignesBillets).toHaveLength(2);
    // Une ligne boisson pour le seul billet qui a pris l'option.
    const lignesBoissonCommande = await db
      .select()
      .from(lignesBoisson)
      .where(eq(lignesBoisson.commandeId, lignes[0].id));
    expect(lignesBoissonCommande.map((l) => l.quantite)).toEqual([1]);
  });

  it("nomme chaque billet d'après la personne inscrite, sinon d'après celle qui a payé", async () => {
    const evenementId = await creerEvenement();

    await appeler(
      requete(payloadValide({ id: 9, itemIds: [1, 2] }), evenementId),
      evenementId,
    );

    const noms = (await db.select().from(billets)).map(
      (b) => `${b.prenom} ${b.nom}`,
    );
    expect(noms.sort()).toEqual(["Jean Dupont", "Léa Martin"]);
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

  it("ne crée pas deux commandes pour le même paiement rejoué, sans rappeler l'API HelloAsso", async () => {
    const evenementId = await creerEvenement();

    const premiere = await appeler(
      requete(payloadValide({ id: 3 }), evenementId),
      evenementId,
    );
    const appelsApresPremiere = vi.mocked(fetch).mock.calls.length;

    const rejeu = await appeler(
      requete(payloadValide({ id: 3 }), evenementId),
      evenementId,
    );

    expect(premiere.status).toBe(200);
    expect(rejeu.status).toBe(200);
    expect(vi.mocked(fetch).mock.calls.length).toBe(appelsApresPremiere);

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
