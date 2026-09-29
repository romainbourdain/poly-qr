import { CopyField } from "@/client/components/admin/copy-field";
import { Card } from "@/client/components/ui/card";
import { cn } from "@/shared/lib/cn";

/**
 * Guide pour relier HelloAsso à un événement : chaque événement a son propre
 * lien, à coller dans HelloAsso. Mise en avant juste après la création.
 */
export function HelloassoCard({
  lien,
  misEnAvant,
}: {
  lien: string;
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
          Ce lien permet à HelloAsso de créer les billets de cet événement à
          chaque achat.
        </p>
      </div>
      <ol className="flex list-decimal flex-col gap-1.5 pl-5 text-[14px]">
        <li>Copie le lien ci-dessous.</li>
        <li>
          Dans HelloAsso, ouvre Mon compte, Intégrations et API, puis colle-le à
          la place de l&apos;ancien lien de notification.
        </li>
        <li>
          Fais un achat test et vérifie qu&apos;il apparaît dans « Billets ».
        </li>
      </ol>
      <div className="flex flex-col gap-2">
        <label
          htmlFor="helloasso-lien"
          className="font-bold text-[12.5px] text-muted"
        >
          Lien à coller dans HelloAsso
        </label>
        <CopyField id="helloasso-lien" value={lien} />
      </div>
    </Card>
  );
}
