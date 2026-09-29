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

  async function creerEvenementActif(): Promise<string> {
    const [evenement] = await db
      .insert(evenements)
      .values({
        nom: "Soirée de rentrée",
        date: "2026-09-30",
        heure: "20:00:00",
        lieu: "Hangar",
        motDePasseHash: await hashPassword("hangar2026"),
        actif: true,
      })
      .returning();
    return evenement.id;
  }

  describe("creerCommandePermanence", () => {
    it("crée une commande avec un billet par entrée demandée", async () => {
      await creerEvenementActif();

      const { commande, billets: nouveauxBillets } =
        await creerCommandePermanence(db, {
          nom: "Sacha Lemoine",
          email: "sacha@etu-poly.fr",
          billets: [{ ticketsBoisson: 2 }, { ticketsBoisson: 0 }],
        });

      expect(commande.origine).toBe("permanence");
      expect(nouveauxBillets).toHaveLength(2);
      expect(nouveauxBillets[0].statut).toBe("non_scanne");
      expect(nouveauxBillets[0].code).not.toBe(nouveauxBillets[1].code);
      expect(new Set(nouveauxBillets.map((b) => b.ticketsBoisson))).toEqual(
        new Set([2, 0]),
      );
    });

    it("refuse de créer une commande sans événement actif", async () => {
      await expect(
        creerCommandePermanence(db, {
          nom: "Sacha Lemoine",
          email: "sacha@etu-poly.fr",
          billets: [{ ticketsBoisson: 0 }],
        }),
      ).rejects.toThrow("Aucun événement actif.");
    });
  });

  describe("creerCommandeDepuisHelloAsso", () => {
    it("crée une commande HelloAsso avec un billet par entrée du paiement", async () => {
      await creerEvenementActif();

      const {
        commande,
        billets: nouveauxBillets,
        dejaTraitee,
      } = await creerCommandeDepuisHelloAsso(db, {
        nom: "Jean Dupont",
        email: "jean@etu-poly.fr",
        helloassoPaymentId: "hp-123",
        billets: [{ ticketsBoisson: 2 }],
      });

      expect(dejaTraitee).toBe(false);
      expect(commande.origine).toBe("helloasso");
      expect(commande.helloassoPaymentId).toBe("hp-123");
      expect(nouveauxBillets).toHaveLength(1);
      expect(nouveauxBillets[0].ticketsBoisson).toBe(2);
    });

    it("est idempotente : un même paiement rejoué ne crée pas de nouvelle commande", async () => {
      await creerEvenementActif();

      const premiere = await creerCommandeDepuisHelloAsso(db, {
        nom: "Jean Dupont",
        email: "jean@etu-poly.fr",
        helloassoPaymentId: "hp-123",
        billets: [{ ticketsBoisson: 2 }],
      });

      const rejeu = await creerCommandeDepuisHelloAsso(db, {
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

    it("refuse de créer une commande sans événement actif", async () => {
      await expect(
        creerCommandeDepuisHelloAsso(db, {
          nom: "Jean Dupont",
          email: "jean@etu-poly.fr",
          helloassoPaymentId: "hp-123",
          billets: [{ ticketsBoisson: 0 }],
        }),
      ).rejects.toThrow("Aucun événement actif.");
    });
  });

  describe("listerBillets", () => {
    it("groupe les billets par commande et filtre côté serveur par recherche et statut", async () => {
      const evenementId = await creerEvenementActif();

      const [commandeA] = await db
        .insert(commandes)
        .values({
          evenementId,
          nom: "Sacha Lemoine",
          email: "sacha@etu-poly.fr",
          origine: "permanence",
        })
        .returning();

      const [commandeB] = await db
        .insert(commandes)
        .values({
          evenementId,
          nom: "Léa Dupont",
          email: "lea@etu-poly.fr",
          origine: "helloasso",
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

      const tous = await listerBillets(db, { q: "", statut: "tous" });
      expect(tous).toHaveLength(2);
      const sacha = tous.find((c) => c.commandeId === commandeA.id);
      expect(sacha?.billets).toHaveLength(2);

      const parNom = await listerBillets(db, { q: "léa", statut: "tous" });
      expect(parNom).toHaveLength(1);
      expect(parNom[0].nom).toBe("Léa Dupont");

      const parStatut = await listerBillets(db, {
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
      const evenementId = await creerEvenementActif();
      const [commande] = await db
        .insert(commandes)
        .values({
          evenementId,
          nom: "Sacha Lemoine",
          email: "sacha@etu-poly.fr",
          origine: "permanence",
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

      const [resultats] = await listerBillets(db, { q: "", statut: "tous" });
      const a = resultats.billets.find((b) => b.id === billetA.id);
      const b = resultats.billets.find((b) => b.id === billetB.id);
      expect(a?.statut).toBe("invalide");
      expect(b?.statut).toBe("non_scanne");

      await reactiverBillet(db, billetA.id);
      const [apresReactivation] = await listerBillets(db, {
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
      const evenementId = await creerEvenementActif();
      const [commande] = await db
        .insert(commandes)
        .values({
          evenementId,
          nom: "Sacha Lemoine",
          email: "sacha@etu-poly.fr",
          origine: "permanence",
        })
        .returning();

      await db.insert(billets).values({
        commandeId: commande.id,
        code: "AAAA",
        ticketsBoisson: 2,
      });

      const resultat = await scannerBillet(db, "AAAA");

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
      const evenementId = await creerEvenementActif();
      const [commande] = await db
        .insert(commandes)
        .values({
          evenementId,
          nom: "Sacha Lemoine",
          email: "sacha@etu-poly.fr",
          origine: "permanence",
        })
        .returning();

      await db.insert(billets).values({
        commandeId: commande.id,
        code: "AAAA",
      });

      const [a, b] = await Promise.all([
        scannerBillet(db, "AAAA"),
        scannerBillet(db, "AAAA"),
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
      const evenementId = await creerEvenementActif();
      const [commande] = await db
        .insert(commandes)
        .values({
          evenementId,
          nom: "Sacha Lemoine",
          email: "sacha@etu-poly.fr",
          origine: "permanence",
        })
        .returning();

      const premierScan = new Date("2026-09-30T20:00:00Z");
      await db.insert(billets).values({
        commandeId: commande.id,
        code: "AAAA",
        statut: "scanne",
        scanneA: premierScan,
      });

      const resultat = await scannerBillet(db, "AAAA");

      expect(resultat.type).toBe("deja_scanne");
      if (resultat.type !== "deja_scanne") throw new Error("type inattendu");
      expect(resultat.billet.scanneA).toBe(formatHeure(premierScan));
    });

    it("retourne 'invalide' pour un billet invalidé", async () => {
      const evenementId = await creerEvenementActif();
      const [commande] = await db
        .insert(commandes)
        .values({
          evenementId,
          nom: "Sacha Lemoine",
          email: "sacha@etu-poly.fr",
          origine: "permanence",
        })
        .returning();

      await db.insert(billets).values({
        commandeId: commande.id,
        code: "AAAA",
        statut: "invalide",
      });

      const resultat = await scannerBillet(db, "AAAA");

      expect(resultat.type).toBe("invalide");
    });

    it("retourne 'inconnu' pour un code qui ne correspond à aucun billet", async () => {
      await creerEvenementActif();

      const resultat = await scannerBillet(db, "INEXISTANT");

      expect(resultat).toEqual({ type: "inconnu" });
    });

    it("ne modifie que le billet scanné, pas les autres billets de la commande", async () => {
      const evenementId = await creerEvenementActif();
      const [commande] = await db
        .insert(commandes)
        .values({
          evenementId,
          nom: "Sacha Lemoine",
          email: "sacha@etu-poly.fr",
          origine: "permanence",
        })
        .returning();

      await db.insert(billets).values([
        { commandeId: commande.id, code: "AAAA" },
        { commandeId: commande.id, code: "BBBB" },
      ]);

      await scannerBillet(db, "AAAA");

      const [resultats] = await listerBillets(db, { q: "", statut: "tous" });
      const a = resultats.billets.find((b) => b.code === "AAAA");
      const b = resultats.billets.find((b) => b.code === "BBBB");
      expect(a?.statut).toBe("scanne");
      expect(b?.statut).toBe("non_scanne");
      expect(b?.scanneA).toBeNull();
    });
  });

  describe("obtenirCommandeAvecBillets", () => {
    it("retourne la commande et ses billets triés par création", async () => {
      const evenementId = await creerEvenementActif();
      const [commande] = await db
        .insert(commandes)
        .values({
          evenementId,
          nom: "Sacha Lemoine",
          email: "sacha@etu-poly.fr",
          origine: "permanence",
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
      await creerEvenementActif();

      const resultat = await obtenirCommandeAvecBillets(db, randomUUID());

      expect(resultat).toBeNull();
    });
  });

  describe("obtenirStatsEvenement", () => {
    it("compte billets émis, entrées vendues (hors invalidés), scannées et tickets boisson dus", async () => {
      const evenementId = await creerEvenementActif();
      const [commande] = await db
        .insert(commandes)
        .values({
          evenementId,
          nom: "Sacha Lemoine",
          email: "sacha@etu-poly.fr",
          origine: "permanence",
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

      await expect(obtenirStatsEvenement(db)).resolves.toEqual({
        billets: 3,
        entreesVendues: 2,
        entreesScannees: 1,
        ticketsBoissonDus: 3,
      });
    });

    it("ignore les billets des événements passés", async () => {
      const ancienId = await creerEvenementActif();
      const [commande] = await db
        .insert(commandes)
        .values({
          evenementId: ancienId,
          nom: "A",
          email: "a@b.fr",
          origine: "permanence",
        })
        .returning();
      await db
        .insert(billets)
        .values({ commandeId: commande.id, code: "OLD1" });
      await db.update(evenements).set({ actif: false });
      await db.insert(evenements).values({
        nom: "Nouveau",
        date: "2026-10-01",
        heure: "20:00:00",
        lieu: "Ailleurs",
        motDePasseHash: "x",
        actif: true,
      });

      await expect(obtenirStatsEvenement(db)).resolves.toEqual({
        billets: 0,
        entreesVendues: 0,
        entreesScannees: 0,
        ticketsBoissonDus: 0,
      });
    });

    it("retourne des compteurs à zéro sans événement actif", async () => {
      await expect(obtenirStatsEvenement(db)).resolves.toEqual({
        billets: 0,
        entreesVendues: 0,
        entreesScannees: 0,
        ticketsBoissonDus: 0,
      });
    });
  });

  describe("obtenirStatsBillets", () => {
    it("compte le total et les billets scannés, indépendamment des filtres", async () => {
      const evenementId = await creerEvenementActif();
      const [commande] = await db
        .insert(commandes)
        .values({
          evenementId,
          nom: "Sacha Lemoine",
          email: "sacha@etu-poly.fr",
          origine: "permanence",
        })
        .returning();

      await db.insert(billets).values([
        { commandeId: commande.id, code: "AAAA", statut: "scanne" },
        { commandeId: commande.id, code: "BBBB", statut: "non_scanne" },
        { commandeId: commande.id, code: "CCCC", statut: "invalide" },
      ]);

      await expect(obtenirStatsBillets(db)).resolves.toEqual({
        total: 3,
        scannes: 1,
      });
    });

    it("retourne des compteurs à zéro s'il n'y a pas d'événement actif", async () => {
      await expect(obtenirStatsBillets(db)).resolves.toEqual({
        total: 0,
        scannes: 0,
      });
    });
  });
});
