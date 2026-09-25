"use client";

import { useMemo, useState } from "react";
import { useStore } from "@/lib/store";
import type { Statut } from "@/lib/types";

const FILTERS: { key: "tous" | Statut; label: string }[] = [
  { key: "tous", label: "Tous" },
  { key: "scanne", label: "Scannés" },
  { key: "non_scanne", label: "Pas encore" },
  { key: "invalide", label: "Invalidés" },
];

const STATUT_LABEL: Record<Statut, string> = {
  non_scanne: "Pas encore scanné",
  scanne: "Scanné",
  invalide: "Invalidé",
};

const STATUT_COLOR: Record<Statut, string> = {
  non_scanne: "#A5A2BC",
  scanne: "#63E2A8",
  invalide: "#FF8A8A",
};

export default function AdminBilletsPage() {
  const { tickets, invalidateTicket, reactivateTicket } = useStore();
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<"tous" | Statut>("tous");

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return tickets.filter((t) => {
      if (filter !== "tous" && t.statut !== filter) return false;
      if (!q) return true;
      return (
        t.nom.toLowerCase().includes(q) || t.email.toLowerCase().includes(q)
      );
    });
  }, [tickets, query, filter]);

  const totalBillets = tickets.length;
  const totalEntrees = tickets.reduce((s, t) => s + t.entrees, 0);
  const scannees = tickets
    .filter((t) => t.statut === "scanne")
    .reduce((s, t) => s + t.entrees, 0);

  return (
    <div className="flex flex-col gap-4 px-4 py-6 sm:gap-5 sm:px-6 sm:py-8 md:px-9">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:gap-5">
        <div className="flex flex-1 flex-col gap-1">
          <h1 className="font-display text-[24px] font-extrabold tracking-tight sm:text-[30px]">
            Billets
          </h1>
          <div className="text-[14px] text-muted">
            Soirée d&apos;hiver · {totalBillets} billets · {totalEntrees}{" "}
            entrées · {scannees} déjà scannées
          </div>
        </div>
        <button
          type="button"
          disabled
          title="Démo : export désactivé"
          className="flex h-10.5 shrink-0 cursor-not-allowed items-center gap-2 rounded-[11px] border border-line-2 bg-ink-3 px-4.5 text-[14px] font-semibold opacity-60"
        >
          Exporter en CSV
        </button>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex flex-1 items-center">
          <svg
            className="pointer-events-none absolute left-3.5"
            width="17"
            height="17"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#8B88A3"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <circle cx="11" cy="11" r="7" />
            <path d="m20 20-3.5-3.5" />
          </svg>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Rechercher un nom ou un email…"
            aria-label="Rechercher un billet"
            className="h-11.5 w-full rounded-xl border border-line-2 bg-ink-3 py-0 pr-4 pl-10.5 text-[14.5px] outline-none focus:border-accent"
          />
        </div>
        <div className="-mx-4 flex gap-1.5 overflow-x-auto px-4 sm:mx-0 sm:px-0">
          {FILTERS.map((f) => (
            <button
              key={f.key}
              type="button"
              onClick={() => setFilter(f.key)}
              className={`h-11.5 shrink-0 rounded-xl border px-4 text-[13.5px] font-semibold ${
                filter === f.key
                  ? "border-[#3B3B55] bg-[#252538] font-bold text-fg"
                  : "border-line-2 bg-ink-3 text-muted"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {rows.length === 0 ? (
        <div className="rounded-2xl border border-line bg-ink-2 px-6 py-8 text-center text-[14px] text-muted">
          Aucun billet ne correspond.
        </div>
      ) : (
        <>
          {/* Desktop table */}
          <div className="hidden overflow-hidden rounded-2xl border border-line bg-ink-2 md:block">
            <div className="grid grid-cols-[2fr_1fr_0.7fr_0.8fr_1.2fr_0.9fr] gap-3.5 border-b border-line bg-[#1B1B27] px-6 py-3.5">
              {["Participant", "Origine", "Entrées", "Boissons", "Statut", "Action"].map(
                (h, i) => (
                  <span
                    key={h}
                    className={`text-[11.5px] font-bold tracking-[0.1em] text-[#8B88A3] uppercase ${
                      i === 5 ? "text-right" : ""
                    }`}
                  >
                    {h}
                  </span>
                ),
              )}
            </div>

            {rows.map((t) => (
              <div
                key={t.id}
                className="grid grid-cols-[2fr_1fr_0.7fr_0.8fr_1.2fr_0.9fr] items-center gap-3.5 border-b border-[#22222F] px-6 py-3.5 last:border-0"
              >
                <div className="flex min-w-0 flex-col gap-0.5">
                  <span className="truncate text-[14.5px] font-bold">
                    {t.nom}
                  </span>
                  <span className="truncate text-[12.5px] text-[#8B88A3]">
                    {t.email}
                  </span>
                </div>
                <span className="text-[13.5px] text-[#C7C4DA]">
                  {t.origine === "helloasso" ? "HelloAsso" : "Permanence"}
                </span>
                <div>
                  <span className="inline-flex items-center rounded-full border border-line-2 bg-ink-4 px-2.5 py-1 text-[13px] font-bold text-[#C7C4DA]">
                    {t.entrees}
                  </span>
                </div>
                <span className="text-[14.5px] font-bold">
                  {t.ticketsBoisson}
                </span>
                <span
                  className="text-[13px] font-bold"
                  style={{ color: STATUT_COLOR[t.statut] }}
                >
                  {STATUT_LABEL[t.statut]}
                  {t.statut === "scanne" && t.scanneA ? ` · ${t.scanneA}` : ""}
                </span>
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() =>
                      t.statut === "invalide"
                        ? reactivateTicket(t.id)
                        : invalidateTicket(t.id)
                    }
                    className="h-8.5 rounded-[9px] border border-line-2 bg-ink-4 px-3.5 text-[12.5px] font-semibold text-[#C7C4DA]"
                  >
                    {t.statut === "invalide" ? "Réactiver" : "Invalider"}
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Mobile cards */}
          <div className="flex flex-col gap-2.5 md:hidden">
            {rows.map((t) => (
              <div
                key={t.id}
                className="flex flex-col gap-3 rounded-2xl border border-line bg-ink-2 px-4 py-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex min-w-0 flex-col gap-0.5">
                    <span className="truncate text-[15px] font-bold">
                      {t.nom}
                    </span>
                    <span className="truncate text-[12.5px] text-[#8B88A3]">
                      {t.email}
                    </span>
                  </div>
                  <span
                    className="shrink-0 text-right text-[12.5px] font-bold"
                    style={{ color: STATUT_COLOR[t.statut] }}
                  >
                    {STATUT_LABEL[t.statut]}
                    {t.statut === "scanne" && t.scanneA
                      ? ` · ${t.scanneA}`
                      : ""}
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-2 text-[12.5px] text-[#C7C4DA]">
                  <span className="rounded-full border border-line-2 bg-ink-4 px-2.5 py-1 font-semibold">
                    {t.origine === "helloasso" ? "HelloAsso" : "Permanence"}
                  </span>
                  <span className="rounded-full border border-line-2 bg-ink-4 px-2.5 py-1 font-semibold">
                    {t.entrees} entrée{t.entrees > 1 ? "s" : ""}
                  </span>
                  <span className="rounded-full border border-line-2 bg-ink-4 px-2.5 py-1 font-semibold">
                    {t.ticketsBoisson} ticket{t.ticketsBoisson > 1 ? "s" : ""}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    t.statut === "invalide"
                      ? reactivateTicket(t.id)
                      : invalidateTicket(t.id)
                  }
                  className="flex h-10 items-center justify-center rounded-[10px] border border-line-2 bg-ink-4 text-[13px] font-semibold text-[#C7C4DA]"
                >
                  {t.statut === "invalide" ? "Réactiver" : "Invalider"}
                </button>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
