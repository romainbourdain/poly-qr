import Link from "next/link";
import { buttonVariants } from "@/client/components/ui/button";

/** État vide des pages admin tant qu'aucun événement n'existe. */
export function AucunEvenement() {
  return (
    <div className="flex flex-col items-start gap-4 px-4 py-6 sm:px-6 sm:py-8 md:px-9">
      <h1 className="font-display font-extrabold text-[24px] tracking-tight sm:text-[30px]">
        Aucun événement
      </h1>
      <p className="max-w-md text-[14px] text-muted">
        Crée ton premier événement pour vendre des billets et ouvrir le scanner.
      </p>
      <Link
        href="/admin/evenements/nouveau"
        className={buttonVariants({ variant: "primary" })}
      >
        Créer un événement
      </Link>
    </div>
  );
}
