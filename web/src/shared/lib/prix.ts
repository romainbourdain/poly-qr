export interface PrixEvenement {
  /** Billet non cotisant. */
  billet: number;
  billetCotisant: number;
  ticketBoisson: number;
}

/** Prix d'un billet selon que la personne est cotisante ou non. */
export function prixBillet(prix: PrixEvenement, cotisant: boolean): number {
  return cotisant ? prix.billetCotisant : prix.billet;
}

/** Total à payer pour une vente en main propre, en centimes (affichage uniquement). */
export function calculerTotalCentimes(
  prix: PrixEvenement,
  billets: { ticketsBoisson: number; cotisant: boolean }[],
): number {
  return billets.reduce(
    (total, billet) =>
      total +
      prixBillet(prix, billet.cotisant) +
      billet.ticketsBoisson * prix.ticketBoisson,
    0,
  );
}

/** Montant, en centimes, de `billets` billets dont `cotisants` au tarif cotisant, et de `ticketsBoisson` tickets boisson. */
export function montantCentimes(
  prix: PrixEvenement,
  ventes: { billets: number; cotisants: number; ticketsBoisson: number },
): number {
  return (
    (ventes.billets - ventes.cotisants) * prix.billet +
    ventes.cotisants * prix.billetCotisant +
    ventes.ticketsBoisson * prix.ticketBoisson
  );
}

const formatteurEuros = new Intl.NumberFormat("fr-FR", {
  style: "currency",
  currency: "EUR",
});

export function formatEuros(centimes: number): string {
  // Intl utilise des espaces insécables (fines) : on normalise pour un rendu stable.
  return formatteurEuros.format(centimes / 100).replace(/[  ]/g, " ");
}

/** Convertit une saisie en euros ("6,50", "6.5", "5") en centimes, `null` si invalide. */
export function parseEuros(saisie: string): number | null {
  const normalisee = saisie.trim().replace(",", ".");
  if (!/^\d+(\.\d{1,2})?$/.test(normalisee)) return null;
  return Math.round(Number(normalisee) * 100);
}

/** Centimes → saisie éditable en euros ("6,5" → "6,50"). */
export function centimesVersSaisie(centimes: number): string {
  return (centimes / 100).toFixed(2).replace(".", ",");
}

const formatteurDate = new Intl.DateTimeFormat("fr-FR", {
  weekday: "long",
  day: "numeric",
  month: "long",
  timeZone: "UTC",
});

/** "2026-03-14" → "Samedi 14 mars". */
export function formatDateLongue(date: string): string {
  const texte = formatteurDate.format(new Date(`${date}T00:00:00Z`));
  return texte.charAt(0).toUpperCase() + texte.slice(1);
}

/** "22:00:00" → "22h00". */
export function formatHeureEvenement(heure: string): string {
  const [h, m] = heure.split(":");
  return `${h}h${m}`;
}
