import { PDFDocument, PDFName } from "pdf-lib";
import { describe, expect, it } from "vitest";
import type { BilletListe } from "@/shared/lib/types";
import { genererPdfCommande } from "./pdf";

const EVENEMENT = {
  nom: "Soirée d'hiver",
  date: "Samedi 14 mars",
  heure: "22h00",
  lieu: "Le Hangar",
};

function billet(code: string): BilletListe {
  return {
    id: code,
    code,
    ticketsBoisson: 0,
    statut: "non_scanne",
    scanneA: null,
  };
}

describe("genererPdfCommande", () => {
  it("génère une page par billet, chacune avec une image (le QR)", async () => {
    const octets = await genererPdfCommande(
      { nom: "Sacha Lemoine", billets: [billet("AAAA"), billet("BBBB")] },
      EVENEMENT,
    );

    const pdf = await PDFDocument.load(octets);
    expect(pdf.getPageCount()).toBe(2);

    for (const page of pdf.getPages()) {
      const xObjects = page.node.Resources()?.lookup(PDFName.of("XObject"));
      expect(xObjects).toBeDefined();
    }
  });

  it("génère une seule page pour une commande à un billet", async () => {
    const octets = await genererPdfCommande(
      { nom: "Léa Dupont", billets: [billet("CCCC")] },
      EVENEMENT,
    );

    const pdf = await PDFDocument.load(octets);
    expect(pdf.getPageCount()).toBe(1);
  });
});
