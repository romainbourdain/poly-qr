import { eq } from "drizzle-orm";
import type { Sql } from "postgres";
import { afterAll, afterEach, beforeAll, describe, expect, it } from "vitest";
import { billets, commandes, evenements } from "@/server/db/schema";
import {
  creerTestDb,
  fermerTestDb,
  nettoyerTestDb,
  type TestDb,
} from "@/server/db/test-utils/test-db";
import { hashPassword } from "@/server/services/auth";
import { POST } from "./route";

const URL = "http://localhost:3000/api/webhooks/helloasso";
const SECRET = process.env.HELLOASSO_WEBHOOK_SECRET as string;

function payloadValide(overrides: { id?: number | string } = {}) {
  return {
    eventType: "Payment",
    data: {
      id: overrides.id ?? 42,
      payer: {
        firstName: "Jean",
        lastName: "Dupont",
        email: "jean.dupont@example.org",
      },
      items: [
        { customFields: [{ name: "Tickets boisson", answer: "2" }] },
        { customFields: [] },
      ],
    },
  };
}

function requete(body: unknown, secret = SECRET) {
  return new Request(`${URL}?secret=${secret}`, {
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

  afterEach(async () => {
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

  it("crée une commande et ses billets pour un paiement valide", async () => {
    await creerEvenementActif();

    const reponse = await POST(requete(payloadValide({ id: 1 })));

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

  it("ne crée pas deux commandes pour le même paiement rejoué", async () => {
    await creerEvenementActif();

    const premiere = await POST(requete(payloadValide({ id: 3 })));
    const rejeu = await POST(requete(payloadValide({ id: 3 })));

    expect(premiere.status).toBe(200);
    expect(rejeu.status).toBe(200);

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
});
