import { Button } from "@/client/components/ui/button";
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

export function TicketTableDesktop({
  billets,
  onToggleStatut,
}: {
  billets: BilletAdmin[];
  onToggleStatut: (billetId: string, statutActuel: Statut) => void;
}) {
  return (
    <div className="hidden overflow-hidden rounded-2xl border border-line bg-ink-2 md:block">
      <table className="w-full border-collapse">
        <thead className="border-line border-b bg-[#1B1B27]">
          <tr>
            <th scope="col" className={TH}>
              Nom
            </th>
            <th scope="col" className={TH}>
              Prénom
            </th>
            <th scope="col" className={TH}>
              Email
            </th>
            <th scope="col" className={TH}>
              Canal
            </th>
            <th scope="col" className={TH}>
              Tickets boisson
            </th>
            <th scope="col" className={TH}>
              Statut
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
