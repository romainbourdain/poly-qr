import Link from "next/link";
import { CopyField } from "@/client/components/admin/copy-field";
import { buttonVariants } from "@/client/components/ui/button";
import { Card } from "@/client/components/ui/card";

/** Lien du scanner de l'événement, à transmettre aux bénévoles avec leur mot de passe. */
export function ScannerCard({
  scannerUrl,
  scannerPath,
}: {
  scannerUrl: string;
  scannerPath: string;
}) {
  return (
    <Card className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <h2 className="font-bold text-[16px]">Scanner de l&apos;entrée</h2>
        <p className="text-[13.5px] text-muted">
          Chaque événement a son propre scanner. Les bénévoles s&apos;y
          connectent avec le mot de passe défini plus bas.
        </p>
      </div>
      <div className="flex flex-col gap-2">
        <label
          htmlFor="scanner-url"
          className="font-bold text-[12.5px] text-muted"
        >
          Lien du scanner
        </label>
        <CopyField id="scanner-url" value={scannerUrl} />
      </div>
      <Link
        href={scannerPath}
        className={buttonVariants({ variant: "secondary" })}
      >
        Ouvrir le scanner
      </Link>
    </Card>
  );
}
