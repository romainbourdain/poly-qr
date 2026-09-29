/**
 * Événement affiché dans l'admin : celui de l'URL s'il existe, sinon le plus
 * récent (la liste arrive triée par date décroissante), sinon `null`.
 */
export function resoudreEvenementId(
  evenements: { id: string }[],
  demande: string | null | undefined,
): string | null {
  if (demande && evenements.some((e) => e.id === demande)) return demande;
  return evenements[0]?.id ?? null;
}
