import { Badge } from "@/client/components/ui/badge";
import { Card } from "@/client/components/ui/card";
import { Input } from "@/client/components/ui/input";
import { Separator } from "@/client/components/ui/separator";
import { Stat } from "@/client/components/ui/stat";
import { formatEuros } from "@/shared/lib/prix";
import type { EvenementActif } from "@/shared/lib/types";

export function EventSummaryCard({
  evenement,
  billets,
  entreesVendues,
  entreesScannees,
  ticketsBoissonDus,
}: {
  evenement: EvenementActif;
  billets: number;
  entreesVendues: number;
  entreesScannees: number;
  ticketsBoissonDus: number;
}) {
  return (
    <Card className="flex flex-col gap-5">
      <div className="flex items-start gap-4">
        <div className="flex flex-1 flex-col gap-1.5">
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="font-bold font-display text-[20px] tracking-tight sm:text-[23px]">
              {evenement.nom}
            </span>
            <Badge variant="good" className="tracking-wide">
              EN COURS
            </Badge>
          </div>
          <div className="text-[13.5px] text-muted">
            {evenement.date} · {evenement.heure} · {evenement.lieu}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-3.5">
        <Stat label="Billets émis" value={billets} />
        <Stat label="Entrées vendues" value={entreesVendues} />
        <Stat label="Entrées scannées" value={entreesScannees} />
        <Stat label="Tickets boisson dus" value={ticketsBoissonDus} />
      </div>

      <Separator />

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 md:gap-6.5">
        <div className="flex flex-col gap-2">
          <label
            htmlFor="helloasso-url"
            className="font-bold text-[12.5px] text-muted"
          >
            Formulaire HelloAsso relié
          </label>
          <Input
            id="helloasso-url"
            readOnly
            defaultValue="helloasso.com/associations/poly/evenements/soiree-hiver"
            className="h-11.5 text-[13.5px]"
          />
          <div className="flex items-center gap-2">
            <span className="size-1.5 rounded-full bg-good" />
            <span className="text-[12.5px] text-muted">
              Démo : pas de vrai webhook branché
            </span>
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <span className="font-bold text-[12.5px] text-muted">
            Tarifs permanence
          </span>
          <div className="text-[15px]">
            Billet {formatEuros(evenement.prixBilletCentimes)} · Ticket boisson{" "}
            {formatEuros(evenement.prixTicketBoissonCentimes)}
          </div>
          <div className="text-[12.5px] text-muted">
            Affichés dans le formulaire de vente permanence uniquement.
          </div>
        </div>
      </div>
    </Card>
  );
}
