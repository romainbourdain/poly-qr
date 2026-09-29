"use client";

import Link from "next/link";
import { useState } from "react";
import { EvenementForm } from "@/client/components/admin/evenement-form";
import { EventSummaryCard } from "@/client/components/admin/event-summary-card";
import { Badge } from "@/client/components/ui/badge";
import { Button } from "@/client/components/ui/button";
import { CARD_CLASSES } from "@/client/components/ui/card";
import { cn } from "@/shared/lib/cn";
import { formatEuros } from "@/shared/lib/prix";
import type {
  EvenementActif,
  EvenementResume,
  StatsEvenement,
} from "@/shared/lib/types";

export function AdminEvenementsContent({
  actif,
  passes,
  stats,
}: {
  actif: EvenementActif | null;
  passes: EvenementResume[];
  stats: StatsEvenement;
}) {
  const [creation, setCreation] = useState(actif === null);

  return (
    <div className="flex flex-col gap-5 px-4 py-6 sm:gap-6 sm:px-6 sm:py-8 md:px-9">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:gap-5">
        <div className="flex flex-1 flex-col gap-1">
          <h1 className="font-display font-extrabold text-[24px] tracking-tight sm:text-[30px]">
            Événements
          </h1>
          <div className="text-[14px] text-muted">
            Un seul événement actif à la fois : en créer un nouveau désactive le
            précédent, sans le supprimer.
          </div>
        </div>
        <Button
          variant={creation ? "secondary" : "primary"}
          onClick={() => setCreation((v) => !v)}
        >
          {creation ? "Annuler" : "+ Nouvel événement"}
        </Button>
      </div>

      {creation && (
        <section className="flex flex-col gap-3">
          <h2 className="font-bold text-[16px]">Nouvel événement</h2>
          <EvenementForm mode="creer" onDone={() => setCreation(false)} />
        </section>
      )}

      {actif ? (
        <>
          <EventSummaryCard evenement={actif} {...stats} />
          <section className="flex flex-col gap-3">
            <h2 className="font-bold text-[16px]">
              Configurer l&apos;événement actif
            </h2>
            {/* key : recharge les valeurs par défaut quand l'événement actif change */}
            <EvenementForm key={actif.id} mode="modifier" initial={actif} />
          </section>
        </>
      ) : (
        <div className={cn(CARD_CLASSES, "text-[14px] text-muted")}>
          Aucun événement actif : crée-en un pour ouvrir la billetterie.
        </div>
      )}

      {passes.length > 0 && (
        <section className="flex flex-col gap-3">
          <h2 className="font-bold text-[16px]">Événements passés</h2>
          <div className="flex flex-col gap-2.5">
            {passes.map((evenement) => (
              <Link
                key={evenement.id}
                href={`/admin/evenements/${evenement.id}`}
                className={cn(
                  CARD_CLASSES,
                  "flex flex-wrap items-center gap-x-4 gap-y-1",
                )}
              >
                <span className="flex-1 font-bold">{evenement.nom}</span>
                <span className="text-[13px] text-muted">
                  {evenement.date} · {evenement.lieu}
                </span>
                <Badge>
                  {evenement.nbBillets} billet
                  {evenement.nbBillets > 1 ? "s" : ""}
                </Badge>
                <span className="text-[12.5px] text-faint">
                  {formatEuros(evenement.prixBilletCentimes)} /{" "}
                  {formatEuros(evenement.prixTicketBoissonCentimes)}
                </span>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
