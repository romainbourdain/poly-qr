import { describe, expect, it } from "vitest";
import { construireAffluence } from "@/shared/lib/affluence";

// 2026-11-20 est en heure d'hiver : Paris = UTC+1.
const evenement = { date: "2026-11-20", heure: "21:00" };
const scan = (utc: string) => new Date(`2026-11-20T${utc}:00Z`);

describe("construireAffluence", () => {
  it("couvre 3 h à partir du début de l'événement quand rien n'est scanné", () => {
    const tranches = construireAffluence([], evenement);
    expect(tranches).toHaveLength(12);
    expect(tranches[0]).toEqual({ debut: "21:00", fin: "21:15", entrees: 0 });
    expect(tranches.at(-1)?.fin).toBe("00:00");
    expect(tranches.every((t) => t.entrees === 0)).toBe(true);
  });

  it("compte les scans par tranche de 15 min en heure de Paris", () => {
    // 20:05Z = 21:05 Paris, 20:14Z = 21:14, 20:15Z = 21:15
    const tranches = construireAffluence(
      [scan("20:05"), scan("20:14"), scan("20:15")],
      evenement,
    );
    expect(tranches[0].entrees).toBe(2);
    expect(tranches[1].entrees).toBe(1);
  });

  it("s'étend aux scans hors de la fenêtre initiale", () => {
    // 19:40Z = 20:40 Paris (avant le début) ; 23:10Z = 00:10 Paris (après +3 h)
    const tranches = construireAffluence(
      [scan("19:40"), scan("23:10")],
      evenement,
    );
    expect(tranches[0]).toEqual({ debut: "20:30", fin: "20:45", entrees: 1 });
    expect(tranches.at(-1)).toEqual({
      debut: "00:00",
      fin: "00:15",
      entrees: 1,
    });
    expect(tranches.reduce((n, t) => n + t.entrees, 0)).toBe(2);
  });

  it("ignore les scans d'essai loin de la soirée", () => {
    // 10:00Z = 11:00 Paris, 10 h avant le début.
    const tranches = construireAffluence(
      [scan("10:00"), scan("20:05")],
      evenement,
    );
    expect(tranches).toHaveLength(4);
    expect(tranches[0].debut).toBe("21:00");
    expect(tranches.reduce((n, t) => n + t.entrees, 0)).toBe(1);
  });

  it("se resserre sur 1 h minimum quand il y a des entrées", () => {
    const tranches = construireAffluence([scan("20:05")], evenement);
    expect(tranches).toHaveLength(4);
    expect(tranches.at(-1)?.fin).toBe("22:00");
  });
});
