"use client";

import { Dialog } from "@base-ui/react/dialog";
import { useState } from "react";
import { Badge } from "@/client/components/ui/badge";
import { Button } from "@/client/components/ui/button";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/client/components/ui/input-group";
import { normaliser, STATUT_BADGE_VARIANT } from "@/shared/lib/tickets";
import type { BilletRecherchable, Statut } from "@/shared/lib/types";

const STATUT_RECHERCHE_LABEL: Record<Statut, string> = {
  non_scanne: "à valider",
  scanne: "déjà entré",
  invalide: "invalidé",
};

const MAX_RESULTATS = 30;

function SearchIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      aria-hidden="true"
    >
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" />
    </svg>
  );
}

/**
 * Recherche par nom pour une personne sans QR (téléphone déchargé, oublié) :
 * choisir son billet le valide comme un scan. La recherche s'ouvre en plein
 * écran, champ en haut, pour que le clavier mobile ne cache ni la saisie ni
 * les résultats (équivalent du `CommandDialog` de shadcn).
 */
export function BilletSearch({
  billets,
  onSelect,
}: {
  billets: BilletRecherchable[];
  onSelect: (code: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const recherche = normaliser(query);
  const resultats =
    recherche.length < 2
      ? []
      : billets
          .filter((b) => normaliser(b.nom).includes(recherche))
          .slice(0, MAX_RESULTATS);

  return (
    <Dialog.Root
      open={open}
      onOpenChange={(ouvert) => {
        setOpen(ouvert);
        if (!ouvert) setQuery("");
      }}
    >
      <div className="flex flex-col gap-2.5 pb-[max(1.25rem,env(safe-area-inset-bottom))]">
        <span className="font-bold text-[11.5px] text-faint uppercase tracking-[0.12em]">
          Pas de QR code ?
        </span>
        <Dialog.Trigger className="flex h-12.5 w-full items-center gap-2 rounded-xl border border-line-2 bg-ink-3 px-3.5 text-left text-[15px] text-faint transition-colors hover:bg-ink-4 [&_svg]:size-4">
          <SearchIcon />
          Chercher par nom
        </Dialog.Trigger>
      </div>

      <Dialog.Portal>
        <Dialog.Backdrop className="fixed inset-0 z-40 bg-black/70 transition-opacity data-[ending-style]:opacity-0 data-[starting-style]:opacity-0" />
        <Dialog.Popup className="fixed inset-0 z-50 flex flex-col bg-ink-2 transition-[opacity,transform] duration-200 data-[ending-style]:translate-y-2 data-[starting-style]:translate-y-2 data-[ending-style]:opacity-0 data-[starting-style]:opacity-0 sm:inset-x-0 sm:top-[10vh] sm:bottom-auto sm:mx-auto sm:max-h-[70vh] sm:w-full sm:max-w-md sm:rounded-[18px] sm:border sm:border-line">
          <Dialog.Title className="sr-only">
            Chercher un billet par nom
          </Dialog.Title>
          <div className="flex items-center gap-2 border-line border-b p-3 pt-[max(0.75rem,env(safe-area-inset-top))]">
            <InputGroup className="flex-1">
              <InputGroupAddon>
                <SearchIcon />
              </InputGroupAddon>
              <InputGroupInput
                type="search"
                value={query}
                onValueChange={setQuery}
                placeholder="Nom ou prénom"
                aria-label="Nom ou prénom"
                autoComplete="off"
                autoFocus
              />
            </InputGroup>
            <Dialog.Close
              render={<Button variant="ghost" size="sm" className="h-12" />}
            >
              Annuler
            </Dialog.Close>
          </div>

          <div className="flex-1 overflow-y-auto overscroll-contain p-3">
            {recherche.length < 2 ? (
              <p className="px-1 py-2 text-[14px] text-muted">
                Tape au moins 2 lettres du nom ou du prénom.
              </p>
            ) : resultats.length === 0 ? (
              <p role="status" className="px-1 py-2 text-[14px] text-muted">
                Aucun billet à ce nom.
              </p>
            ) : (
              <ul className="flex flex-col gap-1.5">
                {resultats.map((b) => (
                  <li key={b.code}>
                    <button
                      type="button"
                      onClick={() => {
                        setOpen(false);
                        onSelect(b.code);
                      }}
                      className="flex min-h-12 w-full items-center gap-3 rounded-xl border border-line-2 bg-ink-3 px-4 py-2.5 text-left transition-colors hover:bg-ink-4"
                    >
                      <span className="flex-1 truncate font-semibold text-[15px]">
                        {b.nom}
                      </span>
                      <Badge
                        variant={STATUT_BADGE_VARIANT[b.statut]}
                        className="px-2 py-0.5 text-[12px]"
                      >
                        {STATUT_RECHERCHE_LABEL[b.statut]}
                      </Badge>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
