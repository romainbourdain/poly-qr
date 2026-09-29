import { z } from "zod";

const helloassoItemSchema = z.object({
  id: z.number(),
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

export interface HelloassoOrder {
  /** Nom complet de la personne qui a payé. */
  nom: string;
  /** Prénom et nom de celle qui a payé : valeur par défaut des billets sans inscrit. */
  payeurPrenom: string;
  payeurNom: string;
  email: string;
  helloassoPaymentId: string;
  /** Identifiants HelloAsso des items, un par billet — pas encore résolus en
   * tickets boisson : le webhook ne transmet jamais les options choisies
   * (voir `helloasso-api.ts` et docs/CONTEXT.md), il faut un appel de suivi
   * par item. */
  itemIds: number[];
}

/**
 * Mapping payload brut HelloAsso → entrée normalisée, isolé ici pour que
 * seule cette fonction ait à changer si le format du webhook évolue.
 */
export function mapperPayloadHelloAsso(payload: unknown): HelloassoOrder {
  const { data } = helloassoPayloadSchema.parse(payload);

  return {
    nom: `${data.payer.firstName} ${data.payer.lastName}`.trim(),
    payeurPrenom: data.payer.firstName.trim(),
    payeurNom: data.payer.lastName.trim(),
    email: data.payer.email,
    helloassoPaymentId: String(data.id),
    itemIds: data.items.map((item) => item.id),
  };
}
