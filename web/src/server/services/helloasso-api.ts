function getApiBaseUrl(): string {
  const value = process.env.HELLOASSO_API_BASE_URL;
  if (!value) throw new Error("HELLOASSO_API_BASE_URL n'est pas défini");
  return value;
}

function getClientCredentials(): { clientId: string; clientSecret: string } {
  const clientId = process.env.HELLOASSO_CLIENT_ID;
  const clientSecret = process.env.HELLOASSO_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    throw new Error(
      "Configuration HelloAsso incomplète (HELLOASSO_CLIENT_ID, HELLOASSO_CLIENT_SECRET).",
    );
  }
  return { clientId, clientSecret };
}

/**
 * Authentification serveur-à-serveur (OAuth2 client_credentials) : pas
 * d'utilisateur ni de mire d'autorisation, juste les identifiants de
 * l'association (Mon Compte > Intégrations et API sur HelloAsso).
 */
export async function obtenirTokenHelloAsso(): Promise<string> {
  const { clientId, clientSecret } = getClientCredentials();

  const reponse = await fetch(`${getApiBaseUrl()}/oauth2/token`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "client_credentials",
      client_id: clientId,
      client_secret: clientSecret,
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

/**
 * Le webhook HelloAsso ne transmet jamais les options choisies pour un item
 * (voir docs/CONTEXT.md, "Risque technique à lever tôt") : il faut cet appel
 * de suivi pour savoir si l'option "ticket boisson" a été prise. HelloAsso ne
 * permettant pas d'en acheter plusieurs pour un même billet (voir
 * docs/DECISIONS.md), sa présence vaut 1 ticket boisson, son absence 0.
 */
export async function itemAOptionBoisson(
  accessToken: string,
  itemId: number,
): Promise<boolean> {
  const reponse = await fetch(
    `${getApiBaseUrl()}/v5/items/${itemId}?withDetails=true`,
    { headers: { Authorization: `Bearer ${accessToken}` } },
  );

  if (!reponse.ok) {
    throw new Error(
      `Échec de la récupération de l'item HelloAsso ${itemId} (${reponse.status}).`,
    );
  }

  const { options } = (await reponse.json()) as {
    options?: { name: string }[];
  };

  return (
    options?.some((option) => NOM_OPTION_BOISSON.test(option.name)) ?? false
  );
}
