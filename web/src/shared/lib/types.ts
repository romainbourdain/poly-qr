export type Origine = "helloasso" | "permanence";
export const MOYENS_PAIEMENT = [
  "virement",
  "hello_asso",
  "lydia",
  "especes",
  "sumup",
  "autre",
] as const;
export type MoyenPaiement = (typeof MOYENS_PAIEMENT)[number];
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
  moyenPaiement: MoyenPaiement;
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
  moyenPaiement: MoyenPaiement;
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

/** Événement tel qu'affiché (date/heure formatées en français) — sans le mot de passe. */
export interface Evenement {
  id: string;
  nom: string;
  /** `YYYY-MM-DD`, pour préremplir un champ date. */
  dateIso: string;
  /** `HH:MM`, pour préremplir un champ heure. */
  heureIso: string;
  date: string;
  heure: string;
  lieu: string;
  prixBilletCentimes: number;
  prixTicketBoissonCentimes: number;
}

export interface EvenementResume extends Evenement {
  nbCommandes: number;
  nbBillets: number;
}

/** Compteurs d'un événement ; hors `billetsInvalides`, les billets invalidés n'y sont pas comptés. */
export interface StatsEvenement {
  billetsVendus: number;
  billetsInvalides: number;
  billetsPermanence: number;
  billetsHelloasso: number;
  entreesScannees: number;
  ticketsBoisson: number;
  ticketsBoissonPermanence: number;
}
