"use client";

import { useState } from "react";
import { Badge } from "@/client/components/ui/badge";
import { Button } from "@/client/components/ui/button";
import { STATUT_BADGE_VARIANT } from "@/shared/lib/tickets";
import type { BilletSimulable, Statut } from "@/shared/lib/types";

const STATUT_SIMULATOR_LABEL: Record<Statut, string> = {
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
  billets,
  onSimulate,
  onSimulateUnknown,
}: {
  billets: BilletSimulable[];
  onSimulate: (code: string) => void;
  onSimulateUnknown: () => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex flex-col gap-2 pb-4">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex h-11 items-center justify-center gap-1.5 font-semibold text-[14px] text-muted"
      >
        {open ? "Masquer" : "Pas de caméra sous la main ?"}
        <ChevronIcon open={open} />
      </button>

      {open && (
        <>
          <div className="font-bold text-[12px] text-faint uppercase tracking-[0.12em]">
            Simuler un scan
          </div>
          <div className="flex max-h-48 flex-col gap-1.5 overflow-y-auto pr-1">
            {billets.map((b) => (
              <button
                key={b.code}
                type="button"
                onClick={() => onSimulate(b.code)}
                className="flex min-h-11 items-center gap-3 rounded-xl border border-line-2 bg-ink-3 px-3.5 py-2.5 text-left"
              >
                <span className="flex-1 truncate font-semibold text-[13.5px]">
                  {b.nom}
                </span>
                <Badge
                  variant={STATUT_BADGE_VARIANT[b.statut]}
                  className="px-2 py-0.5 text-[12px]"
                >
                  {STATUT_SIMULATOR_LABEL[b.statut]}
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
