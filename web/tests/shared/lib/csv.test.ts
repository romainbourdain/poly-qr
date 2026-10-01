import { describe, expect, it } from "vitest";
import { versCsv } from "@/shared/lib/csv";

describe("versCsv", () => {
  it("commence par un BOM UTF-8 et sépare par des points-virgules en CRLF", () => {
    expect(
      versCsv([
        ["a", "b"],
        ["c", "d"],
      ]),
    ).toBe("﻿a;b\r\nc;d\r\n");
  });

  it("met les décimales à la française", () => {
    expect(versCsv([[12.5, 3]])).toBe("﻿12,5;3\r\n");
  });

  it("entoure de guillemets les cellules avec ; guillemet ou retour ligne", () => {
    expect(versCsv([["a;b", 'dit "oui"', "l1\nl2"]])).toBe(
      '﻿"a;b";"dit ""oui""";"l1\nl2"\r\n',
    );
  });

  it("neutralise les cellules qui seraient lues comme des formules", () => {
    expect(versCsv([["=SOMME(A1)", "+1", "-1", "@x", "Alice"]])).toBe(
      "﻿'=SOMME(A1);'+1;'-1;'@x;Alice\r\n",
    );
  });

  it("ne touche pas aux nombres négatifs", () => {
    expect(versCsv([[-2]])).toBe("﻿-2\r\n");
  });
});
