import { z } from "zod";

/**
 * Le webhook `Order` porte tout ce qu'il faut pour chaque item : tarif
 * (`name`) et personne inscrite (`user`) — vérifié sur des webhooks de test
 * HelloAsso Sandbox le 2026-10-04 (exemples dans docs/helloasso-webhooks/).
 * Il ne porte jamais d'options : le ticket boisson est un tarif à part, donc
 * un item de plus (un par unité achetée, sans champ quantité).
 */
const helloassoItemSchema = z.object({
  id: z.number(),
  name: z.string().optional(),
  user: z
    .object({
      firstName: z.string().optional(),
      lastName: z.string().optional(),
    })
    .optional(),
});

/**
 * HelloAsso envoie un webhook distinct par `eventType` pour un même achat.
 * `Order` est celui qu'on traite : c'est le seul dont `items[]` détaille les
 * tarifs et les personnes. `Payment` (la confirmation de paiement) ne porte pas
 * ce détail et est ignoré ailleurs, pour ne pas créer deux commandes pour un
 * même achat.
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

// Les noms de tarif HelloAsso disent de quoi il s'agit (« Billet cotisant »,
// « Billet non cotisant », « Ticket boisson »).
const NOM_TARIF_BOISSON = /boisson/i;
const NOM_TARIF_COTISANT = /cotisant/i;
const NOM_TARIF_NON_COTISANT = /non[\s-]*cotisant/i;

export interface ItemHelloAsso {
  /** L'item est un ticket boisson, pas une personne qui entre. */
  estBoisson: boolean;
  /** Le tarif de l'item est un tarif cotisant (d'après son nom). */
  cotisant: boolean;
  /** Personne inscrite sur l'item, quand HelloAsso la renseigne. */
  prenom?: string;
  nom?: string;
}

export interface HelloassoOrder {
  /** Nom complet de la personne qui a payé. */
  nom: string;
  /** Prénom et nom de celle qui a payé : valeur par défaut des billets sans inscrit. */
  payeurPrenom: string;
  payeurNom: string;
  email: string;
  helloassoPaymentId: string;
  items: ItemHelloAsso[];
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
    items: data.items.map((item) => {
      const tarif = item.name ?? "";
      return {
        estBoisson: NOM_TARIF_BOISSON.test(tarif),
        cotisant:
          NOM_TARIF_COTISANT.test(tarif) && !NOM_TARIF_NON_COTISANT.test(tarif),
        prenom: item.user?.firstName?.trim() || undefined,
        nom: item.user?.lastName?.trim() || undefined,
      };
    }),
  };
}

export interface BilletHelloAsso {
  nom: string;
  prenom: string;
  cotisant: boolean;
  ticketsBoisson: number;
}

const normaliser = (valeur: string) => valeur.trim().toLowerCase();

/**
 * Transforme les items d'une commande HelloAsso en billets. Un item billet
 * crée un billet ; sans inscrit renseigné il est au nom de celle qui a payé.
 * Un item ticket boisson ne crée pas de billet : il ajoute un ticket boisson
 * à celui de la même personne, sinon au billet le moins fourni en boissons
 * (plusieurs billets au même nom se partagent les boissons à égalité).
 * Une commande sans aucun billet (boissons seules) donne un billet par
 * personne, non cotisant, qui porte ses tickets boisson.
 */
export function itemsVersBillets(
  items: ItemHelloAsso[],
  payeur: { prenom: string; nom: string },
): BilletHelloAsso[] {
  const prenomDe = (item: ItemHelloAsso) =>
    item.prenom ?? (payeur.prenom || "—");
  const nomDe = (item: ItemHelloAsso) => item.nom ?? (payeur.nom || "—");
  const memePersonne = (b: BilletHelloAsso, prenom: string, nom: string) =>
    normaliser(b.prenom) === normaliser(prenom) &&
    normaliser(b.nom) === normaliser(nom);

  const billets: BilletHelloAsso[] = items
    .filter((item) => !item.estBoisson)
    .map((item) => ({
      prenom: prenomDe(item),
      nom: nomDe(item),
      cotisant: item.cotisant,
      ticketsBoisson: 0,
    }));
  const boissonsSeules = billets.length === 0;

  for (const boisson of items.filter((item) => item.estBoisson)) {
    const prenom = prenomDe(boisson);
    const nom = nomDe(boisson);
    const memes = billets.filter((b) => memePersonne(b, prenom, nom));

    if (memes.length === 0 && boissonsSeules) {
      billets.push({ prenom, nom, cotisant: false, ticketsBoisson: 0 });
      memes.push(billets[billets.length - 1]);
    }

    const candidats = memes.length > 0 ? memes : billets;
    const cible = candidats.reduce((min, b) =>
      b.ticketsBoisson < min.ticketsBoisson ? b : min,
    );
    cible.ticketsBoisson += 1;
  }

  return billets;
}
