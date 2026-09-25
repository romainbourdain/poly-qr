"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import type { Origine, ScanOutcome, Ticket } from "./types";
export { EVENT } from "./event";

function nowLabel(): string {
  const d = new Date();
  const h = d.getHours().toString().padStart(2, "0");
  const m = d.getMinutes().toString().padStart(2, "0");
  return `${h}h${m}`;
}

function genCode(): string {
  return Math.random().toString(36).slice(2, 6).toUpperCase();
}

function genId(): string {
  return `t_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
}

const SEED: Ticket[] = [
  {
    id: "t1",
    code: "92KX",
    nom: "Camille Moreau",
    email: "camille.moreau@etu-poly.fr",
    origine: "helloasso",
    entrees: 4,
    ticketsBoisson: 12,
    statut: "scanne",
    scanneA: "22h51",
    scannePar: "Léa",
    creeA: "2 mars",
  },
  {
    id: "t2",
    code: "5H1D",
    nom: "Sacha Lemoine",
    email: "sacha.lemoine@etu-poly.fr",
    origine: "permanence",
    entrees: 3,
    ticketsBoisson: 6,
    statut: "non_scanne",
    scanneA: null,
    scannePar: null,
    creeA: "9 mars",
  },
  {
    id: "t3",
    code: "A7F2",
    nom: "Inès Chauvet",
    email: "ines.chauvet@etu-poly.fr",
    origine: "permanence",
    entrees: 1,
    ticketsBoisson: 3,
    statut: "scanne",
    scanneA: "22h12",
    scannePar: "Léa",
    creeA: "8 mars",
  },
  {
    id: "t4",
    code: "QW3M",
    nom: "Tom Bardet",
    email: "tom.bardet@etu-poly.fr",
    origine: "permanence",
    entrees: 2,
    ticketsBoisson: 0,
    statut: "non_scanne",
    scanneA: null,
    scannePar: null,
    creeA: "9 mars",
  },
  {
    id: "t5",
    code: "PL9R",
    nom: "Manon Riel",
    email: "manon.riel@etu-poly.fr",
    origine: "helloasso",
    entrees: 1,
    ticketsBoisson: 5,
    statut: "scanne",
    scanneA: "23h04",
    scannePar: "Léa",
    creeA: "1 mars",
  },
  {
    id: "t6",
    code: "K2VN",
    nom: "Yanis Perret",
    email: "yanis.perret@etu-poly.fr",
    origine: "helloasso",
    entrees: 1,
    ticketsBoisson: 1,
    statut: "invalide",
    scanneA: null,
    scannePar: null,
    creeA: "3 mars",
  },
  {
    id: "t7",
    code: "8DTS",
    nom: "Louise Ferrand",
    email: "louise.ferrand@etu-poly.fr",
    origine: "helloasso",
    entrees: 1,
    ticketsBoisson: 4,
    statut: "scanne",
    scanneA: "22h58",
    scannePar: "Léa",
    creeA: "4 mars",
  },
  {
    id: "t8",
    code: "N4XZ",
    nom: "Noé Vasseur",
    email: "noe.vasseur@etu-poly.fr",
    origine: "helloasso",
    entrees: 5,
    ticketsBoisson: 10,
    statut: "non_scanne",
    scanneA: null,
    scannePar: null,
    creeA: "5 mars",
  },
];

interface StoreShape {
  tickets: Ticket[];
  getTicket(id: string): Ticket | undefined;
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

const StoreContext = createContext<StoreShape | null>(null);

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [tickets, setTickets] = useState<Ticket[]>(SEED);

  const getTicket = useCallback(
    (id: string) => tickets.find((t) => t.id === id),
    [tickets],
  );

  const addTicket = useCallback(
    (input: {
      nom: string;
      email: string;
      entrees: number;
      ticketsBoisson: number;
    }): Ticket => {
      const ticket: Ticket = {
        id: genId(),
        code: genCode(),
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
      setTickets((prev) => [ticket, ...prev]);
      return ticket;
    },
    [],
  );

  const scanTicket = useCallback(
    (id: string): ScanOutcome => {
      const ticket = tickets.find((t) => t.id === id);
      if (!ticket) return { type: "inconnu" };
      if (ticket.statut === "invalide") return { type: "invalide", ticket };
      if (ticket.statut === "scanne") return { type: "deja_scanne", ticket };
      const updated: Ticket = {
        ...ticket,
        statut: "scanne",
        scanneA: nowLabel(),
        scannePar: "Léa",
      };
      setTickets((prev) => prev.map((t) => (t.id === id ? updated : t)));
      return { type: "valide", ticket: updated };
    },
    [tickets],
  );

  const invalidateTicket = useCallback((id: string) => {
    setTickets((prev) =>
      prev.map((t) => (t.id === id ? { ...t, statut: "invalide" } : t)),
    );
  }, []);

  const reactivateTicket = useCallback((id: string) => {
    setTickets((prev) =>
      prev.map((t) =>
        t.id === id
          ? { ...t, statut: "non_scanne", scanneA: null, scannePar: null }
          : t,
      ),
    );
  }, []);

  const value = useMemo<StoreShape>(
    () => ({
      tickets,
      getTicket,
      addTicket,
      scanTicket,
      invalidateTicket,
      reactivateTicket,
    }),
    [tickets, getTicket, addTicket, scanTicket, invalidateTicket, reactivateTicket],
  );

  return (
    <StoreContext.Provider value={value}>{children}</StoreContext.Provider>
  );
}

export function useStore(): StoreShape {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used within a StoreProvider");
  return ctx;
}
