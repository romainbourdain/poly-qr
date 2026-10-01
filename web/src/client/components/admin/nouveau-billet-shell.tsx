import type { ReactNode } from "react";

/** En-tête commun des pages de vente : titre, événement et ce que fait l'action. */
export function NouveauBilletShell({
  titre,
  evenementNom,
  description,
  children,
}: {
  titre: string;
  evenementNom: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-5 px-4 py-6 sm:gap-6 sm:px-6 sm:py-8 md:px-9">
      <div className="flex flex-col gap-1">
        <h1 className="font-display font-extrabold text-[24px] tracking-tight sm:text-[30px]">
          {titre}
        </h1>
        <div className="text-[14px] text-muted">
          {evenementNom} · {description}
        </div>
      </div>
      {children}
    </div>
  );
}
