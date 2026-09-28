import {
  PDFDocument,
  type PDFFont,
  type PDFPage,
  rgb,
  StandardFonts,
} from "pdf-lib";
import QRCode from "qrcode";
import type { BilletListe } from "@/shared/lib/types";

const PAGE_WIDTH = 420;
const PAGE_HEIGHT = 594;
const QR_SIZE = 260;

export interface EvenementInfoPdf {
  nom: string;
  date: string;
  heure: string;
  lieu: string;
}

/**
 * Génère un PDF téléchargeable pour une commande : une page par billet,
 * avec le même QR que la page web (`polyqr:<code>`) pour scanner identique.
 */
export async function genererPdfCommande(
  commande: { nom: string; billets: BilletListe[] },
  evenement: EvenementInfoPdf,
): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create();
  const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  for (const billet of commande.billets) {
    const page = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
    await dessinerPageBillet(
      pdfDoc,
      page,
      { fontRegular, fontBold },
      {
        nom: commande.nom,
        billet,
        evenement,
      },
    );
  }

  return pdfDoc.save();
}

async function dessinerPageBillet(
  pdfDoc: PDFDocument,
  page: PDFPage,
  fonts: { fontRegular: PDFFont; fontBold: PDFFont },
  data: { nom: string; billet: BilletListe; evenement: EvenementInfoPdf },
): Promise<void> {
  const { fontRegular, fontBold } = fonts;
  const { nom, billet, evenement } = data;

  const qrPng = await QRCode.toBuffer(`polyqr:${billet.code}`, {
    type: "png",
    errorCorrectionLevel: "M",
    margin: 1,
    width: QR_SIZE,
    color: { dark: "#16161F", light: "#FFFFFF" },
  });
  const qrImage = await pdfDoc.embedPng(qrPng);

  const titreTaille = 20;
  page.drawText(evenement.nom, {
    x:
      (PAGE_WIDTH - fontBold.widthOfTextAtSize(evenement.nom, titreTaille)) / 2,
    y: PAGE_HEIGHT - 70,
    size: titreTaille,
    font: fontBold,
    color: rgb(0.08, 0.08, 0.12),
  });

  const qrX = (PAGE_WIDTH - QR_SIZE) / 2;
  const qrY = PAGE_HEIGHT / 2 - QR_SIZE / 2;
  page.drawImage(qrImage, { x: qrX, y: qrY, width: QR_SIZE, height: QR_SIZE });

  const nomTaille = 16;
  page.drawText(nom, {
    x: (PAGE_WIDTH - fontBold.widthOfTextAtSize(nom, nomTaille)) / 2,
    y: qrY - 30,
    size: nomTaille,
    font: fontBold,
    color: rgb(0.08, 0.08, 0.12),
  });

  const codeLabel = `Billet ${billet.code}`;
  const codeTaille = 12;
  page.drawText(codeLabel, {
    x: (PAGE_WIDTH - fontRegular.widthOfTextAtSize(codeLabel, codeTaille)) / 2,
    y: qrY - 50,
    size: codeTaille,
    font: fontRegular,
    color: rgb(0.34, 0.33, 0.42),
  });

  const pied = `${evenement.nom} · ${evenement.date} · ${evenement.heure} · ${evenement.lieu}`;
  const piedTaille = 9;
  page.drawText(pied, {
    x: (PAGE_WIDTH - fontRegular.widthOfTextAtSize(pied, piedTaille)) / 2,
    y: 40,
    size: piedTaille,
    font: fontRegular,
    color: rgb(0.5, 0.5, 0.55),
  });
}
