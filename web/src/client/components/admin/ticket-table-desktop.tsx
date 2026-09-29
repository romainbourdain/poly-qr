import { Button } from "@/client/components/ui/button";
import type { SortOrder, TicketSort } from "@/shared/lib/search-params";
import {
  MOYEN_PAIEMENT_LABEL,
  ORIGINE_LABEL,
  STATUT_LABEL,
  STATUT_TEXT_CLASS,
} from "@/shared/lib/tickets";
import type { BilletAdmin, Statut } from "@/shared/lib/types";

const TH =
  "px-4 py-3 text-left font-bold text-[12px] text-faint uppercase tracking-[0.1em] first:pl-6 last:pr-6";
const TD = "px-4 py-3.5 text-[14px] first:pl-6 last:pr-6";

function SortableHeader({
  label,
  column,
  tri,
  ordre,
  onSort,
}: {
  label: string;
  column: Exclude<TicketSort, "cree_a">;
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
    <button
      type="button"
      className="-my-2 -ml-2 flex min-h-9 items-center gap-1 rounded-md px-2 text-left hover:text-fg focus-visible:outline-2 focus-visible:outline-brand focus-visible:outline-offset-2"
      onClick={() => onSort(column)}
      aria-label={`Trier par ${label}${direction ? `, ordre ${direction}` : ""}`}
    >
      {label}
      <span aria-hidden="true" className={active ? "text-fg" : "text-faint"}>
        {active ? (ordre === "asc" ? "↑" : "↓") : "↕"}
      </span>
    </button>
  );
}

export function TicketTableDesktop({
  billets,
  onToggleStatut,
  tri,
  ordre,
  onSort,
}: {
  billets: BilletAdmin[];
  onToggleStatut: (billetId: string, statutActuel: Statut) => void;
  tri: TicketSort;
  ordre: SortOrder;
  onSort: (column: TicketSort) => void;
}) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-line bg-ink-2">
      <table className="w-full min-w-[880px] border-collapse">
        <thead className="border-line border-b bg-[#1B1B27]">
          <tr>
            <th scope="col" className={TH}>
              <SortableHeader
                label="Nom"
                column="nom"
                tri={tri}
                ordre={ordre}
                onSort={onSort}
              />
            </th>
            <th scope="col" className={TH}>
              <SortableHeader
                label="Prénom"
                column="prenom"
                tri={tri}
                ordre={ordre}
                onSort={onSort}
              />
            </th>
            <th scope="col" className={TH}>
              <SortableHeader
                label="Email"
                column="email"
                tri={tri}
                ordre={ordre}
                onSort={onSort}
              />
            </th>
            <th scope="col" className={TH}>
              <SortableHeader
                label="Canal"
                column="origine"
                tri={tri}
                ordre={ordre}
                onSort={onSort}
              />
            </th>
            <th scope="col" className={TH}>
              <SortableHeader
                label="Tarif"
                column="cotisant"
                tri={tri}
                ordre={ordre}
                onSort={onSort}
              />
            </th>
            <th scope="col" className={TH}>
              <SortableHeader
                label="Tickets boisson"
                column="tickets_boisson"
                tri={tri}
                ordre={ordre}
                onSort={onSort}
              />
            </th>
            <th scope="col" className={TH}>
              <SortableHeader
                label="Statut"
                column="statut"
                tri={tri}
                ordre={ordre}
                onSort={onSort}
              />
            </th>
            <th scope="col" className={TH}>
              <span className="sr-only">Action</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {billets.map((billet) => (
            <tr
              key={billet.id}
              className="border-[#22222F] border-b last:border-0"
            >
              <td className={`${TD} font-bold`}>{billet.nom}</td>
              <td className={`${TD} font-bold`}>{billet.prenom}</td>
              <td className={`${TD} max-w-56 truncate text-muted`}>
                {billet.email ?? "—"}
              </td>
              <td className={`${TD} whitespace-nowrap text-muted`}>
                {ORIGINE_LABEL[billet.origine]} ·{" "}
                {MOYEN_PAIEMENT_LABEL[billet.moyenPaiement]}
              </td>
              <td className={`${TD} whitespace-nowrap`}>
                {billet.cotisant ? "Cotisant" : "Non cotisant"}
              </td>
              <td className={`${TD} font-bold`}>
                {billet.ticketsBoisson} ticket
                {billet.ticketsBoisson > 1 ? "s" : ""}
              </td>
              <td
                className={`${TD} whitespace-nowrap font-bold text-[13px] ${STATUT_TEXT_CLASS[billet.statut]}`}
              >
                {STATUT_LABEL[billet.statut]}
                {billet.statut === "scanne" && billet.scanneA
                  ? ` · ${billet.scanneA}`
                  : ""}
              </td>
              <td className={`${TD} text-right`}>
                <Button
                  variant="secondary"
                  size="sm"
                  className="h-10 px-3.5 text-[13px]"
                  onClick={() => onToggleStatut(billet.id, billet.statut)}
                >
                  {billet.statut === "invalide" ? "Réactiver" : "Invalider"}
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
