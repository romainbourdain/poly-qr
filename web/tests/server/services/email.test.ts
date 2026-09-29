import { PDFDocument } from "pdf-lib";
import { describe, expect, it } from "vitest";
import type { EmailAEnvoyer, EmailSender } from "@/server/services/email";
import { envoyerEmailCommande } from "@/server/services/email";
import type { BilletListe } from "@/shared/lib/types";

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
    nom: "Lemoine",
    prenom: "Sacha",
    ticketsBoisson: 0,
    statut: "non_scanne",
    scanneA: null,
  };
}

class FakeSender implements EmailSender {
  envoyes: EmailAEnvoyer[] = [];

  async envoyer(email: EmailAEnvoyer): Promise<void> {
    this.envoyes.push(email);
  }
}

class SenderQuiEchoue implements EmailSender {
  async envoyer(): Promise<void> {
    throw new Error("SMTP indisponible");
  }
}

describe("envoyerEmailCommande", () => {
  it("envoie un email au bon destinataire avec le lien vers la page billet", async () => {
    const sender = new FakeSender();

    await envoyerEmailCommande(
      sender,
      {
        commandeId: "commande-1",
        nom: "Sacha Lemoine",
        email: "sacha.lemoine@etu-poly.fr",
        billets: [billet("AAAA")],
      },
      EVENEMENT,
      "https://polyqr.exemple.fr",
    );

    expect(sender.envoyes).toHaveLength(1);
    const [email] = sender.envoyes;
    expect(email.to).toBe("sacha.lemoine@etu-poly.fr");
    expect(email.html).toContain(
      "https://polyqr.exemple.fr/billet?commande=commande-1",
    );
  });

  it("joint un QR inline par billet et le PDF de la commande", async () => {
    const sender = new FakeSender();

    await envoyerEmailCommande(
      sender,
      {
        commandeId: "commande-2",
        nom: "Léa Dupont",
        email: "lea.dupont@etu-poly.fr",
        billets: [billet("AAAA"), billet("BBBB")],
      },
      EVENEMENT,
      "https://polyqr.exemple.fr",
    );

    const [email] = sender.envoyes;
    const qrAttachments = email.attachments.filter(
      (piece) => piece.contentType === "image/png",
    );
    expect(qrAttachments).toHaveLength(2);
    expect(qrAttachments.every((piece) => piece.cid)).toBe(true);

    const pdfAttachment = email.attachments.find(
      (piece) => piece.contentType === "application/pdf",
    );
    expect(pdfAttachment).toBeDefined();
    const pdf = await PDFDocument.load(
      pdfAttachment?.content ?? new Uint8Array(),
    );
    expect(pdf.getPageCount()).toBe(2);
  });

  it("propage l'échec d'envoi plutôt que de l'avaler silencieusement", async () => {
    const sender = new SenderQuiEchoue();

    await expect(
      envoyerEmailCommande(
        sender,
        {
          commandeId: "commande-3",
          nom: "Léa Dupont",
          email: "lea.dupont@etu-poly.fr",
          billets: [billet("AAAA")],
        },
        EVENEMENT,
        "https://polyqr.exemple.fr",
      ),
    ).rejects.toThrow("SMTP indisponible");
  });
});
