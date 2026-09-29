import { createSearchParamsCache } from "nuqs/server";
import { BilletIntrouvable } from "@/client/components/billet/billet-introuvable";
import { BilletPdfLink } from "@/client/components/billet/billet-pdf-link";
import { BilletQrCard } from "@/client/components/billet/billet-qr-card";
import { BilletSwiper } from "@/client/components/billet/billet-swiper";
import { obtenirCommandeAction } from "@/server/actions/tickets";
import { db } from "@/server/db/client";
import { obtenirEvenementDeCommande } from "@/server/services/evenements";
import { billetSearchParams } from "@/shared/lib/search-params";

const searchParamsCache = createSearchParamsCache(billetSearchParams);

export default async function BilletPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { commande: commandeId } = await searchParamsCache.parse(searchParams);
  const commande = commandeId
    ? ((await obtenirCommandeAction(commandeId))?.data ?? null)
    : null;

  const evenement = commande
    ? await obtenirEvenementDeCommande(db, commande.commandeId)
    : null;

  if (!commande || !evenement || commande.billets.length === 0) {
    return <BilletIntrouvable />;
  }

  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col px-6 py-7">
      <div className="flex flex-col gap-1.5">
        <div className="font-bold text-[12px] text-muted uppercase tracking-[0.18em]">
          BDE TPS
        </div>
        <h1 className="font-display font-extrabold text-3xl tracking-tight">
          {evenement.nom}
        </h1>
        <div className="text-[14px] text-muted">
          {evenement.date} · {evenement.heure} · {evenement.lieu}
        </div>
      </div>

      <div className="flex flex-1 flex-col justify-center gap-3 py-5">
        {commande.billets.length > 1 ? (
          <BilletSwiper billets={commande.billets} />
        ) : (
          <BilletQrCard billet={commande.billets[0]} />
        )}

        <BilletPdfLink commandeId={commande.commandeId} />
      </div>
    </main>
  );
}
