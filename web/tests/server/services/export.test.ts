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
  exporterCommandesCsv,
  nomFichierExport,
} from "@/server/services/export";
import {
  ajouterTicketsBoisson,
  creerCommandePermanence,
  creerCommandeSurPlace,
  invaliderBillet,
} from "@/server/services/tickets";

describe("export des commandes", () => {
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

  async function creerEvenement(): Promise<string> {
    const [evenement] = await db
      .insert(evenements)
      .values({
        nom: "Soirée d'hiver",
        date: "2030-03-14",
        heure: "22:00:00",
        lieu: "Hangar",
        motDePasseHash: "hash",
        prixBilletCentimes: 800,
        prixBilletCotisantCentimes: 600,
        prixBilletSurPlaceCentimes: 1000,
        prixBilletSurPlaceCotisantCentimes: 800,
        prixTicketBoissonCentimes: 200,
      })
      .returning();
    return evenement.id;
  }

  /** Lignes de données (sans l'en-tête) découpées en cellules. */
  function lignes(csv: string): string[][] {
    return csv
      .replace("﻿", "")
      .trim()
      .split("\r\n")
      .slice(1)
      .map((l) => l.split(";"));
  }

  it("calcule une ligne par commande aux prix du canal, hors billets invalidés", async () => {
    const evenementId = await creerEvenement();
    const permanence = await creerCommandePermanence(db, evenementId, {
      email: "sacha@etu-poly.fr",
      moyenPaiement: "virement",
      billets: [
        { nom: "Lemoine", prenom: "Sacha", cotisant: true, ticketsBoisson: 2 },
        { nom: "Petit", prenom: "Robin", cotisant: false, ticketsBoisson: 1 },
      ],
    });
    await invaliderBillet(db, permanence.billets[1].id);
    await creerCommandeSurPlace(db, evenementId, {
      moyenPaiement: "especes",
      billets: [
        { nom: "Dupont", prenom: "Léa", cotisant: false, ticketsBoisson: 0 },
      ],
    });
    await ajouterTicketsBoisson(db, {
      billetId: permanence.billets[0].id,
      quantite: 3,
      moyenPaiement: "especes",
    });

    const resultat = await exporterCommandesCsv(db, evenementId);

    expect(resultat?.nomFichier).toBe("soiree-d-hiver-2030-03-14.csv");
    const rows = lignes(resultat?.csv ?? "");
    expect(rows).toHaveLength(3);
    // Permanence : 1 billet valide cotisant (6 €) + 2 tickets (4 €) ; le billet
    // invalidé et son ticket sont exclus et comptés à part.
    expect(rows[0].slice(2)).toEqual([
      "Permanence",
      "Virement",
      "Sacha Lemoine",
      "sacha@etu-poly.fr",
      "1",
      "1",
      "2",
      "1",
      "10",
    ]);
    // Sur place : prix sur place (10 €).
    expect(rows[1].slice(2)).toEqual([
      "Sur place",
      "Espèces",
      "Léa Dupont",
      "",
      "1",
      "0",
      "0",
      "0",
      "10",
    ]);
    // Achat de tickets seul : 3 × 2 € sans billet.
    expect(rows[2].slice(2)).toEqual([
      "Permanence",
      "Espèces",
      "Sacha Lemoine",
      "",
      "0",
      "0",
      "3",
      "0",
      "6",
    ]);
  });

  it("renvoie null pour un événement inconnu", async () => {
    await expect(
      exporterCommandesCsv(db, "00000000-0000-4000-8000-000000000000"),
    ).resolves.toBeNull();
  });
});

describe("nomFichierExport", () => {
  it("retire accents et ponctuation", () => {
    expect(
      nomFichierExport({ nom: "Soirée d'hiver !", dateIso: "2030-03-14" }),
    ).toBe("soiree-d-hiver-2030-03-14.csv");
  });

  it("garde un nom par défaut si rien d'exploitable", () => {
    expect(nomFichierExport({ nom: "???", dateIso: "2030-03-14" })).toBe(
      "evenement-2030-03-14.csv",
    );
  });
});
