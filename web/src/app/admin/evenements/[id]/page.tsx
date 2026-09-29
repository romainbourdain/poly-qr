import Link from "next/link";
import { notFound } from "next/navigation";
import { Badge } from "@/client/components/ui/badge";
import { CARD_CLASSES } from "@/client/components/ui/card";
import { db } from "@/server/db/client";
import { listerEvenements } from "@/server/services/evenements";
import { listerBillets } from "@/server/services/tickets";
import { cn } from "@/shared/lib/cn";
import {
  MOYEN_PAIEMENT_LABEL,
  ORIGINE_LABEL,
  STATUT_BADGE_VARIANT,
  STATUT_LABEL,
} from "@/shared/lib/tickets";
import { commandeIdSchema } from "@/shared/validators/commande";

export const dynamic = "force-dynamic";

/** Consultation en lecture seule d'un événement (typiquement passé) et de ses billets. */
export default async function AdminEvenementPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const parsed = commandeIdSchema.safeParse((await params).id);
  if (!parsed.success) notFound();

  const evenement = (await listerEvenements(db)).find(
    (e) => e.id === parsed.data,
  );
  if (!evenement) notFound();

  const commandes = await listerBillets(
    db,
    { q: "", statut: "tous" },
    evenement.id,
  );

  return (
    <div className="flex flex-col gap-5 px-4 py-6 sm:gap-6 sm:px-6 sm:py-8 md:px-9">
      <div className="flex flex-col gap-1">
        <Link
          href="/admin"
          className="inline-flex h-11 items-center self-start text-[13.5px] text-muted"
        >
          ← Événements
        </Link>
        <h1 className="flex flex-wrap items-center gap-3 font-display font-extrabold text-[24px] tracking-tight sm:text-[30px]">
          {evenement.nom}
          <Badge variant={evenement.actif ? "good" : "neutral"}>
            {evenement.actif ? "En cours" : "Terminé"}
          </Badge>
        </h1>
        <div className="text-[14px] text-muted">
          {evenement.date} · {evenement.heure} · {evenement.lieu} ·{" "}
          {evenement.nbBillets} billet{evenement.nbBillets > 1 ? "s" : ""}{" "}
          (lecture seule)
        </div>
      </div>

      {commandes.length === 0 ? (
        <div className={cn(CARD_CLASSES, "text-[14px] text-muted")}>
          Aucun billet pour cet événement.
        </div>
      ) : (
        <div className="flex flex-col gap-2.5">
          {commandes.map((commande) => (
            <div
              key={commande.commandeId}
              className={cn(CARD_CLASSES, "flex flex-col gap-2")}
            >
              <div className="flex flex-wrap items-baseline gap-x-3">
                <span className="font-bold">{commande.nom}</span>
                <span className="text-[13px] text-muted">{commande.email}</span>
                <span className="text-[13px] text-faint">
                  {ORIGINE_LABEL[commande.origine]} ·{" "}
                  {MOYEN_PAIEMENT_LABEL[commande.moyenPaiement]}
                </span>
              </div>
              {commande.billets.map((billet) => (
                <div
                  key={billet.id}
                  className="flex flex-wrap items-center gap-3 text-[13px]"
                >
                  <span className="font-mono">{billet.code}</span>
                  <Badge variant={STATUT_BADGE_VARIANT[billet.statut]}>
                    {STATUT_LABEL[billet.statut]}
                  </Badge>
                  <span className="text-muted">
                    {billet.ticketsBoisson} ticket
                    {billet.ticketsBoisson > 1 ? "s" : ""} boisson
                  </span>
                </div>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
