import type { Sql } from "postgres";
import { afterAll, afterEach, beforeAll, describe, expect, it } from "vitest";
import { evenements } from "@/server/db/schema";
import {
  creerTestDb,
  fermerTestDb,
  nettoyerTestDb,
  type TestDb,
} from "@/server/db/test-utils/test-db";
import {
  hashPassword,
  verifyAdminPassword,
  verifyEventPassword,
} from "@/server/services/auth";

describe("service auth", () => {
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

  async function creerEvenement(password: string, nom = "Soirée de rentrée") {
    const [evenement] = await db
      .insert(evenements)
      .values({
        nom,
        date: "2026-09-30",
        heure: "20:00:00",
        lieu: "Hangar",
        motDePasseHash: await hashPassword(password),
      })
      .returning({ id: evenements.id });
    return evenement.id;
  }

  it("accepte le bon mot de passe de l'événement", async () => {
    const id = await creerEvenement("hangar2026");

    await expect(verifyEventPassword(db, id, "hangar2026")).resolves.toBe(true);
  });

  it("refuse un mauvais mot de passe", async () => {
    const id = await creerEvenement("hangar2026");

    await expect(verifyEventPassword(db, id, "mauvais")).resolves.toBe(false);
  });

  it("refuse le mot de passe d'un autre événement (chaque scanner a le sien)", async () => {
    const soireeA = await creerEvenement("mot-de-passe-a", "Soirée A");
    const soireeB = await creerEvenement("mot-de-passe-b", "Soirée B");

    await expect(
      verifyEventPassword(db, soireeA, "mot-de-passe-b"),
    ).resolves.toBe(false);
    await expect(
      verifyEventPassword(db, soireeB, "mot-de-passe-b"),
    ).resolves.toBe(true);
  });

  it("refuse tout mot de passe pour un événement inconnu", async () => {
    await expect(
      verifyEventPassword(
        db,
        "00000000-0000-4000-8000-000000000000",
        "hangar2026",
      ),
    ).resolves.toBe(false);
  });

  it("vérifie le mot de passe admin global", () => {
    expect(verifyAdminPassword("test-admin-password")).toBe(true);
    expect(verifyAdminPassword("mauvais")).toBe(false);
    expect(verifyAdminPassword("")).toBe(false);
  });

  it("produit un hachage différent à chaque appel pour le même mot de passe (sel aléatoire)", async () => {
    const hash1 = await hashPassword("hangar2026");
    const hash2 = await hashPassword("hangar2026");

    expect(hash1).not.toBe(hash2);
  });
});
