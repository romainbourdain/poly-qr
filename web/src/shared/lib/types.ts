export type Origine = "helloasso" | "permanence";
export type Statut = "non_scanne" | "scanne" | "invalide";

export interface Ticket {
  id: string;
  code: string;
  nom: string;
  email: string;
  origine: Origine;
  entrees: number;
  ticketsBoisson: number;
  statut: Statut;
  scanneA: string | null;
  scannePar: string | null;
  creeA: string;
}

export type ScanOutcome =
  | { type: "valide"; ticket: Ticket }
  | { type: "deja_scanne"; ticket: Ticket }
  | { type: "invalide"; ticket: Ticket }
  | { type: "inconnu" };
