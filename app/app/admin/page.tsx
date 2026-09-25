"use client";

import { EVENT, useStore } from "@/lib/store";

function Stat({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="flex flex-col gap-1 rounded-[14px] bg-ink-4 px-4.5 py-4">
      <span className="text-[12px] font-semibold text-muted">{label}</span>
      <span className="font-display text-[28px] font-extrabold tracking-tight">
        {value}
      </span>
    </div>
  );
}

export default function AdminEvenementsPage() {
  const { tickets } = useStore();

  const billets = tickets.length;
  const entreesVendues = tickets.reduce((s, t) => s + t.entrees, 0);
  const entreesScannees = tickets
    .filter((t) => t.statut === "scanne")
    .reduce((s, t) => s + t.entrees, 0);
  const ticketsBoissonDus = tickets.reduce((s, t) => s + t.ticketsBoisson, 0);

  return (
    <div className="flex flex-col gap-6 px-9 py-8">
      <div className="flex items-end gap-5">
        <div className="flex flex-1 flex-col gap-1">
          <h1 className="font-display text-[30px] font-extrabold tracking-tight">
            Événements
          </h1>
          <div className="text-[14px] text-muted">
            Un événement = une liste de billets, un mot de passe, un
            formulaire HelloAsso.
          </div>
        </div>
        <button
          type="button"
          disabled
          className="flex h-11 cursor-not-allowed items-center gap-2 rounded-[11px] bg-accent px-5 text-[14.5px] font-bold text-white opacity-60"
          title="Démo : un seul événement"
        >
          + Nouvel événement
        </button>
      </div>

      <div className="flex flex-col gap-5 rounded-[18px] border border-line bg-ink-2 px-7 py-6.5">
        <div className="flex items-start gap-4">
          <div className="flex flex-1 flex-col gap-1.5">
            <div className="flex items-center gap-2.5">
              <span className="font-display text-[23px] font-bold tracking-tight">
                {EVENT.nom}
              </span>
              <span className="rounded-full border border-good-line bg-good-bg px-2.5 py-1 text-[11.5px] font-bold tracking-wide text-good">
                EN COURS
              </span>
            </div>
            <div className="text-[13.5px] text-muted">
              {EVENT.date} · {EVENT.heure} · {EVENT.lieu}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-3.5">
          <Stat label="Billets émis" value={billets} />
          <Stat label="Entrées vendues" value={entreesVendues} />
          <Stat label="Entrées scannées" value={entreesScannees} />
          <Stat label="Tickets boisson dus" value={ticketsBoissonDus} />
        </div>

        <div className="h-px bg-line" />

        <div className="grid grid-cols-2 gap-6.5">
          <div className="flex flex-col gap-2">
            <label className="text-[12.5px] font-bold text-muted">
              Formulaire HelloAsso relié
            </label>
            <input
              readOnly
              value="helloasso.com/associations/poly/evenements/soiree-hiver"
              className="h-11.5 w-full rounded-[11px] border border-line-2 bg-ink-3 px-3.5 text-[13.5px] text-fg"
            />
            <div className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-good" />
              <span className="text-[12.5px] text-muted">
                Démo : pas de vrai webhook branché
              </span>
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-[12.5px] font-bold text-muted">
              Mot de passe bénévoles
            </label>
            <input
              readOnly
              value={EVENT.motDePasse}
              className="h-11.5 w-full rounded-[11px] border border-line-2 bg-ink-3 px-3.5 text-[15px] tracking-wide text-fg"
            />
            <div className="text-[12.5px] text-muted">
              À donner aux bénévoles du poste d&apos;entrée le soir même.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
