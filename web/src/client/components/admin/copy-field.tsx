"use client";

import { useState } from "react";
import { Button } from "@/client/components/ui/button";
import { Input } from "@/client/components/ui/input";

/** Champ en lecture seule + bouton « Copier » (avec retour annoncé aux lecteurs d'écran). */
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
    <div className="flex gap-2">
      <Input
        id={id}
        readOnly
        value={value}
        onFocus={(e) => e.currentTarget.select()}
        className="h-11.5 min-w-0 flex-1 font-mono text-[13px]"
      />
      <Button variant="secondary" className="h-11.5 shrink-0" onClick={copier}>
        {copie ? "Copié" : "Copier"}
      </Button>
      <span role="status" className="sr-only">
        {copie ? "Copié dans le presse-papiers" : ""}
      </span>
    </div>
  );
}
