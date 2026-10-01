/** Séparateur attendu par l'Excel français (la virgule y sert de décimale). */
const SEPARATEUR = ";";

/** BOM UTF-8 : sans lui Excel lit un CSV comme de l'ANSI et abîme les accents. */
const BOM = "﻿";

export type CelluleCsv = string | number;

/**
 * Une cellule texte qui commence par = + - ou @ serait interprétée comme une
 * formule par Excel (injection) : on la préfixe d'une apostrophe.
 */
function neutraliserFormule(texte: string): string {
  return /^[=+\-@\t\r]/.test(texte) ? `'${texte}` : texte;
}

function versCellule(valeur: CelluleCsv): string {
  const texte =
    typeof valeur === "number"
      ? String(valeur).replace(".", ",")
      : neutraliserFormule(valeur);
  return /[";\r\n]/.test(texte) ? `"${texte.replace(/"/g, '""')}"` : texte;
}

/** Sérialise des lignes en CSV pour Excel (séparateur `;`, BOM UTF-8, fins de ligne CRLF). */
export function versCsv(lignes: CelluleCsv[][]): string {
  return (
    BOM +
    lignes
      .map((ligne) => ligne.map(versCellule).join(SEPARATEUR))
      .join("\r\n") +
    "\r\n"
  );
}
