export interface PrixEvenement {
  billet: number;
  ticketBoisson: number;
}

/** Total à payer pour une vente permanence, en centimes (affichage uniquement). */
export function calculerTotalCentimes(
  prix: PrixEvenement,
  billets: { ticketsBoisson: number }[],
): number {
  return billets.reduce(
    (total, billet) =>
      total + prix.billet + billet.ticketsBoisson * prix.ticketBoisson,
    0,
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
