import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  type Mock,
  vi,
} from "vitest";
import {
  detailsItemHelloAsso,
  obtenirTokenHelloAsso,
} from "@/server/services/helloasso-api";

function jsonResponse(body: unknown, ok = true, status = 200): Response {
  return {
    ok,
    status,
    json: async () => body,
  } as Response;
}

describe("helloasso-api", () => {
  const fetchMock = vi.fn() as Mock;

  beforeEach(() => {
    vi.stubGlobal("fetch", fetchMock);
    process.env.HELLOASSO_API_BASE_URL = "https://api.helloasso-sandbox.com";
    process.env.HELLOASSO_CLIENT_ID = "client-id-test";
    process.env.HELLOASSO_CLIENT_SECRET = "client-secret-test";
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    fetchMock.mockReset();
  });

  describe("obtenirTokenHelloAsso", () => {
    it("échange les identifiants client contre un access_token", async () => {
      fetchMock.mockResolvedValue(jsonResponse({ access_token: "un-token" }));

      const token = await obtenirTokenHelloAsso();

      expect(token).toBe("un-token");
      const [url, init] = fetchMock.mock.calls[0];
      expect(url).toBe("https://api.helloasso-sandbox.com/oauth2/token");
      expect(init.method).toBe("POST");
      expect(String(init.body)).toContain("grant_type=client_credentials");
    });

    it("échoue si HELLOASSO_CLIENT_ID n'est pas défini", async () => {
      process.env.HELLOASSO_CLIENT_ID = "";
      await expect(obtenirTokenHelloAsso()).rejects.toThrow();
    });

    it("échoue si la réponse HelloAsso n'est pas OK", async () => {
      fetchMock.mockResolvedValue(jsonResponse({}, false, 401));
      await expect(obtenirTokenHelloAsso()).rejects.toThrow();
    });
  });

  describe("detailsItemHelloAsso", () => {
    it("compte 1 ticket boisson si une option contient 'boisson' dans son nom", async () => {
      fetchMock.mockResolvedValue(
        jsonResponse({ options: [{ name: "Ticket boisson" }] }),
      );

      await expect(detailsItemHelloAsso("token", 42)).resolves.toMatchObject({
        ticketsBoisson: 1,
      });
      const [url] = fetchMock.mock.calls[0];
      expect(url).toBe(
        "https://api.helloasso-sandbox.com/v5/items/42?withDetails=true",
      );
    });

    it("compte 0 si aucune option ne correspond ou s'il n'y a pas d'options", async () => {
      fetchMock.mockResolvedValueOnce(
        jsonResponse({ options: [{ name: "Repas végétarien" }] }),
      );
      await expect(detailsItemHelloAsso("token", 42)).resolves.toMatchObject({
        ticketsBoisson: 0,
      });

      fetchMock.mockResolvedValueOnce(jsonResponse({}));
      await expect(detailsItemHelloAsso("token", 42)).resolves.toMatchObject({
        ticketsBoisson: 0,
      });
    });

    it("renvoie la personne inscrite sur le billet quand HelloAsso la donne", async () => {
      fetchMock.mockResolvedValue(
        jsonResponse({ user: { firstName: " Léa ", lastName: "Martin" } }),
      );
      await expect(detailsItemHelloAsso("token", 42)).resolves.toEqual({
        cotisant: false,
        ticketsBoisson: 0,
        prenom: "Léa",
        nom: "Martin",
      });
    });

    it("détecte un tarif cotisant d'après son nom, sauf « non cotisant »", async () => {
      const cotisant = async (name: string) => {
        fetchMock.mockResolvedValueOnce(jsonResponse({ name }));
        return (await detailsItemHelloAsso("token", 42)).cotisant;
      };
      expect(await cotisant("Billet cotisant")).toBe(true);
      expect(await cotisant("Billet Cotisant BDE")).toBe(true);
      expect(await cotisant("Billet non cotisant")).toBe(false);
      expect(await cotisant("Billet non-cotisant")).toBe(false);
      expect(await cotisant("Billet")).toBe(false);
    });

    it("échoue si la réponse HelloAsso n'est pas OK", async () => {
      fetchMock.mockResolvedValue(jsonResponse({}, false, 404));
      await expect(detailsItemHelloAsso("token", 42)).rejects.toThrow();
    });
  });
});
