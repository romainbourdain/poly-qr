import { eq } from "drizzle-orm";
import type { Sql } from "postgres";
import { afterAll, afterEach, beforeAll, describe, expect, it } from "vitest";
import { commandes, evenements } from "@/server/db/schema";
import {
  creerTestDb,
  fermerTestDb,
  nettoyerTestDb,
  type TestDb,
} from "@/server/db/test-utils/test-db";
import { verifyPassword } from "@/server/services/auth";
import {
  creerEvenement,
  listerEvenements,
  modifierEvenementActif,
  obtenirEvenementActif,
  obtenirEvenementDeCommande,
} from "@/server/services/evenements";

const base = {
  nom: "Soirée d'hiver",
  date: "2026-03-14",
  heure: "22:00",
  lieu: "Le Hangar",
  prixBilletCentimes: 500,
  prixTicketBoissonCentimes: 150,
};

describe("service evenements", () => {
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

  it("retourne null quand aucun événement n'est actif", async () => {
    expect(await obtenirEvenementActif(db)).toBeNull();
  });

  it("crée un événement actif lisible, sans exposer le hash", async () => {
    await creerEvenement(db, { ...base, motDePasse: "hangar2026" });

    const actif = await obtenirEvenementActif(db);
    expect(actif).toMatchObject({
      nom: "Soirée d'hiver",
      date: "Samedi 14 mars",
      heure: "22h00",
      lieu: "Le Hangar",
      prixBilletCentimes: 500,
      prixTicketBoissonCentimes: 150,
    });
    expect(actif).not.toHaveProperty("motDePasseHash");
    expect(await verifyPassword(db, "hangar2026")).toBe(true);
  });

  it("désactive le précédent sans le supprimer", async () => {
    const premier = await creerEvenement(db, { ...base, motDePasse: "un" });
    await db.insert(commandes).values({
      evenementId: premier.id,
      nom: "A",
      email: "a@b.fr",
      origine: "permanence",
      moyenPaiement: "especes",
    });
    const second = await creerEvenement(db, {
      ...base,
      nom: "Soirée de printemps",
      motDePasse: "deux",
    });

    const actif = await obtenirEvenementActif(db);
    expect(actif?.id).toBe(second.id);

    const tous = await listerEvenements(db);
    expect(tous).toHaveLength(2);
    const ancien = tous.find((e) => e.id === premier.id);
    expect(ancien).toMatchObject({ actif: false, nbCommandes: 1 });
    expect(await verifyPassword(db, "deux")).toBe(true);
    expect(await verifyPassword(db, "un")).toBe(false);
  });

  it("retrouve l'événement d'une commande même s'il n'est plus actif", async () => {
    const ancien = await creerEvenement(db, { ...base, motDePasse: "un" });
    const [commande] = await db
      .insert(commandes)
      .values({
        evenementId: ancien.id,
        nom: "A",
        email: "a@b.fr",
        origine: "permanence",
        moyenPaiement: "especes",
      })
      .returning();
    await creerEvenement(db, { ...base, nom: "Autre", motDePasse: "deux" });

    expect((await obtenirEvenementDeCommande(db, commande.id))?.nom).toBe(
      "Soirée d'hiver",
    );
  });

  it("modifie l'événement actif et garde le mot de passe si vide", async () => {
    await creerEvenement(db, { ...base, motDePasse: "hangar2026" });
    await modifierEvenementActif(db, {
      ...base,
      lieu: "Ailleurs",
      prixBilletCentimes: 700,
      motDePasse: "",
    });

    const actif = await obtenirEvenementActif(db);
    expect(actif).toMatchObject({ lieu: "Ailleurs", prixBilletCentimes: 700 });
    expect(await verifyPassword(db, "hangar2026")).toBe(true);
  });

  it("change le mot de passe quand il est fourni", async () => {
    await creerEvenement(db, { ...base, motDePasse: "ancien" });
    await modifierEvenementActif(db, { ...base, motDePasse: "nouveau" });
    expect(await verifyPassword(db, "nouveau")).toBe(true);
    expect(await verifyPassword(db, "ancien")).toBe(false);
  });

  it("refuse de modifier quand aucun événement n'est actif", async () => {
    await expect(
      modifierEvenementActif(db, { ...base, motDePasse: "" }),
    ).rejects.toThrow();
    expect(
      await db.select().from(evenements).where(eq(evenements.actif, true)),
    ).toHaveLength(0);
  });
});
