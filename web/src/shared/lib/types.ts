export type Origine = "helloasso" | "permanence" | "sur_place";
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
  nom: string;
  prenom: string;
  ticketsBoisson: number;
  statut: Statut;
  scanneA: string | null;
}

/** Un billet nominatif tel qu'affiché dans la liste admin, avec les infos de sa commande. */
export interface BilletAdmin extends BilletListe {
  /** Absent pour une vente sur place. */
  email: string | null;
  origine: Origine;
  moyenPaiement: MoyenPaiement;
}

export interface CommandeAvecBillets {
  commandeId: string;
  nom: string;
  /** Absent pour une vente sur place. */
  email: string | null;
  origine: Origine;
  moyenPaiement: MoyenPaiement;
  billets: BilletListe[];
}

export interface CommandeCreee {
  commandeId: string;
  origine: Origine;
  nom: string;
  email: string | null;
  billets: {
    id: string;
    code: string;
    nom: string;
    prenom: string;
    ticketsBoisson: number;
  }[];
}

export interface BilletScanne {
  nom: string;
  email: string | null;
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
  /** Prix du billet en pré-vente (HelloAsso et permanence). */
  prixBilletCentimes: number;
  prixBilletSurPlaceCentimes: number;
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
  billetsSurPlace: number;
  billetsHelloasso: number;
  entreesScannees: number;
  ticketsBoisson: number;
  ticketsBoissonPermanence: number;
  ticketsBoissonSurPlace: number;
}
