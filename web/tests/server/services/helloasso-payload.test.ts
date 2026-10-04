import { describe, expect, it } from "vitest";
import {
  type ItemHelloAsso,
  itemsVersBillets,
  mapperPayloadHelloAsso,
} from "@/server/services/helloasso-payload";

function payloadValide(items: unknown[] = [{ id: 1 }]) {
  return {
    eventType: "Order",
    data: {
      id: 12345,
      payer: {
        firstName: "Jean",
        lastName: "Dupont",
        email: "jean.dupont@example.org",
      },
      items,
    },
  };
}

describe("mapperPayloadHelloAsso", () => {
  it("extrait nom, email et identifiant de paiement du payload", () => {
    const entree = mapperPayloadHelloAsso(payloadValide());

    expect(entree.nom).toBe("Jean Dupont");
    expect(entree.payeurPrenom).toBe("Jean");
    expect(entree.payeurNom).toBe("Dupont");
    expect(entree.email).toBe("jean.dupont@example.org");
    expect(entree.helloassoPaymentId).toBe("12345");
  });

  it("déduit billet, boisson et statut cotisant du nom du tarif", () => {
    const { items } = mapperPayloadHelloAsso(
      payloadValide([
        { id: 1, name: "Billet cotisant" },
        { id: 2, name: "Billet non cotisant" },
        { id: 3, name: "Ticket boisson" },
        { id: 4, name: "Billet Non-Cotisant" },
      ]),
    );

    expect(items.map((i) => [i.estBoisson, i.cotisant])).toEqual([
      [false, true],
      [false, false],
      [true, false],
      [false, false],
    ]);
  });

  it("reprend la personne inscrite de chaque item, nettoyée", () => {
    const { items } = mapperPayloadHelloAsso(
      payloadValide([
        {
          id: 1,
          name: "Billet cotisant",
          user: { firstName: " Léa ", lastName: "Martin" },
        },
        { id: 2, name: "Billet cotisant" },
      ]),
    );

    expect(items[0]).toMatchObject({ prenom: "Léa", nom: "Martin" });
    expect(items[1].prenom).toBeUndefined();
    expect(items[1].nom).toBeUndefined();
  });

  it("rejette un payload qui n'est pas un eventType Order", () => {
    expect(() =>
      mapperPayloadHelloAsso({ ...payloadValide(), eventType: "Payment" }),
    ).toThrow();
  });

  it("rejette un payload malformé", () => {
    expect(() => mapperPayloadHelloAsso({ foo: "bar" })).toThrow();
  });
});

describe("itemsVersBillets", () => {
  const payeur = { prenom: "Pay", nom: "Eur" };
  const billet = (o: Partial<ItemHelloAsso> = {}): ItemHelloAsso => ({
    estBoisson: false,
    cotisant: true,
    prenom: "Achille",
    nom: "Toulet",
    ...o,
  });
  const boisson = (o: Partial<ItemHelloAsso> = {}): ItemHelloAsso =>
    billet({ estBoisson: true, cotisant: false, ...o });
  const sansNom = { prenom: undefined, nom: undefined };

  it("un item billet donne un billet sans boisson", () => {
    expect(itemsVersBillets([billet()], payeur)).toEqual([
      { prenom: "Achille", nom: "Toulet", cotisant: true, ticketsBoisson: 0 },
    ]);
  });

  it("rattache un item boisson au billet de la même personne", () => {
    expect(itemsVersBillets([billet(), boisson()], payeur)).toEqual([
      { prenom: "Achille", nom: "Toulet", cotisant: true, ticketsBoisson: 1 },
    ]);
  });

  it("cumule plusieurs boissons sur le même billet", () => {
    const r = itemsVersBillets(
      [billet(), boisson(), boisson(), boisson()],
      payeur,
    );
    expect(r).toHaveLength(1);
    expect(r[0].ticketsBoisson).toBe(3);
  });

  it("rattache la boisson au bon billet quand les noms diffèrent", () => {
    const r = itemsVersBillets(
      [
        billet({ prenom: "Echo", nom: "Fournier" }),
        billet({ prenom: "Foxtrot", nom: "Girard" }),
        boisson({ prenom: "Foxtrot", nom: "Girard" }),
      ],
      payeur,
    );
    expect(r.map((b) => b.ticketsBoisson)).toEqual([0, 1]);
  });

  it("répartit les boissons entre deux billets au même nom", () => {
    const r = itemsVersBillets(
      [billet(), billet(), boisson(), boisson()],
      payeur,
    );
    expect(r.map((b) => b.ticketsBoisson)).toEqual([1, 1]);
  });

  it("répartit les boissons sans nom sur les billets, au nom du payeur", () => {
    const r = itemsVersBillets(
      [billet(sansNom), billet(sansNom), boisson(sansNom), boisson(sansNom)],
      payeur,
    );
    expect(r.map((b) => b.ticketsBoisson)).toEqual([1, 1]);
    expect(r[0]).toMatchObject({ prenom: "Pay", nom: "Eur" });
  });

  it("conserve le statut de chaque billet d'une commande mixte", () => {
    const r = itemsVersBillets(
      [
        billet({ prenom: "India", nom: "Jacob", cotisant: true }),
        billet({ prenom: "Juliet", nom: "Klein", cotisant: false }),
      ],
      payeur,
    );
    expect(r.map((b) => b.cotisant)).toEqual([true, false]);
  });

  it("boissons seules : un billet non cotisant par personne, avec ses boissons", () => {
    const r = itemsVersBillets(
      [
        boisson({ prenom: "Lima", nom: "Lambert" }),
        boisson({ prenom: "Lima", nom: "Lambert" }),
        boisson({ prenom: "Mike", nom: "Noel" }),
      ],
      payeur,
    );
    expect(r).toEqual([
      { prenom: "Lima", nom: "Lambert", cotisant: false, ticketsBoisson: 2 },
      { prenom: "Mike", nom: "Noel", cotisant: false, ticketsBoisson: 1 },
    ]);
  });
});
