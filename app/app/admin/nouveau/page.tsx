"use client";

import { useState } from "react";
import { useStore } from "@/lib/store";
import type { Ticket } from "@/lib/types";

function Stepper({
  label,
  hint,
  value,
  onChange,
  min = 0,
}: {
  label: string;
  hint: string;
  value: number;
  onChange: (v: number) => void;
  min?: number;
}) {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-[13px] font-bold text-muted">{label}</label>
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-3">
          <button
            type="button"
            aria-label="Diminuer"
            onClick={() => onChange(Math.max(min, value - 1))}
            className="flex h-12.5 w-12.5 shrink-0 items-center justify-center rounded-xl border border-line-2 bg-ink-4"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#EDEBF5" strokeWidth="2.4" strokeLinecap="round" aria-hidden="true">
              <path d="M5 12h14" />
            </svg>
          </button>
          <div className="flex h-12.5 w-21 shrink-0 items-center justify-center rounded-xl border border-line-2 bg-ink-3 font-display text-[22px] font-bold">
            {value}
          </div>
          <button
            type="button"
            aria-label="Augmenter"
            onClick={() => onChange(value + 1)}
            className="flex h-12.5 w-12.5 shrink-0 items-center justify-center rounded-xl border border-line-2 bg-ink-4"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#EDEBF5" strokeWidth="2.4" strokeLinecap="round" aria-hidden="true">
              <path d="M12 5v14M5 12h14" />
            </svg>
          </button>
        </div>
        <span className="min-w-0 flex-1 basis-40 text-[13px] leading-snug whitespace-pre-line text-muted">
          {hint}
        </span>
      </div>
    </div>
  );
}

export default function AdminNouveauBilletPage() {
  const { addTicket } = useStore();
  const [nom, setNom] = useState("");
  const [email, setEmail] = useState("");
  const [entrees, setEntrees] = useState(1);
  const [boisson, setBoisson] = useState(0);
  const [session, setSession] = useState<Ticket[]>([]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!nom.trim() || !email.trim()) return;
    const ticket = addTicket({ nom: nom.trim(), email: email.trim(), entrees, ticketsBoisson: boisson });
    setSession((prev) => [ticket, ...prev]);
    setNom("");
    setEmail("");
    setEntrees(1);
    setBoisson(0);
  }

  return (
    <div className="flex flex-col gap-5 px-4 py-6 sm:gap-6 sm:px-6 sm:py-8 md:px-9">
      <div className="flex flex-col gap-1">
        <h1 className="font-display text-[24px] font-extrabold tracking-tight sm:text-[30px]">
          Billet de permanence
        </h1>
        <div className="text-[14px] text-muted">
          Pour une personne qui paye en main propre. Le QR part par email
          tout de suite (démo : rien n&apos;est réellement envoyé).
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 lg:gap-7">
        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-5 rounded-[18px] border border-line bg-ink-2 px-5 py-5.5 sm:px-7 sm:py-6.5"
        >
          <div className="flex flex-col gap-2">
            <label htmlFor="nom" className="text-[13px] font-bold text-muted">
              Nom et prénom
            </label>
            <input
              id="nom"
              value={nom}
              onChange={(e) => setNom(e.target.value)}
              placeholder="Sacha Lemoine"
              className="h-12.5 w-full rounded-xl border border-line-2 bg-ink-3 px-3.5 text-[15.5px] outline-none focus:border-accent"
            />
          </div>
          <div className="flex flex-col gap-2">
            <label htmlFor="mail" className="text-[13px] font-bold text-muted">
              Email
            </label>
            <input
              id="mail"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="sacha.lemoine@etu-poly.fr"
              className="h-12.5 w-full rounded-xl border border-line-2 bg-ink-3 px-3.5 text-[15.5px] outline-none focus:border-accent"
            />
            <span className="text-[12.5px] text-faint">
              C&apos;est l&apos;adresse qui recevra le QR code.
            </span>
          </div>

          <Stepper
            label="Nombre d'entrées sur ce billet"
            hint={"1 = une seule personne.\nAu-delà, tout le monde entre au même scan."}
            value={entrees}
            onChange={setEntrees}
            min={1}
          />
          <Stepper
            label="Tickets boisson achetés (total)"
            hint={"Remis en papier à l'entrée,\nen une fois, au scan du billet."}
            value={boisson}
            onChange={setBoisson}
          />

          <div className="h-px bg-line" />

          <button
            type="submit"
            className="flex h-13 items-center justify-center gap-2 rounded-[13px] bg-accent text-[15.5px] font-bold text-white"
          >
            Créer et envoyer le QR
          </button>
        </form>

        <div className="flex flex-col gap-4.5">
          <div className="flex flex-col gap-3 rounded-[18px] border border-line bg-ink-2 px-5 py-5 sm:px-6 sm:py-5.5">
            <div className="text-[12px] font-bold tracking-[0.14em] text-faint uppercase">
              Créés pendant cette permanence
            </div>
            {session.length === 0 ? (
              <div className="text-[13.5px] text-muted">
                Aucun billet créé pour l&apos;instant.
              </div>
            ) : (
              session.map((t, i) => (
                <div key={t.id} className="flex flex-col gap-3">
                  {i > 0 && <div className="h-px bg-[#262636]" />}
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                    <span className="flex-1 truncate text-[14.5px] font-semibold">
                      {t.nom}
                    </span>
                    <span className="text-[13px] text-muted">
                      {t.entrees} entrée{t.entrees > 1 ? "s" : ""} ·{" "}
                      {t.ticketsBoisson} ticket{t.ticketsBoisson > 1 ? "s" : ""}
                    </span>
                    <span className="text-[12.5px] font-semibold text-good">
                      envoyé
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
