import { buttonVariants } from "@/client/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/client/components/ui/dropdown-menu";
import { cn } from "@/shared/lib/cn";
import { nomComplet } from "@/shared/lib/tickets";
import type { BilletAdmin } from "@/shared/lib/types";

function MoreIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      className="size-4"
    >
      <circle cx="5" cy="12" r="1.8" />
      <circle cx="12" cy="12" r="1.8" />
      <circle cx="19" cy="12" r="1.8" />
    </svg>
  );
}

export interface BilletActions {
  onModifier: (billet: BilletAdmin) => void;
  onRenvoyerEmail: (billet: BilletAdmin) => void;
  onCopierLien: (billet: BilletAdmin) => void;
  onToggleStatut: (billet: BilletAdmin) => void;
}

/** Actions d'un billet de la liste admin, regroupées dans un menu. */
export function BilletActionsMenu({
  billet,
  actions,
}: {
  billet: BilletAdmin;
  actions: BilletActions;
}) {
  const invalide = billet.statut === "invalide";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label={`Actions pour ${nomComplet(billet.prenom, billet.nom)}`}
        className={cn(
          buttonVariants({ variant: "ghost", size: "icon" }),
          "size-9 data-[popup-open]:bg-ink-4 data-[popup-open]:text-fg",
        )}
      >
        <MoreIcon />
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuLabel>Actions</DropdownMenuLabel>
        <DropdownMenuItem
          disabled={invalide}
          onClick={() => actions.onModifier(billet)}
        >
          Modifier
        </DropdownMenuItem>
        <DropdownMenuItem
          disabled={!billet.email || invalide}
          onClick={() => actions.onRenvoyerEmail(billet)}
        >
          Renvoyer l&apos;email
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => actions.onCopierLien(billet)}>
          Copier le lien du billet
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          variant={invalide ? "default" : "danger"}
          onClick={() => actions.onToggleStatut(billet)}
        >
          {invalide ? "Réactiver" : "Invalider"}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
