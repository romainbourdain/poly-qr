import Link from "next/link";
import { CopyField } from "@/client/components/admin/copy-field";
import { RealQr } from "@/client/components/billet/real-qr";
import { buttonVariants } from "@/client/components/ui/button";
import { Card } from "@/client/components/ui/card";

/** Scanner de l'événement : un QR à flasher avec le téléphone du poste d'entrée, ou le lien à copier. */
export function ScannerCard({
  scannerUrl,
  scannerPath,
}: {
  scannerUrl: string;
  scannerPath: string;
}) {
  return (
    <Card className="flex flex-col items-center gap-5 text-center">
      <h2 className="self-start font-bold text-[16px]">
        Scanner de l&apos;entrée
      </h2>
      <div className="rounded-2xl bg-white p-3">
        <RealQr value={scannerUrl} size={168} label="QR code du scanner" />
      </div>
      <Link
        href={scannerPath}
        className={buttonVariants({ className: "w-full" })}
      >
        Ouvrir le scanner
      </Link>
      <div className="w-full">
        <label htmlFor="scanner-url" className="sr-only">
          Lien du scanner
        </label>
        <CopyField id="scanner-url" value={scannerUrl} />
      </div>
    </Card>
  );
}
