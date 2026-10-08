import { describe, expect, it } from "vitest";
import { formatHeure } from "@/shared/lib/tickets";

describe("formatHeure", () => {
  it("affiche l'heure de Paris, hiver comme été", () => {
    expect(formatHeure(new Date("2026-11-20T20:05:00Z"))).toBe("21h05");
    expect(formatHeure(new Date("2026-06-20T19:05:00Z"))).toBe("21h05");
    expect(formatHeure(new Date("2026-11-20T23:30:00Z"))).toBe("00h30");
  });
});
