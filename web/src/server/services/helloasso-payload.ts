import { z } from "zod";
import type { HelloassoCommandeInput } from "@/shared/validators/helloasso";

const helloassoItemSchema = z.object({
  customFields: z
    .array(z.object({ name: z.string(), answer: z.string() }))
    .optional(),
});

const helloassoPayloadSchema = z.object({
  eventType: z.literal("Payment"),
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
 * on ne sait pas si HelloAsso transmet le nombre de tickets boisson par
 * billet directement dans `items[].customFields`, dans `items[].options`,
 * ou seulement via un appel de suivi `GET /items/{itemId}`. On suppose ici
 * un champ personnalisé dont le nom contient "boisson" — à corriger dès
 * qu'un vrai webhook de test HelloAsso aura été observé.
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
