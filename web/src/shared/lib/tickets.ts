import type { MoyenPaiement, Origine, Statut } from "./types";

/** « Prénom Nom », pour un affichage sur une ligne. */
export function nomComplet(prenom: string, nom: string): string {
  return `${prenom} ${nom}`.trim();
}

/** Minuscules sans accents, pour chercher « lea » et trouver « Léa ». */
export function normaliser(texte: string): string {
  return texte
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .trim();
}

export const ORIGINE_LABEL: Record<Origine, string> = {
  helloasso: "HelloAsso",
  permanence: "Permanence",
  sur_place: "Sur place",
};

export const MOYEN_PAIEMENT_LABEL: Record<MoyenPaiement, string> = {
  virement: "Virement",
  hello_asso: "HelloAsso",
  especes: "Espèces",
  sumup: "SumUp",
  autre: "Autre",
};

export const STATUT_LABEL: Record<Statut, string> = {
  non_scanne: "Pas encore scanné",
  scanne: "Scanné",
  invalide: "Invalidé",
};

export const STATUT_BADGE_VARIANT: Record<Statut, "neutral" | "good" | "bad"> =
  {
    non_scanne: "neutral",
    scanne: "good",
    invalide: "bad",
  };

export const STATUT_TEXT_CLASS: Record<Statut, string> = {
  non_scanne: "text-muted",
  scanne: "text-good",
  invalide: "text-bad",
};

export function nowLabel(): string {
  return formatHeure(new Date());
}

export function formatHeure(date: Date): string {
  const h = date.getHours().toString().padStart(2, "0");
  const m = date.getMinutes().toString().padStart(2, "0");
  return `${h}h${m}`;
}

export function genTicketCode(): string {
  return Math.random().toString(36).slice(2, 6).toUpperCase();
}

export function genTicketId(): string {
  return `t_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
}
