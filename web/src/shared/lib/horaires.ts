/**
 * Heures « murales » de Paris : l'heure affichée à Paris lue comme si c'était de
 * l'UTC, pour comparer et découper des instants sans dépendre du fuseau du serveur.
 */

const formatteurParis = new Intl.DateTimeFormat("fr-FR", {
  timeZone: "Europe/Paris",
  year: "numeric",
  month: "numeric",
  day: "numeric",
  hour: "numeric",
  minute: "numeric",
  hourCycle: "h23",
});

/** Minutes écoulées depuis l'epoch, en lisant l'heure murale de Paris comme si c'était de l'UTC. */
export function minutesMuralesParis(instant: Date): number {
  const parts = Object.fromEntries(
    formatteurParis
      .formatToParts(instant)
      .map((p) => [p.type, Number(p.value)]),
  );
  return Math.floor(
    Date.UTC(parts.year, parts.month - 1, parts.day, parts.hour, parts.minute) /
      60_000,
  );
}

/** `2026-11-20` + `21:00` (heure de Paris) → minutes murales. */
export function minutesMuralesEvenement(
  dateIso: string,
  heureIso: string,
): number {
  const [annee, mois, jour] = dateIso.split("-").map(Number);
  const [heure, minute] = heureIso.split(":").map(Number);
  return Math.floor(Date.UTC(annee, mois - 1, jour, heure, minute) / 60_000);
}

/** L'événement a-t-il déjà commencé (date et heure de début, heure de Paris) ? */
export function evenementADebute(
  evenement: { date: string; heure: string },
  maintenant: Date = new Date(),
): boolean {
  return (
    minutesMuralesParis(maintenant) >=
    minutesMuralesEvenement(evenement.date, evenement.heure)
  );
}
