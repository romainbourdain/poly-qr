import Link from "next/link";
import { NouveauBilletContent } from "@/client/components/admin/nouveau-billet-content";
import { db } from "@/server/db/client";
import { obtenirEvenementActif } from "@/server/services/evenements";

export const dynamic = "force-dynamic";

export default async function AdminNouveauBilletPage() {
  const evenement = await obtenirEvenementActif(db);

  if (!evenement) {
    return (
      <div className="flex flex-col gap-3 px-4 py-6 sm:px-6 sm:py-8 md:px-9">
        <h1 className="font-display font-extrabold text-[24px] tracking-tight sm:text-[30px]">
          Billet de permanence
        </h1>
        <div className="text-[14px] text-muted">
          Aucun événement actif.{" "}
          <Link href="/admin" className="font-bold text-accent-3 underline">
            Crée-en un
          </Link>{" "}
          avant de vendre des billets.
        </div>
      </div>
    );
  }

  return (
    <NouveauBilletContent
      prix={{
        billet: evenement.prixBilletCentimes,
        ticketBoisson: evenement.prixTicketBoissonCentimes,
      }}
    />
  );
}
