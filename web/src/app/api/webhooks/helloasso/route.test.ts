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
import { billets, commandes, evenements } from "@/server/db/schema";
import {
  creerTestDb,
  fermerTestDb,
  nettoyerTestDb,
  type TestDb,
} from "@/server/db/test-utils/test-db";
import { hashPassword } from "@/server/services/auth";
import { POST } from "./route";

const ENDPOINT = "http://localhost:3000/api/webhooks/helloasso";
const SECRET = process.env.HELLOASSO_WEBHOOK_SECRET as string;

/** Items 1 et 3 ont l'option boisson, l'item 2 non. */
const ITEMS_AVEC_OPTION_BOISSON = new Set([1, 3]);

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
      return { ok: true, json: async () => ({ options }) };
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

function requete(body: unknown, secret = SECRET) {
  return new Request(`${ENDPOINT}?secret=${secret}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
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

  async function creerEvenementActif(): Promise<void> {
    await db.insert(evenements).values({
      nom: "Soirée de rentrée",
      date: "2026-09-30",
      heure: "20:00:00",
      lieu: "Hangar",
      motDePasseHash: await hashPassword("hangar2026"),
      actif: true,
    });
  }

  it("crée une commande et ses billets pour un paiement valide, avec 1 ticket boisson si l'option a été prise", async () => {
    await creerEvenementActif();

    const reponse = await POST(
      requete(payloadValide({ id: 1, itemIds: [1, 2] })),
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
    expect(new Set(lignesBillets.map((b) => b.ticketsBoisson))).toEqual(
      new Set([1, 0]),
    );
  });

  it("rejette un secret invalide sans créer de commande", async () => {
    await creerEvenementActif();

    const reponse = await POST(
      requete(payloadValide({ id: 2 }), "mauvais-secret"),
    );

    expect(reponse.status).toBe(401);
    const lignes = await db.select().from(commandes);
    expect(lignes).toHaveLength(0);
  });

  it("ne crée pas deux commandes pour le même paiement rejoué, sans rappeler l'API HelloAsso", async () => {
    await creerEvenementActif();

    const premiere = await POST(requete(payloadValide({ id: 3 })));
    const appelsApresPremiere = vi.mocked(fetch).mock.calls.length;

    const rejeu = await POST(requete(payloadValide({ id: 3 })));

    expect(premiere.status).toBe(200);
    expect(rejeu.status).toBe(200);
    expect(vi.mocked(fetch).mock.calls.length).toBe(appelsApresPremiere);

    const lignes = await db.select().from(commandes);
    expect(lignes).toHaveLength(1);
  });

  it("rejette un payload malformé", async () => {
    await creerEvenementActif();

    const reponse = await POST(requete({ foo: "bar" }));

    expect(reponse.status).toBe(400);
    const lignes = await db.select().from(commandes);
    expect(lignes).toHaveLength(0);
  });

  it("acquitte sans traitement un eventType Payment (même achat, webhook séparé)", async () => {
    await creerEvenementActif();

    const reponse = await POST(
      requete({ eventType: "Payment", data: { id: 99 } }),
    );

    expect(reponse.status).toBe(200);
    const lignes = await db.select().from(commandes);
    expect(lignes).toHaveLength(0);
  });
});
