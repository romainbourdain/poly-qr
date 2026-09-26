"use client";

import { Suspense, useMemo } from "react";
import { TicketListMobile } from "@/client/components/admin/ticket-list-mobile";
import { TicketSearchInput } from "@/client/components/admin/ticket-search-input";
import { TicketStatusTabs } from "@/client/components/admin/ticket-status-tabs";
import { TicketTableDesktop } from "@/client/components/admin/ticket-table-desktop";
import { Button } from "@/client/components/ui/button";
import { useTicketFilters } from "@/client/hooks/use-ticket-filters";
import { useTicketStore } from "@/client/store/ticket-store";
import type { Ticket } from "@/shared/lib/types";

function AdminBilletsContent() {
  const { tickets, invalidateTicket, reactivateTicket } = useTicketStore();
  const { query, setQuery, statut, setStatut } = useTicketFilters();

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return tickets.filter((t) => {
      if (statut !== "tous" && t.statut !== statut) return false;
      if (!q) return true;
      return (
        t.nom.toLowerCase().includes(q) || t.email.toLowerCase().includes(q)
      );
    });
  }, [tickets, query, statut]);

  function toggleStatut(ticket: Ticket) {
    if (ticket.statut === "invalide") reactivateTicket(ticket.id);
    else invalidateTicket(ticket.id);
  }

  const totalBillets = tickets.length;
  const totalEntrees = tickets.reduce((s, t) => s + t.entrees, 0);
  const scannees = tickets
    .filter((t) => t.statut === "scanne")
    .reduce((s, t) => s + t.entrees, 0);

  return (
    <div className="flex flex-col gap-4 px-4 py-6 sm:gap-5 sm:px-6 sm:py-8 md:px-9">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:gap-5">
        <div className="flex flex-1 flex-col gap-1">
          <h1 className="font-display font-extrabold text-[24px] tracking-tight sm:text-[30px]">
            Billets
          </h1>
          <div className="text-[14px] text-muted">
            Soirée d&apos;hiver · {totalBillets} billets · {totalEntrees}{" "}
            entrées · {scannees} déjà scannées
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

      {rows.length === 0 ? (
        <div className="rounded-2xl border border-line bg-ink-2 px-6 py-8 text-center text-[14px] text-muted">
          Aucun billet ne correspond.
        </div>
      ) : (
        <>
          <TicketTableDesktop tickets={rows} onToggleStatut={toggleStatut} />
          <TicketListMobile tickets={rows} onToggleStatut={toggleStatut} />
        </>
      )}
    </div>
  );
}

export default function AdminBilletsPage() {
  return (
    <Suspense>
      <AdminBilletsContent />
    </Suspense>
  );
}
