import {
  PDFDocument,
  type PDFFont,
  type PDFPage,
  rgb,
  StandardFonts,
} from "pdf-lib";
import { genererQrPng } from "@/server/services/qr";
import type { BilletListe } from "@/shared/lib/types";

// A4 portrait, une page par billet.
const PAGE_WIDTH = 595;
const PAGE_HEIGHT = 842;
const MARGIN = 56;
const CONTENT_WIDTH = PAGE_WIDTH - 2 * MARGIN;
const QR_SIZE = 240;

const INK = rgb(0.08, 0.08, 0.12);
const MUTED = rgb(0.4, 0.39, 0.47);
const LINE = rgb(0.85, 0.84, 0.89);

export interface EvenementInfoPdf {
  nom: string;
  date: string;
  heure: string;
  lieu: string;
}

interface Fonts {
  regular: PDFFont;
  bold: PDFFont;
  mono: PDFFont;
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
  const fonts: Fonts = {
    regular: await pdfDoc.embedFont(StandardFonts.Helvetica),
    bold: await pdfDoc.embedFont(StandardFonts.HelveticaBold),
    mono: await pdfDoc.embedFont(StandardFonts.CourierBold),
  };

  for (const [index, billet] of commande.billets.entries()) {
    const page = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
    await dessinerPageBillet(pdfDoc, page, fonts, {
      nom: commande.nom,
      billet,
      evenement,
      rang: { index: index + 1, total: commande.billets.length },
    });
  }

  return pdfDoc.save();
}

/** Coupe un texte en lignes qui tiennent dans `largeurMax`. */
function decouper(
  texte: string,
  font: PDFFont,
  taille: number,
  largeurMax: number,
): string[] {
  const lignes: string[] = [];
  let courante = "";
  for (const mot of texte.split(/\s+/)) {
    const essai = courante ? `${courante} ${mot}` : mot;
    if (courante && font.widthOfTextAtSize(essai, taille) > largeurMax) {
      lignes.push(courante);
      courante = mot;
    } else {
      courante = essai;
    }
  }
  if (courante) lignes.push(courante);
  return lignes;
}

async function dessinerPageBillet(
  pdfDoc: PDFDocument,
  page: PDFPage,
  { regular, bold, mono }: Fonts,
  data: {
    nom: string;
    billet: BilletListe;
    evenement: EvenementInfoPdf;
    rang: { index: number; total: number };
  },
): Promise<void> {
  const { nom, billet, evenement, rang } = data;

  // pdf-lib place le texte par sa ligne de base, depuis le bas de page :
  // on raisonne en distance depuis le haut.
  const texte = (
    contenu: string,
    top: number,
    opts: {
      x?: number;
      font?: PDFFont;
      size?: number;
      color?: ReturnType<typeof rgb>;
      align?: "left" | "center" | "right";
    } = {},
  ) => {
    const font = opts.font ?? regular;
    const size = opts.size ?? 12;
    const largeur = font.widthOfTextAtSize(contenu, size);
    const x =
      opts.align === "center"
        ? (PAGE_WIDTH - largeur) / 2
        : opts.align === "right"
          ? PAGE_WIDTH - MARGIN - largeur
          : (opts.x ?? MARGIN);
    page.drawText(contenu, {
      x,
      y: PAGE_HEIGHT - top,
      font,
      size,
      color: opts.color ?? INK,
    });
  };
  const trait = (top: number) =>
    page.drawLine({
      start: { x: MARGIN, y: PAGE_HEIGHT - top },
      end: { x: PAGE_WIDTH - MARGIN, y: PAGE_HEIGHT - top },
      thickness: 1,
      color: LINE,
    });

  // En-tête : émetteur et rang du billet dans la commande.
  texte("BDE TPS", 64, { font: bold, size: 11 });
  if (rang.total > 1) {
    texte(`Billet ${rang.index} / ${rang.total}`, 64, {
      size: 11,
      color: MUTED,
      align: "right",
    });
  }
  trait(80);

  // Événement.
  let top = 128;
  for (const ligne of decouper(evenement.nom, bold, 28, CONTENT_WIDTH)) {
    texte(ligne, top, { font: bold, size: 28 });
    top += 34;
  }
  texte(`${evenement.date} · ${evenement.heure} · ${evenement.lieu}`, top - 6, {
    size: 13,
    color: MUTED,
  });

  // QR et code.
  top += 40;
  const qrImage = await pdfDoc.embedPng(await genererQrPng(billet.code, 720));
  page.drawImage(qrImage, {
    x: (PAGE_WIDTH - QR_SIZE) / 2,
    y: PAGE_HEIGHT - top - QR_SIZE,
    width: QR_SIZE,
    height: QR_SIZE,
  });
  top += QR_SIZE + 28;
  texte(billet.code, top, { font: mono, size: 14, align: "center" });

  // Titulaire et tickets boisson.
  top += 40;
  trait(top);
  top += 30;
  const colDroite = MARGIN + CONTENT_WIDTH * 0.62;
  texte("TITULAIRE", top, { font: bold, size: 9, color: MUTED });
  texte("TICKETS BOISSON", top, {
    x: colDroite,
    font: bold,
    size: 9,
    color: MUTED,
  });
  top += 22;
  texte(String(billet.ticketsBoisson), top, {
    x: colDroite,
    font: bold,
    size: 16,
  });
  for (const ligne of decouper(nom, bold, 16, colDroite - MARGIN - 16)) {
    texte(ligne, top, { font: bold, size: 16 });
    top += 20;
  }
}
