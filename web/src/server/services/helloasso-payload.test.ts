import { describe, expect, it } from "vitest";
import { mapperPayloadHelloAsso } from "./helloasso-payload";

function payloadValide(overrides: Record<string, unknown> = {}) {
  return {
    eventType: "Payment",
    data: {
      id: 12345,
      payer: {
        firstName: "Jean",
        lastName: "Dupont",
        email: "jean.dupont@example.org",
      },
      items: [{ customFields: [{ name: "Tickets boisson", answer: "2" }] }],
    },
    ...overrides,
  };
}

describe("mapperPayloadHelloAsso", () => {
  it("extrait nom, email et identifiant de paiement du payload", () => {
    const entree = mapperPayloadHelloAsso(payloadValide());

    expect(entree.nom).toBe("Jean Dupont");
    expect(entree.email).toBe("jean.dupont@example.org");
    expect(entree.helloassoPaymentId).toBe("12345");
  });

  it("crée un billet par item, avec ses tickets boisson", () => {
    const entree = mapperPayloadHelloAsso(
      payloadValide({
        data: {
          id: 1,
          payer: {
            firstName: "Marie",
            lastName: "Curie",
            email: "marie@example.org",
          },
          items: [
            { customFields: [{ name: "Tickets boisson", answer: "3" }] },
            { customFields: [] },
          ],
        },
      }),
    );

    expect(entree.billets).toEqual([
      { ticketsBoisson: 3 },
      { ticketsBoisson: 0 },
    ]);
  });

  it("met 0 ticket boisson quand le champ personnalisé est absent", () => {
    const entree = mapperPayloadHelloAsso(
      payloadValide({
        data: {
          id: 1,
          payer: { firstName: "A", lastName: "B", email: "a@example.org" },
          items: [{}],
        },
      }),
    );

    expect(entree.billets).toEqual([{ ticketsBoisson: 0 }]);
  });

  it("rejette un payload qui n'est pas un eventType Payment", () => {
    expect(() =>
      mapperPayloadHelloAsso(payloadValide({ eventType: "Order" })),
    ).toThrow();
  });

  it("rejette un payload malformé", () => {
    expect(() => mapperPayloadHelloAsso({ foo: "bar" })).toThrow();
  });
});
