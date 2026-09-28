import { createSearchParamsCache } from "nuqs/server";
import { BilletIntrouvable } from "@/client/components/billet/billet-introuvable";
import { BilletQrCard } from "@/client/components/billet/billet-qr-card";
import { BilletStatusCard } from "@/client/components/billet/billet-status-card";
import { BilletSwiper } from "@/client/components/billet/billet-swiper";
import { obtenirCommandeAction } from "@/server/actions/tickets";
import { billetSearchParams } from "@/shared/lib/search-params";
import { EVENT } from "@/shared/mock/event";

const searchParamsCache = createSearchParamsCache(billetSearchParams);

export default async function BilletPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { commande: commandeId } = await searchParamsCache.parse(searchParams);
  const commande = commandeId ? await obtenirCommandeAction(commandeId) : null;

  if (!commande || commande.billets.length === 0) {
    return <BilletIntrouvable />;
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col px-6 py-7">
      <div className="flex flex-col gap-1.5">
        <div className="font-bold text-[11px] text-muted uppercase tracking-[0.18em]">
          Association Poly
        </div>
        <h1 className="font-display font-extrabold text-3xl tracking-tight">
          {EVENT.nom}
        </h1>
        <div className="text-[14px] text-muted">
          {EVENT.date} · {EVENT.heure} · {EVENT.lieu}
        </div>
      </div>

      <div className="flex flex-1 flex-col justify-center gap-3 py-5">
        {commande.billets.length > 1 ? (
          <BilletSwiper nom={commande.nom} billets={commande.billets} />
        ) : (
          <>
            <BilletQrCard nom={commande.nom} billet={commande.billets[0]} />
            <BilletStatusCard billet={commande.billets[0]} />
          </>
        )}

        <div className="flex items-start gap-2.5 px-1 text-[12.5px] text-muted leading-relaxed">
          <span>
            Valable{" "}
            <strong className="font-bold text-fg">une seule fois</strong>. Monte
            la luminosité de ton écran avant de le présenter.
          </span>
        </div>
      </div>

      <div className="border-[#22222F] border-t pt-3.5 text-[12px] text-faint">
        Reçu par email après ton paiement HelloAsso.
      </div>
    </main>
  );
}
