import { describe, expect, it } from "vitest";
import {
  calculerTotalCentimes,
  formatDateLongue,
  formatEuros,
  formatHeureEvenement,
  parseEuros,
} from "@/shared/lib/prix";

describe("prix", () => {
  it("calcule le total billets + tickets boisson", () => {
    expect(
      calculerTotalCentimes({ billet: 500, ticketBoisson: 150 }, [
        { ticketsBoisson: 2 },
        { ticketsBoisson: 0 },
      ]),
    ).toBe(2 * 500 + 2 * 150);
  });

  it("formate en euros", () => {
    expect(formatEuros(650)).toBe("6,50 €");
    expect(formatEuros(500)).toBe("5,00 €");
  });

  it("parse une saisie en euros vers des centimes", () => {
    expect(parseEuros("6,50")).toBe(650);
    expect(parseEuros("6.5")).toBe(650);
    expect(parseEuros("5")).toBe(500);
    expect(parseEuros("")).toBeNull();
    expect(parseEuros("abc")).toBeNull();
    expect(parseEuros("-1")).toBeNull();
  });

  it("formate date et heure en français", () => {
    expect(formatDateLongue("2026-03-14")).toBe("Samedi 14 mars");
    expect(formatHeureEvenement("22:00:00")).toBe("22h00");
    expect(formatHeureEvenement("09:05")).toBe("09h05");
  });
});
