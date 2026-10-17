import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/client/components/ui/table";
import { MOYEN_PAIEMENT_LABEL, ORIGINE_LABEL } from "@/shared/lib/tickets";
import type { AchatSansBillet } from "@/shared/lib/types";

/** Tickets boisson achetés par des invité·es sans billet : absents de la liste des billets. */
export function AchatsSansBilletCard({
  achats,
}: {
  achats: AchatSansBillet[];
}) {
  if (achats.length === 0) return null;
  const total = achats.reduce((n, a) => n + a.quantite, 0);

  return (
    <section className="flex flex-col gap-3">
      <div className="flex flex-col gap-0.5">
        <h2 className="font-bold text-[16px]">Tickets boisson sans billet</h2>
        <p className="text-[13px] text-muted">
          {total} ticket{total > 1 ? "s" : ""} pour des invité·es qui n'ont pas
          de billet.
        </p>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nom</TableHead>
            <TableHead>Canal</TableHead>
            <TableHead>Paiement</TableHead>
            <TableHead>Heure</TableHead>
            <TableHead>Tickets boisson</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {achats.map((a) => (
            <TableRow key={a.commandeId}>
              <TableCell className="font-semibold">{a.nom}</TableCell>
              <TableCell className="text-muted">
                {ORIGINE_LABEL[a.origine]}
              </TableCell>
              <TableCell className="text-muted">
                {MOYEN_PAIEMENT_LABEL[a.moyenPaiement]}
              </TableCell>
              <TableCell className="text-muted tabular-nums">
                {a.heure}
              </TableCell>
              <TableCell className="font-bold">
                {a.quantite} ticket{a.quantite > 1 ? "s" : ""}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </section>
  );
}
