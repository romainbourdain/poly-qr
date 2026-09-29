"use client";

import { useState } from "react";
import {
  InputGroup,
  InputGroupButton,
  InputGroupInput,
} from "@/client/components/ui/input-group";

/** Champ en lecture seule avec « Copier » intégré (retour annoncé aux lecteurs d'écran). */
export function CopyField({ id, value }: { id: string; value: string }) {
  const [copie, setCopie] = useState(false);

  async function copier() {
    try {
      await navigator.clipboard.writeText(value);
      setCopie(true);
      setTimeout(() => setCopie(false), 2000);
    } catch {
      // Presse-papiers indisponible : le champ reste sélectionnable à la main.
    }
  }

  return (
    <InputGroup>
      <InputGroupInput
        id={id}
        readOnly
        value={value}
        onFocus={(e) => e.currentTarget.select()}
        className="font-mono text-[13px]"
      />
      <InputGroupButton onClick={copier}>
        {copie ? "Copié" : "Copier"}
      </InputGroupButton>
      <span role="status" className="sr-only">
        {copie ? "Copié dans le presse-papiers" : ""}
      </span>
    </InputGroup>
  );
}
