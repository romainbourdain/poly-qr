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

describe("schéma DB (evenements / commandes / billets)", () => {
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

  async function creerEvenement() {
    const [evenement] = await db
      .insert(evenements)
      .values({
        nom: "Soirée de rentrée",
        date: "2026-09-30",
        heure: "20:00:00",
        lieu: "Hangar",
        motDePasseHash: "hash-de-test",
      })
      .returning();
    return evenement;
  }

  it("persiste un événement, sa commande et ses billets liés", async () => {
    const evenement = await creerEvenement();

    const [commande] = await db
      .insert(commandes)
      .values({
        evenementId: evenement.id,
        nom: "Alix Martin",
        email: "alix@example.com",
        origine: "permanence",
        moyenPaiement: "especes",
      })
      .returning();

    const billetsCrees = await db
      .insert(billets)
      .values([
        {
          evenementId: commande.evenementId,
          commandeId: commande.id,
          nom: "Martin",
          prenom: "Alix",
          code: "ABC123",
        },
        {
          evenementId: commande.evenementId,
          commandeId: commande.id,
          nom: "Martin",
          prenom: "Alix",
          code: "ABC124",
        },
      ])
      .returning();

    expect(billetsCrees).toHaveLength(2);
    expect(billetsCrees.every((billet) => billet.statut === "non_scanne")).toBe(
      true,
    );

    const billetsDeLaCommande = await db
      .select()
      .from(billets)
      .where(eq(billets.commandeId, commande.id));
    expect(billetsDeLaCommande).toHaveLength(2);
  });

  it("refuse deux billets avec le même code", async () => {
    const evenement = await creerEvenement();
    const [commande] = await db
      .insert(commandes)
      .values({
        evenementId: evenement.id,
        nom: "Alix Martin",
        email: "alix@example.com",
        origine: "permanence",
        moyenPaiement: "especes",
      })
      .returning();

    await db.insert(billets).values({
      evenementId: commande.evenementId,
      commandeId: commande.id,
      nom: "Martin",
      prenom: "Alix",
      code: "DUP1",
    });

    await expect(
      db.insert(billets).values({
        evenementId: commande.evenementId,
        commandeId: commande.id,
        nom: "Martin",
        prenom: "Alix",
        code: "DUP1",
      }),
    ).rejects.toThrow();
  });

  it("refuse deux commandes avec le même helloasso_payment_id (idempotence du futur webhook)", async () => {
    const evenement = await creerEvenement();

    await db.insert(commandes).values({
      evenementId: evenement.id,
      nom: "Alix Martin",
      email: "alix@example.com",
      origine: "helloasso",
      moyenPaiement: "hello_asso",
      helloassoPaymentId: "hpid-1",
    });

    await expect(
      db.insert(commandes).values({
        evenementId: evenement.id,
        nom: "Autre Personne",
        email: "autre@example.com",
        origine: "helloasso",
        moyenPaiement: "hello_asso",
        helloassoPaymentId: "hpid-1",
      }),
    ).rejects.toThrow();
  });

  it("autorise plusieurs événements en même temps", async () => {
    await creerEvenement();
    await creerEvenement();

    expect(await db.select().from(evenements)).toHaveLength(2);
  });

  it("refuse une commande sans événement existant (FK)", async () => {
    await expect(
      db.insert(commandes).values({
        evenementId: "00000000-0000-0000-0000-000000000000",
        nom: "Alix Martin",
        email: "alix@example.com",
        origine: "permanence",
        moyenPaiement: "especes",
      }),
    ).rejects.toThrow();
  });

  it("le nettoyage entre tests vide bien les tables", async () => {
    const count = await db.select().from(evenements);
    expect(count).toHaveLength(0);
  });
});
