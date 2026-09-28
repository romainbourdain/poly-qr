"use client";

import { create } from "zustand";
import { genTicketCode, genTicketId, nowLabel } from "@/shared/lib/tickets";
import type { Origine, ScanOutcome, Ticket } from "@/shared/lib/types";
import { MOCK_TICKETS } from "@/shared/mock/tickets";

interface TicketStoreState {
  tickets: Ticket[];
  addTicket(input: {
    nom: string;
    email: string;
    entrees: number;
    ticketsBoisson: number;
  }): Ticket;
  scanTicket(id: string): ScanOutcome;
  invalidateTicket(id: string): void;
  reactivateTicket(id: string): void;
}

export const useTicketStore = create<TicketStoreState>()((set, get) => ({
  tickets: MOCK_TICKETS,

  addTicket(input) {
    const ticket: Ticket = {
      id: genTicketId(),
      code: genTicketCode(),
      nom: input.nom,
      email: input.email,
      origine: "permanence" as Origine,
      entrees: input.entrees,
      ticketsBoisson: input.ticketsBoisson,
      statut: "non_scanne",
      scanneA: null,
      scannePar: null,
      creeA: "aujourd'hui",
    };
    set((state) => ({ tickets: [ticket, ...state.tickets] }));
    return ticket;
  },

  scanTicket(id) {
    const ticket = get().tickets.find((t) => t.id === id);
    if (!ticket) return { type: "inconnu" };
    if (ticket.statut === "invalide") return { type: "invalide", ticket };
    if (ticket.statut === "scanne") return { type: "deja_scanne", ticket };
    const updated: Ticket = {
      ...ticket,
      statut: "scanne",
      scanneA: nowLabel(),
      scannePar: "Léa",
    };
    set((state) => ({
      tickets: state.tickets.map((t) => (t.id === id ? updated : t)),
    }));
    return { type: "valide", ticket: updated };
  },

  invalidateTicket(id) {
    set((state) => ({
      tickets: state.tickets.map((t) =>
        t.id === id ? { ...t, statut: "invalide" } : t,
      ),
    }));
  },

  reactivateTicket(id) {
    set((state) => ({
      tickets: state.tickets.map((t) =>
        t.id === id
          ? { ...t, statut: "non_scanne", scanneA: null, scannePar: null }
          : t,
      ),
    }));
  },
}));
