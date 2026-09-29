import { describe, expect, it } from "vitest";
import { mapperPayloadHelloAsso } from "@/server/services/helloasso-payload";

function payloadValide(overrides: Record<string, unknown> = {}) {
  return {
    eventType: "Order",
    data: {
      id: 12345,
      payer: {
        firstName: "Jean",
        lastName: "Dupont",
        email: "jean.dupont@example.org",
      },
      items: [{ id: 1 }],
    },
    ...overrides,
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

  it("extrait un identifiant d'item par billet", () => {
    const entree = mapperPayloadHelloAsso(
      payloadValide({
        data: {
          id: 1,
          payer: {
            firstName: "Marie",
            lastName: "Curie",
            email: "marie@example.org",
          },
          items: [{ id: 10 }, { id: 20 }],
        },
      }),
    );

    expect(entree.itemIds).toEqual([10, 20]);
  });

  it("rejette un payload qui n'est pas un eventType Order", () => {
    expect(() =>
      mapperPayloadHelloAsso(payloadValide({ eventType: "Payment" })),
    ).toThrow();
  });

  it("rejette un payload malformé", () => {
    expect(() => mapperPayloadHelloAsso({ foo: "bar" })).toThrow();
  });
});
