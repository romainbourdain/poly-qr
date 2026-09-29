import type { Sql } from "postgres";
import { afterAll, afterEach, beforeAll, describe, expect, it } from "vitest";
import { commandes } from "@/server/db/schema";
import {
  creerTestDb,
  fermerTestDb,
  nettoyerTestDb,
  type TestDb,
} from "@/server/db/test-utils/test-db";
import { verifyEventPassword } from "@/server/services/auth";
import {
  creerEvenement,
  EvenementIntrouvableError,
  listerEvenements,
  modifierEvenement,
  obtenirEvenement,
  obtenirEvenementDeCommande,
  resoudreEvenementAdmin,
} from "@/server/services/evenements";

const base = {
  nom: "Soirée d'hiver",
  date: "2026-03-14",
  heure: "22:00",
  lieu: "Le Hangar",
  prixBilletCentimes: 500,
  prixBilletSurPlaceCentimes: 700,
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

  it("retourne null pour un événement inconnu", async () => {
    expect(
      await obtenirEvenement(db, "00000000-0000-4000-8000-000000000000"),
    ).toBeNull();
  });

  it("crée un événement lisible, sans exposer le hash", async () => {
    const cree = await creerEvenement(db, {
      ...base,
      motDePasse: "hangar2026",
    });

    const evenement = await obtenirEvenement(db, cree.id);
    expect(evenement).toMatchObject({
      nom: "Soirée d'hiver",
      date: "Samedi 14 mars",
      heure: "22h00",
      lieu: "Le Hangar",
      prixBilletCentimes: 500,
      prixTicketBoissonCentimes: 150,
    });
    expect(evenement).not.toHaveProperty("motDePasseHash");
    expect(await verifyEventPassword(db, cree.id, "hangar2026")).toBe(true);
  });

  it("garde plusieurs événements côte à côte, chacun avec son mot de passe", async () => {
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
      date: "2026-04-18",
      motDePasse: "deux",
    });

    const tous = await listerEvenements(db);
    expect(tous.map((e) => e.id)).toEqual([second.id, premier.id]);
    expect(tous.find((e) => e.id === premier.id)).toMatchObject({
      nbCommandes: 1,
    });
    expect(await verifyEventPassword(db, second.id, "deux")).toBe(true);
    expect(await verifyEventPassword(db, second.id, "un")).toBe(false);
    expect(await verifyEventPassword(db, premier.id, "un")).toBe(true);
  });

  it("retrouve l'événement d'une commande", async () => {
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

  it("modifie l'événement ciblé seulement, et garde le mot de passe si vide", async () => {
    const cible = await creerEvenement(db, {
      ...base,
      motDePasse: "hangar2026",
    });
    const autre = await creerEvenement(db, {
      ...base,
      nom: "Autre",
      motDePasse: "x",
    });
    await modifierEvenement(db, cible.id, {
      ...base,
      lieu: "Ailleurs",
      prixBilletCentimes: 700,
      motDePasse: "",
    });

    expect(await obtenirEvenement(db, cible.id)).toMatchObject({
      lieu: "Ailleurs",
      prixBilletCentimes: 700,
    });
    expect((await obtenirEvenement(db, autre.id))?.lieu).toBe("Le Hangar");
    expect(await verifyEventPassword(db, cible.id, "hangar2026")).toBe(true);
  });

  it("change le mot de passe quand il est fourni", async () => {
    const { id } = await creerEvenement(db, { ...base, motDePasse: "ancien" });
    await modifierEvenement(db, id, { ...base, motDePasse: "nouveau" });
    expect(await verifyEventPassword(db, id, "nouveau")).toBe(true);
    expect(await verifyEventPassword(db, id, "ancien")).toBe(false);
  });

  it("refuse de modifier un événement inconnu", async () => {
    await expect(
      modifierEvenement(db, "00000000-0000-4000-8000-000000000000", {
        ...base,
        motDePasse: "",
      }),
    ).rejects.toBeInstanceOf(EvenementIntrouvableError);
  });

  it("l'admin affiche l'événement demandé, sinon le plus récent, sinon rien", async () => {
    expect(await resoudreEvenementAdmin(db, null)).toBeNull();

    const ancien = await creerEvenement(db, { ...base, motDePasse: "a" });
    const recent = await creerEvenement(db, {
      ...base,
      nom: "Récent",
      date: "2026-06-01",
      motDePasse: "b",
    });

    expect((await resoudreEvenementAdmin(db, null))?.id).toBe(recent.id);
    expect((await resoudreEvenementAdmin(db, ancien.id))?.id).toBe(ancien.id);
    expect(
      (await resoudreEvenementAdmin(db, "00000000-0000-4000-8000-000000000000"))
        ?.id,
    ).toBe(recent.id);
  });
});
