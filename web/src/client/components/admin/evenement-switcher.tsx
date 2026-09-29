"use client";

import { Combobox } from "@base-ui/react/combobox";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { cn } from "@/shared/lib/cn";

export interface EvenementOption {
  id: string;
  nom: string;
  date: string;
}

/**
 * Sélecteur de l'événement affiché dans toutes les pages admin, avec recherche.
 * Le choix vit dans l'URL (`?evenement=<id>`) ; changer d'événement repart des
 * filtres par défaut. `evenements` arrive déjà trié du plus récent au plus ancien.
 */
export function EvenementSwitcher({
  evenements,
  evenementId,
}: {
  evenements: EvenementOption[];
  evenementId: string | null;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  if (evenements.length === 0) {
    return (
      <Link
        href="/admin/evenements/nouveau"
        className="flex h-11 items-center justify-center rounded-xl bg-accent px-4 font-bold text-[14px] text-white"
      >
        Créer un événement
      </Link>
    );
  }

  const courant = evenements.find((e) => e.id === evenementId) ?? null;

  return (
    <Combobox.Root
      items={evenements}
      value={courant}
      open={open}
      onOpenChange={setOpen}
      itemToStringLabel={(e: EvenementOption) => e.nom}
      isItemEqualToValue={(a: EvenementOption, b: EvenementOption) =>
        a.id === b.id
      }
      onValueChange={(evenement: EvenementOption | null) => {
        if (!evenement) return;
        // Les pages `/admin/evenements/*` (création) n'ont pas de sens par événement.
        const cible = pathname.startsWith("/admin/evenements")
          ? "/admin"
          : pathname;
        router.push(`${cible}?evenement=${evenement.id}`);
      }}
    >
      <Combobox.Trigger
        aria-label="Changer d'événement"
        className="flex w-full items-center gap-2 rounded-xl border border-line-2 bg-ink-3 px-3 py-2 text-left transition-colors hover:bg-ink-4 data-[popup-open]:border-accent"
      >
        <span className="flex min-w-0 flex-1 flex-col leading-tight">
          <span className="truncate font-bold text-[14.5px]">
            {courant?.nom ?? "Choisir un événement"}
          </span>
          {courant && (
            <span className="truncate text-[12px] text-muted">
              {courant.date}
            </span>
          )}
        </span>
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="shrink-0 text-faint"
          aria-hidden="true"
        >
          <path d="m7 15 5 5 5-5M7 9l5-5 5 5" />
        </svg>
      </Combobox.Trigger>
      <Combobox.Portal>
        <Combobox.Positioner sideOffset={6} className="z-[60]">
          <Combobox.Popup className="flex max-h-[min(24rem,var(--available-height))] w-(--anchor-width) min-w-64 max-w-[calc(100vw-2rem)] flex-col overflow-hidden rounded-xl border border-line-2 bg-ink-3 shadow-lg">
            <div className="border-line border-b p-2">
              <Combobox.Input
                placeholder="Rechercher un événement…"
                aria-label="Rechercher un événement"
                className="h-10 w-full rounded-lg border border-line-2 bg-ink-2 px-3 text-[14px] text-fg placeholder:text-faint focus:border-accent"
              />
            </div>
            <Combobox.Empty className="p-3 text-[13.5px] text-muted empty:hidden">
              Aucun événement trouvé.
            </Combobox.Empty>
            <Combobox.List className="flex-1 overflow-y-auto p-1">
              {(e: EvenementOption) => (
                <Combobox.Item
                  key={e.id}
                  value={e}
                  className="flex min-h-11 cursor-default items-center gap-2 rounded-lg px-3 py-1.5 outline-none data-[highlighted]:bg-ink-4"
                >
                  <span className="flex min-w-0 flex-1 flex-col">
                    <span className="truncate font-semibold text-[14.5px]">
                      {e.nom}
                    </span>
                    <span className="text-[12px] text-muted">{e.date}</span>
                  </span>
                  <Combobox.ItemIndicator className="text-accent-3">
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <path d="m5 12 5 5 9-10" />
                    </svg>
                  </Combobox.ItemIndicator>
                </Combobox.Item>
              )}
            </Combobox.List>
            <div className="border-line border-t p-1">
              <Link
                href="/admin/evenements/nouveau"
                onClick={() => setOpen(false)}
                className={cn(
                  "flex h-11 items-center gap-2 rounded-lg px-3 font-semibold text-[14px] text-accent-3 hover:bg-ink-4",
                )}
              >
                + Nouvel événement
              </Link>
            </div>
          </Combobox.Popup>
        </Combobox.Positioner>
      </Combobox.Portal>
    </Combobox.Root>
  );
}
