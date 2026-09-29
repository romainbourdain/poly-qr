import { randomUUID } from "node:crypto";
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
import {
  creerCommandeDepuisHelloAsso,
  creerCommandePermanence,
  invaliderBillet,
  listerBillets,
  obtenirCommandeAvecBillets,
  obtenirStatsBillets,
  obtenirStatsEvenement,
  reactiverBillet,
  scannerBillet,
} from "@/server/services/tickets";
import { formatHeure } from "@/shared/lib/tickets";

describe("service tickets", () => {
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
      .returning();
    return evenement.id;
  }

  describe("creerCommandePermanence", () => {
    it("crée une commande avec un billet par entrée demandée", async () => {
      const evenementId = await creerEvenement();

      const { commande, billets: nouveauxBillets } =
        await creerCommandePermanence(db, evenementId, {
          nom: "Sacha Lemoine",
          email: "sacha@etu-poly.fr",
          moyenPaiement: "especes",
          billets: [{ ticketsBoisson: 2 }, { ticketsBoisson: 0 }],
        });

      expect(commande.origine).toBe("permanence");
      expect(commande.moyenPaiement).toBe("especes");
      expect(nouveauxBillets).toHaveLength(2);
      expect(nouveauxBillets[0].statut).toBe("non_scanne");
      expect(nouveauxBillets[0].code).not.toBe(nouveauxBillets[1].code);
      expect(new Set(nouveauxBillets.map((b) => b.ticketsBoisson))).toEqual(
        new Set([2, 0]),
      );
    });
  });

  describe("creerCommandeDepuisHelloAsso", () => {
    it("crée une commande HelloAsso avec un billet par entrée du paiement", async () => {
      const evenementId = await creerEvenement();

      const {
        commande,
        billets: nouveauxBillets,
        dejaTraitee,
      } = await creerCommandeDepuisHelloAsso(db, evenementId, {
        nom: "Jean Dupont",
        email: "jean@etu-poly.fr",
        helloassoPaymentId: "hp-123",
        billets: [{ ticketsBoisson: 2 }],
      });

      expect(dejaTraitee).toBe(false);
      expect(commande.origine).toBe("helloasso");
      expect(commande.moyenPaiement).toBe("hello_asso");
      expect(commande.helloassoPaymentId).toBe("hp-123");
      expect(nouveauxBillets).toHaveLength(1);
      expect(nouveauxBillets[0].ticketsBoisson).toBe(2);
    });

    it("est idempotente : un même paiement rejoué ne crée pas de nouvelle commande", async () => {
      const evenementId = await creerEvenement();

      const premiere = await creerCommandeDepuisHelloAsso(db, evenementId, {
        nom: "Jean Dupont",
        email: "jean@etu-poly.fr",
        helloassoPaymentId: "hp-123",
        billets: [{ ticketsBoisson: 2 }],
      });

      const rejeu = await creerCommandeDepuisHelloAsso(db, evenementId, {
        nom: "Jean Dupont",
        email: "jean@etu-poly.fr",
        helloassoPaymentId: "hp-123",
        billets: [{ ticketsBoisson: 2 }],
      });

      expect(rejeu.dejaTraitee).toBe(true);
      expect(rejeu.commande.id).toBe(premiere.commande.id);
      expect(rejeu.billets).toHaveLength(1);

      const toutesLesCommandes = await db.select().from(commandes);
      expect(toutesLesCommandes).toHaveLength(1);
    });
  });

  describe("listerBillets", () => {
    it("groupe les billets par commande et filtre côté serveur par recherche et statut", async () => {
      const evenementId = await creerEvenement();

      const [commandeA] = await db
        .insert(commandes)
        .values({
          evenementId,
          nom: "Sacha Lemoine",
          email: "sacha@etu-poly.fr",
          origine: "permanence",
          moyenPaiement: "especes",
        })
        .returning();

      const [commandeB] = await db
        .insert(commandes)
        .values({
          evenementId,
          nom: "Léa Dupont",
          email: "lea@etu-poly.fr",
          origine: "helloasso",
          moyenPaiement: "hello_asso",
        })
        .returning();

      await db.insert(billets).values([
        {
          commandeId: commandeA.id,
          code: "AAAA",
          ticketsBoisson: 1,
          statut: "non_scanne",
        },
        {
          commandeId: commandeA.id,
          code: "BBBB",
          ticketsBoisson: 0,
          statut: "invalide",
        },
        {
          commandeId: commandeB.id,
          code: "CCCC",
          ticketsBoisson: 3,
          statut: "non_scanne",
        },
      ]);

      const tous = await listerBillets(db, evenementId, {
        q: "",
        statut: "tous",
      });
      expect(tous).toHaveLength(2);
      const sacha = tous.find((c) => c.commandeId === commandeA.id);
      expect(sacha?.billets).toHaveLength(2);

      const parNom = await listerBillets(db, evenementId, {
        q: "léa",
        statut: "tous",
      });
      expect(parNom).toHaveLength(1);
      expect(parNom[0].nom).toBe("Léa Dupont");

      const parStatut = await listerBillets(db, evenementId, {
        q: "",
        statut: "invalide",
      });
      expect(parStatut).toHaveLength(1);
      expect(parStatut[0].billets).toHaveLength(1);
      expect(parStatut[0].billets[0].code).toBe("BBBB");
    });
  });

  describe("invaliderBillet / reactiverBillet", () => {
    it("ne change le statut que du billet visé, pas des autres billets de la commande", async () => {
      const evenementId = await creerEvenement();
      const [commande] = await db
        .insert(commandes)
        .values({
          evenementId,
          nom: "Sacha Lemoine",
          email: "sacha@etu-poly.fr",
          origine: "permanence",
          moyenPaiement: "especes",
        })
        .returning();

      const [billetA, billetB] = await db
        .insert(billets)
        .values([
          { commandeId: commande.id, code: "AAAA", ticketsBoisson: 0 },
          { commandeId: commande.id, code: "BBBB", ticketsBoisson: 0 },
        ])
        .returning();

      await invaliderBillet(db, billetA.id);

      const [resultats] = await listerBillets(db, evenementId, {
        q: "",
        statut: "tous",
      });
      const a = resultats.billets.find((b) => b.id === billetA.id);
      const b = resultats.billets.find((b) => b.id === billetB.id);
      expect(a?.statut).toBe("invalide");
      expect(b?.statut).toBe("non_scanne");

      await reactiverBillet(db, billetA.id);
      const [apresReactivation] = await listerBillets(db, evenementId, {
        q: "",
        statut: "tous",
      });
      expect(
        apresReactivation.billets.find((b) => b.id === billetA.id)?.statut,
      ).toBe("non_scanne");
    });
  });

  describe("scannerBillet", () => {
    it("marque un billet non scanné comme scanné et retourne ses infos", async () => {
      const evenementId = await creerEvenement();
      const [commande] = await db
        .insert(commandes)
        .values({
          evenementId,
          nom: "Sacha Lemoine",
          email: "sacha@etu-poly.fr",
          origine: "permanence",
          moyenPaiement: "especes",
        })
        .returning();

      await db.insert(billets).values({
        commandeId: commande.id,
        code: "AAAA",
        ticketsBoisson: 2,
      });

      const resultat = await scannerBillet(db, evenementId, "AAAA");

      expect(resultat.type).toBe("valide");
      if (resultat.type !== "valide") throw new Error("type inattendu");
      expect(resultat.billet.nom).toBe("Sacha Lemoine");
      expect(resultat.billet.ticketsBoisson).toBe(2);
      expect(resultat.billet.scanneA).not.toBeNull();

      const [ligne] = await db
        .select({ statut: billets.statut })
        .from(billets)
        .where(eq(billets.code, "AAAA"));
      expect(ligne.statut).toBe("scanne");
    });

    it("scan concurrent : un seul gagne 'valide', l'autre voit la vraie heure du scan gagnant", async () => {
      const evenementId = await creerEvenement();
      const [commande] = await db
        .insert(commandes)
        .values({
          evenementId,
          nom: "Sacha Lemoine",
          email: "sacha@etu-poly.fr",
          origine: "permanence",
          moyenPaiement: "especes",
        })
        .returning();

      await db.insert(billets).values({
        commandeId: commande.id,
        code: "AAAA",
      });

      const [a, b] = await Promise.all([
        scannerBillet(db, evenementId, "AAAA"),
        scannerBillet(db, evenementId, "AAAA"),
      ]);
      const [gagnant, perdant] = a.type === "valide" ? [a, b] : [b, a];

      expect(gagnant.type).toBe("valide");
      expect(perdant.type).toBe("deja_scanne");
      if (gagnant.type !== "valide" || perdant.type !== "deja_scanne") {
        throw new Error("type inattendu");
      }
      expect(perdant.billet.scanneA).not.toBeNull();
      expect(perdant.billet.scanneA).toBe(gagnant.billet.scanneA);
    });

    it("retourne 'déjà scanné' pour un billet déjà scanné, sans changer sa date de scan", async () => {
      const evenementId = await creerEvenement();
      const [commande] = await db
        .insert(commandes)
        .values({
          evenementId,
          nom: "Sacha Lemoine",
          email: "sacha@etu-poly.fr",
          origine: "permanence",
          moyenPaiement: "especes",
        })
        .returning();

      const premierScan = new Date("2026-09-30T20:00:00Z");
      await db.insert(billets).values({
        commandeId: commande.id,
        code: "AAAA",
        statut: "scanne",
        scanneA: premierScan,
      });

      const resultat = await scannerBillet(db, evenementId, "AAAA");

      expect(resultat.type).toBe("deja_scanne");
      if (resultat.type !== "deja_scanne") throw new Error("type inattendu");
      expect(resultat.billet.scanneA).toBe(formatHeure(premierScan));
    });

    it("retourne 'invalide' pour un billet invalidé", async () => {
      const evenementId = await creerEvenement();
      const [commande] = await db
        .insert(commandes)
        .values({
          evenementId,
          nom: "Sacha Lemoine",
          email: "sacha@etu-poly.fr",
          origine: "permanence",
          moyenPaiement: "especes",
        })
        .returning();

      await db.insert(billets).values({
        commandeId: commande.id,
        code: "AAAA",
        statut: "invalide",
      });

      const resultat = await scannerBillet(db, evenementId, "AAAA");

      expect(resultat.type).toBe("invalide");
    });

    it("retourne 'inconnu' pour un code qui ne correspond à aucun billet", async () => {
      const evenementId = await creerEvenement();

      const resultat = await scannerBillet(db, evenementId, "INEXISTANT");

      expect(resultat).toEqual({ type: "inconnu" });
    });

    it("traite le billet d'un autre événement comme inconnu, sans le marquer scanné", async () => {
      const evenementId = await creerEvenement("Soirée A");
      const autreId = await creerEvenement("Soirée B");
      const [commande] = await db
        .insert(commandes)
        .values({
          evenementId: autreId,
          nom: "Sacha Lemoine",
          email: "sacha@etu-poly.fr",
          origine: "permanence",
          moyenPaiement: "especes",
        })
        .returning();
      await db
        .insert(billets)
        .values({ commandeId: commande.id, code: "AAAA" });

      const resultat = await scannerBillet(db, evenementId, "AAAA");

      expect(resultat).toEqual({ type: "inconnu" });
      const [billet] = await db.select().from(billets);
      expect(billet.statut).toBe("non_scanne");
    });

    it("ne modifie que le billet scanné, pas les autres billets de la commande", async () => {
      const evenementId = await creerEvenement();
      const [commande] = await db
        .insert(commandes)
        .values({
          evenementId,
          nom: "Sacha Lemoine",
          email: "sacha@etu-poly.fr",
          origine: "permanence",
          moyenPaiement: "especes",
        })
        .returning();

      await db.insert(billets).values([
        { commandeId: commande.id, code: "AAAA" },
        { commandeId: commande.id, code: "BBBB" },
      ]);

      await scannerBillet(db, evenementId, "AAAA");

      const [resultats] = await listerBillets(db, evenementId, {
        q: "",
        statut: "tous",
      });
      const a = resultats.billets.find((b) => b.code === "AAAA");
      const b = resultats.billets.find((b) => b.code === "BBBB");
      expect(a?.statut).toBe("scanne");
      expect(b?.statut).toBe("non_scanne");
      expect(b?.scanneA).toBeNull();
    });
  });

  describe("obtenirCommandeAvecBillets", () => {
    it("retourne la commande et ses billets triés par création", async () => {
      const evenementId = await creerEvenement();
      const [commande] = await db
        .insert(commandes)
        .values({
          evenementId,
          nom: "Sacha Lemoine",
          email: "sacha@etu-poly.fr",
          origine: "permanence",
          moyenPaiement: "especes",
        })
        .returning();

      const [billetA, billetB] = await db
        .insert(billets)
        .values([
          { commandeId: commande.id, code: "AAAA", ticketsBoisson: 1 },
          { commandeId: commande.id, code: "BBBB", ticketsBoisson: 0 },
        ])
        .returning();

      const resultat = await obtenirCommandeAvecBillets(db, commande.id);

      expect(resultat?.nom).toBe("Sacha Lemoine");
      expect(resultat?.billets.map((b) => b.id)).toEqual([
        billetA.id,
        billetB.id,
      ]);
      expect(resultat?.billets.map((b) => b.code)).toEqual(["AAAA", "BBBB"]);
    });

    it("retourne null si la commande n'existe pas", async () => {
      await creerEvenement();

      const resultat = await obtenirCommandeAvecBillets(db, randomUUID());

      expect(resultat).toBeNull();
    });
  });

  describe("obtenirStatsEvenement", () => {
    it("compte les billets vendus par origine, les entrées scannées et les tickets boisson, hors invalidés", async () => {
      const evenementId = await creerEvenement();
      const [commande] = await db
        .insert(commandes)
        .values({
          evenementId,
          nom: "Sacha Lemoine",
          email: "sacha@etu-poly.fr",
          origine: "permanence",
          moyenPaiement: "especes",
        })
        .returning();

      await db.insert(billets).values([
        {
          commandeId: commande.id,
          code: "AAAA",
          statut: "scanne",
          ticketsBoisson: 2,
        },
        {
          commandeId: commande.id,
          code: "BBBB",
          statut: "non_scanne",
          ticketsBoisson: 1,
        },
        {
          commandeId: commande.id,
          code: "CCCC",
          statut: "invalide",
          ticketsBoisson: 5,
        },
      ]);

      const [commandeHelloasso] = await db
        .insert(commandes)
        .values({
          evenementId,
          nom: "Alix Martin",
          email: "alix@etu-poly.fr",
          origine: "helloasso",
          moyenPaiement: "hello_asso",
          helloassoPaymentId: "hpid-stats",
        })
        .returning();
      await db.insert(billets).values({
        commandeId: commandeHelloasso.id,
        code: "DDDD",
        ticketsBoisson: 1,
      });

      await expect(obtenirStatsEvenement(db, evenementId)).resolves.toEqual({
        billetsVendus: 3,
        billetsInvalides: 1,
        billetsPermanence: 2,
        billetsHelloasso: 1,
        entreesScannees: 1,
        ticketsBoisson: 4,
        ticketsBoissonPermanence: 3,
      });
    });

    it("ne compte que les billets de l'événement demandé", async () => {
      const ancienId = await creerEvenement("Ancien");
      const autreId = await creerEvenement("Autre");
      const [commande] = await db
        .insert(commandes)
        .values({
          evenementId: ancienId,
          nom: "A",
          email: "a@b.fr",
          origine: "permanence",
          moyenPaiement: "especes",
        })
        .returning();
      await db
        .insert(billets)
        .values({ commandeId: commande.id, code: "OLD1" });

      await expect(obtenirStatsEvenement(db, autreId)).resolves.toMatchObject({
        billetsVendus: 0,
        ticketsBoisson: 0,
      });
      await expect(obtenirStatsEvenement(db, ancienId)).resolves.toMatchObject({
        billetsVendus: 1,
      });
    });
  });

  describe("obtenirStatsBillets", () => {
    it("compte le total et les billets scannés, indépendamment des filtres", async () => {
      const evenementId = await creerEvenement();
      const [commande] = await db
        .insert(commandes)
        .values({
          evenementId,
          nom: "Sacha Lemoine",
          email: "sacha@etu-poly.fr",
          origine: "permanence",
          moyenPaiement: "especes",
        })
        .returning();

      await db.insert(billets).values([
        { commandeId: commande.id, code: "AAAA", statut: "scanne" },
        { commandeId: commande.id, code: "BBBB", statut: "non_scanne" },
        { commandeId: commande.id, code: "CCCC", statut: "invalide" },
      ]);

      await expect(obtenirStatsBillets(db, evenementId)).resolves.toEqual({
        total: 3,
        scannes: 1,
      });
    });
  });
});
