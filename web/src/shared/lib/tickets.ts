import type { Statut } from "./types";

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
  const d = new Date();
  const h = d.getHours().toString().padStart(2, "0");
  const m = d.getMinutes().toString().padStart(2, "0");
  return `${h}h${m}`;
}

export function genTicketCode(): string {
  return Math.random().toString(36).slice(2, 6).toUpperCase();
}

export function genTicketId(): string {
  return `t_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
}
