import type { Sql } from "postgres";
import { afterAll, afterEach, beforeAll, describe, expect, it } from "vitest";
import { evenements } from "@/server/db/schema";
import {
  creerTestDb,
  fermerTestDb,
  nettoyerTestDb,
  type TestDb,
} from "@/server/db/test-utils/test-db";
import { hashPassword, verifyPassword } from "./auth";

describe("service auth (verifyPassword)", () => {
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

  async function createActiveEvent(password: string) {
    const motDePasseHash = await hashPassword(password);
    await db.insert(evenements).values({
      nom: "Soirée de rentrée",
      date: "2026-09-30",
      heure: "20:00:00",
      lieu: "Hangar",
      motDePasseHash,
      actif: true,
    });
  }

  it("accepte le bon mot de passe de l'événement actif", async () => {
    await createActiveEvent("hangar2026");

    await expect(verifyPassword(db, "hangar2026")).resolves.toBe(true);
  });

  it("refuse un mauvais mot de passe", async () => {
    await createActiveEvent("hangar2026");

    await expect(verifyPassword(db, "mauvais")).resolves.toBe(false);
  });

  it("refuse tout mot de passe s'il n'y a pas d'événement actif", async () => {
    await db.insert(evenements).values({
      nom: "Soirée passée",
      date: "2026-01-10",
      heure: "20:00:00",
      lieu: "Hangar",
      motDePasseHash: await hashPassword("ancien"),
      actif: false,
    });

    await expect(verifyPassword(db, "ancien")).resolves.toBe(false);
  });

  it("produit un hachage différent à chaque appel pour le même mot de passe (sel aléatoire)", async () => {
    const hash1 = await hashPassword("hangar2026");
    const hash2 = await hashPassword("hangar2026");

    expect(hash1).not.toBe(hash2);
  });
});
