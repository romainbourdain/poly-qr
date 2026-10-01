"use client";

import { useState, useTransition } from "react";
import type { BilletActions } from "@/client/components/admin/billet-actions-menu";
import { ModifierBilletDialog } from "@/client/components/admin/modifier-billet-dialog";
import { TicketPagination } from "@/client/components/admin/ticket-pagination";
import { TicketSearchInput } from "@/client/components/admin/ticket-search-input";
import { TicketStatusTabs } from "@/client/components/admin/ticket-status-tabs";
import { TicketTableDesktop } from "@/client/components/admin/ticket-table-desktop";
import { buttonVariants } from "@/client/components/ui/button";
import { useTicketFilters } from "@/client/hooks/use-ticket-filters";
import {
  invaliderBilletAction,
  reactiverBilletAction,
  renvoyerEmailCommandeAction,
} from "@/server/actions/tickets";
import { cn } from "@/shared/lib/cn";
import { GENERIC_SERVER_ERROR } from "@/shared/lib/form-errors";
import type { BilletAdmin } from "@/shared/lib/types";

export function AdminBilletsContent({
  evenementId,
  billets,
  totalPages,
  stats,
}: {
  evenementId: string;
  billets: BilletAdmin[];
  totalPages: number;
  stats: { total: number; scannes: number };
}) {
  const {
    query,
    setQuery,
    statut,
    setStatut,
    tri,
    ordre,
    setTri,
    page,
    setPage,
  } = useTicketFilters();
  const [, startTransition] = useTransition();
  const [erreur, setErreur] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [enEdition, setEnEdition] = useState<BilletAdmin | null>(null);

  function lancer(
    action: () => Promise<
      { serverError?: string; validationErrors?: unknown } | undefined
    >,
    succes?: string,
  ) {
    setErreur(null);
    setInfo(null);
    startTransition(async () => {
      const result = await action();
      if (result?.serverError || result?.validationErrors) {
        setErreur(result.serverError ?? GENERIC_SERVER_ERROR);
      } else if (succes) {
        setInfo(succes);
      }
    });
  }

  const actions: BilletActions = {
    onModifier: setEnEdition,
    onToggleStatut: (billet) =>
      lancer(() =>
        billet.statut === "invalide"
          ? reactiverBilletAction(billet.id)
          : invaliderBilletAction(billet.id),
      ),
    onRenvoyerEmail: (billet) =>
      lancer(
        () => renvoyerEmailCommandeAction(billet.commandeId),
        `Email renvoyé à ${billet.email}.`,
      ),
    onCopierLien: (billet) =>
      lancer(async () => {
        try {
          await navigator.clipboard.writeText(
            `${window.location.origin}/billet?commande=${billet.commandeId}`,
          );
          return undefined;
        } catch {
          return { serverError: "Impossible de copier le lien." };
        }
      }, "Lien du billet copié."),
  };

  return (
    <div className="flex flex-col gap-4 px-4 py-6 sm:gap-5 sm:px-6 sm:py-8 md:px-9">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:gap-5">
        <div className="flex flex-1 flex-col gap-1">
          <h1 className="font-display font-extrabold text-[24px] tracking-tight sm:text-[30px]">
            Billets
          </h1>
          <div className="text-[14px] text-muted">
            {stats.total} billet{stats.total > 1 ? "s" : ""} · {stats.scannes}{" "}
            déjà scanné{stats.scannes > 1 ? "s" : ""}
          </div>
        </div>
        <a
          href={`/admin/billets/export?evenement=${evenementId}`}
          download
          className={cn(
            buttonVariants({ variant: "secondary" }),
            "h-10.5 px-4.5 text-[14px]",
          )}
        >
          Exporter en CSV
        </a>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <TicketSearchInput value={query} onChange={setQuery} />
        <TicketStatusTabs value={statut} onChange={setStatut} />
      </div>

      {erreur && (
        <div role="alert" className="font-semibold text-[13px] text-bad">
          {erreur}
        </div>
      )}
      {info && !erreur && (
        <div role="status" className="font-semibold text-[13px] text-good">
          {info}
        </div>
      )}

      {billets.length === 0 ? (
        <div className="rounded-2xl border border-line bg-ink-2 px-6 py-8 text-center text-[14px] text-muted">
          Aucun billet ne correspond.
        </div>
      ) : (
        <TicketTableDesktop
          billets={billets}
          actions={actions}
          tri={tri}
          ordre={ordre}
          onSort={setTri}
        />
      )}

      <ModifierBilletDialog
        billet={enEdition}
        onClose={() => setEnEdition(null)}
      />

      <TicketPagination
        page={page}
        totalPages={totalPages}
        onPageChange={setPage}
      />
    </div>
  );
}
