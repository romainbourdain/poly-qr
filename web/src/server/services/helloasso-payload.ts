import { z } from "zod";
import type { HelloassoCommandeInput } from "@/shared/validators/helloasso";

const helloassoItemSchema = z.object({
  customFields: z
    .array(z.object({ name: z.string(), answer: z.string() }))
    .optional(),
});

/**
 * HelloAsso envoie un webhook distinct par `eventType` pour un même achat.
 * `Order` est celui qu'on traite : c'est le seul dont `items[]` correspond
 * exactement à nos billets (un item par personne inscrite). `Payment` (la
 * confirmation de paiement) ne porte pas ce détail par billet et est ignoré
 * ailleurs, pour ne pas créer deux commandes pour un même achat. Vérifié sur
 * un vrai webhook de test HelloAsso Sandbox le 2026-09-28.
 */
const helloassoPayloadSchema = z.object({
  eventType: z.literal("Order"),
  data: z.object({
    id: z.union([z.string(), z.number()]),
    payer: z.object({
      firstName: z.string(),
      lastName: z.string(),
      email: z.string().email(),
    }),
    items: z.array(helloassoItemSchema).min(1),
  }),
});

const NOM_CHAMP_TICKETS_BOISSON = /boisson/i;

/**
 * RISQUE NON LEVÉ (voir docs/CONTEXT.md, "Risque technique à lever tôt") :
 * un vrai webhook `Order` observé ne portait aucun `customFields` (le
 * formulaire de test n'avait pas encore d'option tickets boisson configurée
 * dessus). On suppose ici un champ personnalisé dont le nom contient
 * "boisson" — à corriger dès qu'un webhook avec cette option configurée aura
 * été observé (peut-être `items[].options` plutôt que `customFields`).
 */
function extraireTicketsBoisson(
  item: z.infer<typeof helloassoItemSchema>,
): number {
  const champ = item.customFields?.find((c) =>
    NOM_CHAMP_TICKETS_BOISSON.test(c.name),
  );
  if (!champ) return 0;

  const valeur = Number.parseInt(champ.answer, 10);
  return Number.isFinite(valeur) && valeur > 0 ? valeur : 0;
}

/**
 * Mapping payload brut HelloAsso → entrée normalisée, isolé ici pour que
 * seule cette fonction ait à changer une fois le risque ci-dessus levé.
 */
export function mapperPayloadHelloAsso(
  payload: unknown,
): HelloassoCommandeInput {
  const { data } = helloassoPayloadSchema.parse(payload);

  return {
    nom: `${data.payer.firstName} ${data.payer.lastName}`.trim(),
    email: data.payer.email,
    helloassoPaymentId: String(data.id),
    billets: data.items.map((item) => ({
      ticketsBoisson: extraireTicketsBoisson(item),
    })),
  };
}
