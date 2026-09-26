import { Badge } from "@/client/components/ui/badge";
import { Card } from "@/client/components/ui/card";
import { Input } from "@/client/components/ui/input";
import { Separator } from "@/client/components/ui/separator";
import { Stat } from "@/client/components/ui/stat";
import { EVENT } from "@/shared/mock/event";

export function EventSummaryCard({
  billets,
  entreesVendues,
  entreesScannees,
  ticketsBoissonDus,
}: {
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
              {EVENT.nom}
            </span>
            <Badge variant="good" className="tracking-wide">
              EN COURS
            </Badge>
          </div>
          <div className="text-[13.5px] text-muted">
            {EVENT.date} · {EVENT.heure} · {EVENT.lieu}
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
          <label
            htmlFor="volunteer-password"
            className="font-bold text-[12.5px] text-muted"
          >
            Mot de passe bénévoles
          </label>
          <Input
            id="volunteer-password"
            readOnly
            defaultValue={EVENT.motDePasse}
            className="h-11.5 text-[15px] tracking-wide"
          />
          <div className="text-[12.5px] text-muted">
            À donner aux bénévoles du poste d&apos;entrée le soir même.
          </div>
        </div>
      </div>
    </Card>
  );
}
