import { CopyField } from "@/client/components/admin/copy-field";
import { Card } from "@/client/components/ui/card";
import { cn } from "@/shared/lib/cn";

/**
 * Guide pour relier HelloAsso à un événement : chaque événement a sa propre URL
 * de webhook. `mis_en_avant` après la création, quand c'est l'étape suivante.
 */
export function HelloassoWebhookCard({
  webhookUrl,
  misEnAvant,
}: {
  webhookUrl: string;
  misEnAvant: boolean;
}) {
  return (
    <Card
      className={cn(
        "flex flex-col gap-4",
        misEnAvant && "border-accent-2 bg-ink-3",
      )}
    >
      <div className="flex flex-col gap-1">
        <h2 className="font-bold text-[16px]">
          {misEnAvant
            ? "Dernière étape : relier HelloAsso"
            : "Relier HelloAsso"}
        </h2>
        <p className="text-[13.5px] text-muted">
          Chaque événement a sa propre URL de webhook : c&apos;est elle qui
          rattache les achats HelloAsso à cet événement.
        </p>
      </div>
      <ol className="flex list-decimal flex-col gap-1.5 pl-5 text-[14px]">
        <li>Copie l&apos;URL ci-dessous.</li>
        <li>
          Dans le back-office HelloAsso (Mon compte, Intégrations et API),
          remplace l&apos;URL de notification par celle-ci.
        </li>
        <li>
          Fais un achat test, puis vérifie qu&apos;il apparaît dans « Billets ».
        </li>
      </ol>
      <div className="flex flex-col gap-2">
        <label
          htmlFor="helloasso-webhook"
          className="font-bold text-[12.5px] text-muted"
        >
          URL du webhook HelloAsso
        </label>
        <CopyField id="helloasso-webhook" value={webhookUrl} />
        <p className="text-[12.5px] text-muted">
          Elle contient un secret : ne la partage qu&apos;avec HelloAsso.
        </p>
      </div>
    </Card>
  );
}
