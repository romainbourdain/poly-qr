import { describe, expect, it } from "vitest";
import { evenementADebute } from "@/shared/lib/horaires";

// 2026-11-20 : heure d'hiver, Paris = UTC+1.
const evenement = { date: "2026-11-20", heure: "21:00" };

describe("evenementADebute", () => {
  it("est faux avant l'heure de début, vrai à partir de celle-ci (heure de Paris)", () => {
    expect(evenementADebute(evenement, new Date("2026-11-20T19:59:00Z"))).toBe(
      false,
    );
    expect(evenementADebute(evenement, new Date("2026-11-20T20:00:00Z"))).toBe(
      true,
    );
  });

  it("tient compte de l'heure d'été", () => {
    // 2026-07-01 : Paris = UTC+2, 21h00 Paris = 19:00Z.
    const ete = { date: "2026-07-01", heure: "21:00" };
    expect(evenementADebute(ete, new Date("2026-07-01T18:59:00Z"))).toBe(false);
    expect(evenementADebute(ete, new Date("2026-07-01T19:00:00Z"))).toBe(true);
  });
});
