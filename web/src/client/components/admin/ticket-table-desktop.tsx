import {
  type BilletActions,
  BilletActionsMenu,
} from "@/client/components/admin/billet-actions-menu";
import { Button } from "@/client/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/client/components/ui/table";
import type { SortOrder, TicketSort } from "@/shared/lib/search-params";
import {
  MOYEN_PAIEMENT_LABEL,
  ORIGINE_LABEL,
  STATUT_LABEL,
  STATUT_TEXT_CLASS,
} from "@/shared/lib/tickets";
import type { BilletAdmin } from "@/shared/lib/types";

type Colonne = {
  label: string;
  column: Exclude<TicketSort, "cree_a">;
};

const COLONNES: Colonne[] = [
  { label: "Nom", column: "nom" },
  { label: "Prénom", column: "prenom" },
  { label: "Email", column: "email" },
  { label: "Canal", column: "origine" },
  { label: "Tarif", column: "cotisant" },
  { label: "Tickets boisson", column: "tickets_boisson" },
  { label: "Statut", column: "statut" },
];

function ArrowUpDown({ ordre }: { ordre: SortOrder | null }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className="size-3.5"
    >
      <path d="m7 15 5 5 5-5" opacity={ordre === "asc" ? 0.35 : 1} />
      <path d="m7 9 5-5 5 5" opacity={ordre === "desc" ? 0.35 : 1} />
    </svg>
  );
}

/** En-tête triable : bouton ghost avec flèches, comme l'en-tête de colonne du data table shadcn. */
function SortableHeader({
  label,
  column,
  tri,
  ordre,
  onSort,
}: Colonne & {
  tri: TicketSort;
  ordre: SortOrder;
  onSort: (column: TicketSort) => void;
}) {
  const active = tri === column;
  const direction = active
    ? ordre === "asc"
      ? "croissant"
      : "décroissant"
    : "";

  return (
    <Button
      variant="ghost"
      size="sm"
      className="-ml-3 h-8 px-3 font-bold text-[12px] text-faint uppercase tracking-[0.1em] enabled:hover:text-fg"
      onClick={() => onSort(column)}
      aria-label={`Trier par ${label}${direction ? `, ordre ${direction}` : ""}`}
    >
      {label}
      <ArrowUpDown ordre={active ? ordre : null} />
    </Button>
  );
}

export function TicketTableDesktop({
  billets,
  actions,
  tri,
  ordre,
  onSort,
}: {
  billets: BilletAdmin[];
  actions: BilletActions;
  tri: TicketSort;
  ordre: SortOrder;
  onSort: (column: TicketSort) => void;
}) {
  return (
    <Table className="min-w-[880px]">
      <TableHeader>
        <TableRow className="hover:bg-transparent">
          {COLONNES.map((colonne) => (
            <TableHead key={colonne.column}>
              <SortableHeader
                {...colonne}
                tri={tri}
                ordre={ordre}
                onSort={onSort}
              />
            </TableHead>
          ))}
          <TableHead className="w-14">
            <span className="sr-only">Actions</span>
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {billets.map((billet) => (
          <TableRow key={billet.id}>
            <TableCell className="font-bold">{billet.nom}</TableCell>
            <TableCell className="font-bold">{billet.prenom}</TableCell>
            <TableCell className="max-w-56 truncate text-muted">
              {billet.email ?? "—"}
            </TableCell>
            <TableCell className="whitespace-nowrap text-muted">
              {ORIGINE_LABEL[billet.origine]} ·{" "}
              {MOYEN_PAIEMENT_LABEL[billet.moyenPaiement]}
            </TableCell>
            <TableCell className="whitespace-nowrap">
              {billet.cotisant ? "Cotisant" : "Non cotisant"}
            </TableCell>
            <TableCell className="font-bold">
              {billet.ticketsBoisson} ticket
              {billet.ticketsBoisson > 1 ? "s" : ""}
            </TableCell>
            <TableCell
              className={`whitespace-nowrap font-bold text-[13px] ${STATUT_TEXT_CLASS[billet.statut]}`}
            >
              {STATUT_LABEL[billet.statut]}
              {billet.statut === "scanne" && billet.scanneA
                ? ` · ${billet.scanneA}`
                : ""}
            </TableCell>
            <TableCell className="text-right">
              <BilletActionsMenu billet={billet} actions={actions} />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
