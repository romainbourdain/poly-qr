import { env } from "@/server/env";

/**
 * Authentification serveur-à-serveur (OAuth2 client_credentials) : pas
 * d'utilisateur ni de mire d'autorisation, juste les identifiants de
 * l'association (Mon Compte > Intégrations et API sur HelloAsso).
 */
export async function obtenirTokenHelloAsso(): Promise<string> {
  const reponse = await fetch(`${env.HELLOASSO_API_BASE_URL}/oauth2/token`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "client_credentials",
      client_id: env.HELLOASSO_CLIENT_ID,
      client_secret: env.HELLOASSO_CLIENT_SECRET,
    }),
  });

  if (!reponse.ok) {
    throw new Error(
      `Échec de l'authentification HelloAsso (${reponse.status}).`,
    );
  }

  const { access_token: accessToken } = (await reponse.json()) as {
    access_token: string;
  };
  return accessToken;
}

const NOM_OPTION_BOISSON = /boisson/i;
// Le nom du tarif HelloAsso dit s'il est réservé aux cotisants (« Billet cotisant »).
const NOM_TARIF_COTISANT = /cotisant/i;
const NOM_TARIF_NON_COTISANT = /non[\s-]*cotisant/i;

export interface DetailsItemHelloAsso {
  /** 1 si l'option « ticket boisson » a été prise, 0 sinon. */
  ticketsBoisson: number;
  /** Le tarif de l'item est un tarif cotisant (d'après son nom). */
  cotisant: boolean;
  /** Personne inscrite sur ce billet, quand HelloAsso la renseigne. */
  prenom?: string;
  nom?: string;
}

/**
 * Le webhook HelloAsso ne transmet jamais les options choisies pour un item
 * (voir docs/CONTEXT.md, "Risque technique à lever tôt") : il faut cet appel
 * de suivi pour savoir si l'option "ticket boisson" a été prise. HelloAsso ne
 * permettant pas d'en acheter plusieurs pour un même billet (voir
 * docs/DECISIONS.md), sa présence vaut 1 ticket boisson, son absence 0. Le
 * même appel donne la personne inscrite sur le billet (`user`), sinon on
 * retombe sur celle qui a payé.
 */
export async function detailsItemHelloAsso(
  accessToken: string,
  itemId: number,
): Promise<DetailsItemHelloAsso> {
  const reponse = await fetch(
    `${env.HELLOASSO_API_BASE_URL}/v5/items/${itemId}?withDetails=true`,
    { headers: { Authorization: `Bearer ${accessToken}` } },
  );

  if (!reponse.ok) {
    throw new Error(
      `Échec de la récupération de l'item HelloAsso ${itemId} (${reponse.status}).`,
    );
  }

  const { name, options, user } = (await reponse.json()) as {
    name?: string;
    options?: { name: string }[];
    user?: { firstName?: string; lastName?: string };
  };

  return {
    cotisant:
      NOM_TARIF_COTISANT.test(name ?? "") &&
      !NOM_TARIF_NON_COTISANT.test(name ?? ""),
    ticketsBoisson: options?.some((o) => NOM_OPTION_BOISSON.test(o.name))
      ? 1
      : 0,
    prenom: user?.firstName?.trim() || undefined,
    nom: user?.lastName?.trim() || undefined,
  };
}
