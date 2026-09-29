"use client";

import { useState, useTransition } from "react";
import { TicketListMobile } from "@/client/components/admin/ticket-list-mobile";
import { TicketSearchInput } from "@/client/components/admin/ticket-search-input";
import { TicketStatusTabs } from "@/client/components/admin/ticket-status-tabs";
import { TicketTableDesktop } from "@/client/components/admin/ticket-table-desktop";
import { Button } from "@/client/components/ui/button";
import { useTicketFilters } from "@/client/hooks/use-ticket-filters";
import {
  invaliderBilletAction,
  reactiverBilletAction,
} from "@/server/actions/tickets";
import { GENERIC_SERVER_ERROR } from "@/shared/lib/form-errors";
import type { BilletAdmin, Statut } from "@/shared/lib/types";

export function AdminBilletsContent({
  billets,
  stats,
}: {
  billets: BilletAdmin[];
  stats: { total: number; scannes: number };
}) {
  const { query, setQuery, statut, setStatut } = useTicketFilters();
  const [, startTransition] = useTransition();
  const [erreur, setErreur] = useState<string | null>(null);

  function toggleStatut(billetId: string, statutActuel: Statut) {
    setErreur(null);
    startTransition(async () => {
      const result =
        statutActuel === "invalide"
          ? await reactiverBilletAction(billetId)
          : await invaliderBilletAction(billetId);
      if (result?.serverError || result?.validationErrors) {
        setErreur(result.serverError ?? GENERIC_SERVER_ERROR);
      }
    });
  }

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
        <Button
          variant="secondary"
          disabled
          title="Démo : export désactivé"
          className="h-10.5 px-4.5 text-[14px]"
        >
          Exporter en CSV
        </Button>
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

      {billets.length === 0 ? (
        <div className="rounded-2xl border border-line bg-ink-2 px-6 py-8 text-center text-[14px] text-muted">
          Aucun billet ne correspond.
        </div>
      ) : (
        <>
          <TicketTableDesktop billets={billets} onToggleStatut={toggleStatut} />
          <TicketListMobile billets={billets} onToggleStatut={toggleStatut} />
        </>
      )}
    </div>
  );
}
