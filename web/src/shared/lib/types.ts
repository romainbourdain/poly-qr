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

export interface BilletListe {
  id: string;
  code: string;
  ticketsBoisson: number;
  statut: Statut;
  scanneA: string | null;
}

export interface CommandeAvecBillets {
  commandeId: string;
  nom: string;
  email: string;
  origine: Origine;
  billets: BilletListe[];
}

export interface CommandeCreee {
  commandeId: string;
  nom: string;
  email: string;
  billets: { id: string; code: string; ticketsBoisson: number }[];
}

export interface BilletScanne {
  nom: string;
  email: string;
  origine: Origine;
  ticketsBoisson: number;
  scanneA: string | null;
}

export type ResultatScan =
  | { type: "valide"; billet: BilletScanne }
  | { type: "deja_scanne"; billet: BilletScanne }
  | { type: "invalide"; billet: BilletScanne }
  | { type: "inconnu" };

export interface BilletSimulable {
  code: string;
  nom: string;
  statut: Statut;
}
