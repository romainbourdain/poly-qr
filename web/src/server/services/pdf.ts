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
const MARGIN = 48;
const CONTENT_WIDTH = PAGE_WIDTH - 2 * MARGIN;
const QR_SIZE = 200;

const ACCENT = rgb(0.424, 0.294, 0.941);
const INK = rgb(0.08, 0.08, 0.12);
const MUTED = rgb(0.34, 0.33, 0.42);
const LINE = rgb(0.78, 0.77, 0.84);
const WHITE = rgb(1, 1, 1);

export interface EvenementInfoPdf {
  nom: string;
  date: string;
  heure: string;
  lieu: string;
}

interface Fonts {
  regular: PDFFont;
  bold: PDFFont;
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
  { regular, bold }: Fonts,
  data: {
    nom: string;
    billet: BilletListe;
    evenement: EvenementInfoPdf;
    rang: { index: number; total: number };
  },
): Promise<void> {
  const { nom, billet, evenement, rang } = data;
  // Les coordonnées pdf-lib partent du bas ; on raisonne depuis le haut de page.
  const y = (top: number) => PAGE_HEIGHT - top;

  const texte = (
    contenu: string,
    x: number,
    top: number,
    opts: {
      font?: PDFFont;
      size?: number;
      color?: ReturnType<typeof rgb>;
    } = {},
  ) =>
    page.drawText(contenu, {
      x,
      y: y(top),
      font: opts.font ?? regular,
      size: opts.size ?? 12,
      color: opts.color ?? INK,
    });

  // Bandeau « Mon billet »
  page.drawRectangle({
    x: MARGIN,
    y: y(40 + 44),
    width: CONTENT_WIDTH,
    height: 44,
    color: ACCENT,
  });
  const titre = "Mon billet";
  texte(titre, (PAGE_WIDTH - bold.widthOfTextAtSize(titre, 18)) / 2, 40 + 28, {
    font: bold,
    size: 18,
    color: WHITE,
  });
  texte("BDE TPS", MARGIN + 14, 40 + 26, {
    font: bold,
    size: 10,
    color: WHITE,
  });
  const rangLabel = `${rang.index} / ${rang.total}`;
  texte(
    rangLabel,
    PAGE_WIDTH - MARGIN - 14 - bold.widthOfTextAtSize(rangLabel, 10),
    40 + 26,
    { font: bold, size: 10, color: WHITE },
  );

  // QR
  const qrImage = await pdfDoc.embedPng(await genererQrPng(billet.code, 600));
  page.drawImage(qrImage, {
    x: (PAGE_WIDTH - QR_SIZE) / 2,
    y: y(112 + QR_SIZE),
    width: QR_SIZE,
    height: QR_SIZE,
  });

  // Date de l'événement
  let top = 112 + QR_SIZE + 44;
  texte(evenement.date.toUpperCase(), MARGIN, top, { font: bold, size: 22 });

  // Chronologie : heure · événement, puis lieu (façon départ / arrivée)
  top += 34;
  const colHeure = MARGIN;
  const colPoint = MARGIN + 74;
  const colTexte = MARGIN + 100;
  const largeurTexte = 250;
  const nomLignes = decouper(evenement.nom, bold, 15, largeurTexte);
  const lieuLignes = decouper(evenement.lieu, bold, 15, largeurTexte);

  const pointHaut = top - 5;
  texte(evenement.heure, colHeure, top, { font: bold, size: 15 });
  for (const [i, ligne] of nomLignes.entries()) {
    texte(ligne, colTexte, top - i * 18, { font: bold, size: 15 });
  }
  texte("BDE TPS", colTexte, top + 15 + (nomLignes.length - 1) * 18, {
    size: 10,
    color: MUTED,
  });

  const topLieu = top + 42 + (nomLignes.length - 1) * 18 + 22;
  for (const [i, ligne] of lieuLignes.entries()) {
    texte(ligne, colTexte, topLieu + i * 18, { font: bold, size: 15 });
  }
  const pointBas = topLieu - 5;
  page.drawLine({
    start: { x: colPoint, y: y(pointHaut) },
    end: { x: colPoint, y: y(pointBas) },
    thickness: 1.5,
    color: INK,
  });
  for (const centre of [pointHaut, pointBas]) {
    page.drawCircle({
      x: colPoint,
      y: y(centre),
      size: 5.5,
      color: ACCENT,
      borderColor: INK,
      borderWidth: 1,
    });
  }

  // Tickets boisson (à droite, comme « Voiture / Place »)
  const colDroite = PAGE_WIDTH - MARGIN - 110;
  texte(String(billet.ticketsBoisson), colDroite, topLieu, {
    font: bold,
    size: 26,
    color: ACCENT,
  });
  texte(
    `ticket${billet.ticketsBoisson > 1 ? "s" : ""} boisson`,
    colDroite + 8 + bold.widthOfTextAtSize(String(billet.ticketsBoisson), 26),
    topLieu - 2,
    { size: 11 },
  );

  // Perforation
  top = topLieu + lieuLignes.length * 18 + 22;
  page.drawLine({
    start: { x: MARGIN, y: y(top) },
    end: { x: PAGE_WIDTH - MARGIN, y: y(top) },
    thickness: 1,
    color: LINE,
    dashArray: [4, 4],
  });

  // Titulaire
  top += 34;
  texte("Billet : ", MARGIN, top, { size: 14 });
  texte(billet.code, MARGIN + regular.widthOfTextAtSize("Billet : ", 14), top, {
    font: bold,
    size: 18,
    color: ACCENT,
  });
  top += 24;
  texte("Nom : ", MARGIN, top, { size: 14 });
  const nomX = MARGIN + regular.widthOfTextAtSize("Nom : ", 14);
  for (const [i, ligne] of decouper(
    nom,
    bold,
    14,
    CONTENT_WIDTH - 60,
  ).entries()) {
    texte(ligne, i === 0 ? nomX : MARGIN, top + i * 18, {
      font: bold,
      size: 14,
    });
  }
  top += 24 + (decouper(nom, bold, 14, CONTENT_WIDTH - 60).length - 1) * 18;
  texte(`Billet ${rang.index} sur ${rang.total} de la commande`, MARGIN, top, {
    size: 10,
    color: MUTED,
  });

  // Check-list « Prêts ? Entrez ! »
  top += 44;
  texte("PRÊTS ? ENTREZ !", MARGIN, top, {
    font: bold,
    size: 15,
    color: ACCENT,
  });
  const consignes = [
    "Je présente ce QR code à l'entrée, sur mon téléphone ou imprimé.",
    "Je règle la luminosité de mon écran au maximum avant de le présenter.",
  ];
  if (billet.ticketsBoisson > 0) {
    consignes.push(
      `Je récupère mes ${billet.ticketsBoisson} ticket${billet.ticketsBoisson > 1 ? "s" : ""} boisson à l'entrée, lors du scan.`,
    );
  }
  top += 14;
  for (const consigne of consignes) {
    const lignes = decouper(consigne, regular, 11, CONTENT_WIDTH - 36);
    page.drawRectangle({
      x: MARGIN,
      y: y(top + 16),
      width: 16,
      height: 16,
      borderColor: INK,
      borderWidth: 1.2,
    });
    for (const [i, ligne] of lignes.entries()) {
      texte(ligne, MARGIN + 28, top + 12 + i * 14, { size: 11 });
    }
    top += 16 + Math.max(lignes.length, 1) * 14 + 8;
  }

  // Pied de page
  page.drawRectangle({
    x: 0,
    y: 0,
    width: PAGE_WIDTH,
    height: 36,
    color: ACCENT,
  });
  const pied = `BDE TPS · ${evenement.nom} · ${evenement.date} · ${evenement.heure} · ${evenement.lieu}`;
  texte(
    pied,
    Math.max(MARGIN, (PAGE_WIDTH - regular.widthOfTextAtSize(pied, 9)) / 2),
    PAGE_HEIGHT - 14,
    { size: 9, color: WHITE },
  );
}
