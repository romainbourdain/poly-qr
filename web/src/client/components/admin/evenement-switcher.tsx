"use client";

import { Select } from "@base-ui/react/select";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { INPUT_CLASSES } from "@/client/components/ui/input";
import { cn } from "@/shared/lib/cn";

export interface EvenementOption {
  id: string;
  nom: string;
  date: string;
}

/**
 * Sélecteur de l'événement affiché dans toutes les pages admin. Le choix vit dans
 * l'URL (`?evenement=<id>`) ; changer d'événement repart des filtres par défaut.
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

  const items = evenements.map((e) => ({
    value: e.id,
    label: e.nom,
  }));

  return (
    <div className="flex flex-col gap-2">
      <Select.Root
        value={evenementId}
        items={items}
        onValueChange={(value) => {
          if (!value) return;
          // Les pages `/admin/evenements/*` (création) n'ont pas de sens par événement.
          const cible = pathname.startsWith("/admin/evenements")
            ? "/admin"
            : pathname;
          router.push(`${cible}?evenement=${value}`);
        }}
      >
        <Select.Label className="font-bold text-[12px] text-muted uppercase tracking-[0.12em]">
          Événement
        </Select.Label>
        <Select.Trigger
          className={cn(
            INPUT_CLASSES,
            "flex h-12 items-center justify-between gap-2 text-left text-[14.5px]",
          )}
        >
          <Select.Value className="truncate font-semibold" />
          <Select.Icon className="text-faint">▾</Select.Icon>
        </Select.Trigger>
        <Select.Portal>
          <Select.Positioner
            sideOffset={6}
            alignItemWithTrigger={false}
            className="z-50"
          >
            <Select.Popup className="min-w-(--anchor-width) max-w-[calc(100vw-2rem)] rounded-xl border border-line-2 bg-ink-3 p-1 shadow-lg">
              <Select.List>
                {evenements.map((e) => (
                  <Select.Item
                    key={e.id}
                    value={e.id}
                    className="flex min-h-11 cursor-default flex-col justify-center rounded-lg px-3 py-1.5 outline-none data-[highlighted]:bg-ink-4"
                  >
                    <Select.ItemText className="font-semibold text-[14.5px]">
                      {e.nom}
                    </Select.ItemText>
                    <span className="text-[12px] text-muted">{e.date}</span>
                  </Select.Item>
                ))}
              </Select.List>
            </Select.Popup>
          </Select.Positioner>
        </Select.Portal>
      </Select.Root>
      <Link
        href="/admin/evenements/nouveau"
        className="flex h-11 items-center px-1 font-semibold text-[13.5px] text-accent-3"
      >
        + Nouvel événement
      </Link>
    </div>
  );
}
