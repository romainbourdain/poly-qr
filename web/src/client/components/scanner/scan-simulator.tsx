"use client";

import { useState } from "react";
import { Badge } from "@/client/components/ui/badge";
import { Button } from "@/client/components/ui/button";
import { STATUT_BADGE_VARIANT } from "@/shared/lib/tickets";
import type { Ticket } from "@/shared/lib/types";

const STATUT_SIMULATOR_LABEL: Record<Ticket["statut"], string> = {
  non_scanne: "à scanner",
  scanne: "scanné",
  invalide: "invalidé",
};

function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={open ? "rotate-180" : ""}
      aria-hidden="true"
    >
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}

export function ScanSimulator({
  tickets,
  onSimulate,
  onSimulateUnknown,
}: {
  tickets: Ticket[];
  onSimulate: (id: string) => void;
  onSimulateUnknown: () => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex flex-col gap-2 pb-4">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex h-10 items-center justify-center gap-1.5 font-semibold text-[13px] text-muted"
      >
        {open ? "Masquer" : "Pas de caméra sous la main ?"}
        <ChevronIcon open={open} />
      </button>

      {open && (
        <>
          <div className="font-bold text-[11px] text-faint uppercase tracking-[0.12em]">
            Simuler un scan
          </div>
          <div className="flex max-h-48 flex-col gap-1.5 overflow-y-auto pr-1">
            {tickets.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => onSimulate(t.id)}
                className="flex items-center gap-3 rounded-xl border border-line-2 bg-ink-3 px-3.5 py-2.5 text-left"
              >
                <span className="flex-1 truncate font-semibold text-[13.5px]">
                  {t.nom}
                </span>
                <span className="text-[11.5px] text-muted">
                  {t.entrees > 1 ? `${t.entrees} entrées` : "1 entrée"}
                </span>
                <Badge
                  variant={STATUT_BADGE_VARIANT[t.statut]}
                  className="px-2 py-0.5 text-[10.5px]"
                >
                  {STATUT_SIMULATOR_LABEL[t.statut]}
                </Badge>
              </button>
            ))}
          </div>
          <Button
            variant="secondary"
            onClick={onSimulateUnknown}
            className="mt-1 h-11 text-[13.5px] text-muted"
          >
            Simuler un QR inconnu
          </Button>
        </>
      )}
    </div>
  );
}
