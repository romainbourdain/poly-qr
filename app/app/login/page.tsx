"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { EVENT } from "@/lib/store";

export default function LoginPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password === EVENT.motDePasse) {
      router.push("/scanner");
    } else {
      setError(true);
    }
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-sm flex-col justify-center gap-8 px-7">
      <div className="flex flex-col gap-2.5">
        <div className="flex h-13 w-13 items-center justify-center rounded-2xl bg-accent">
          <svg width="27" height="27" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M3 7V5a2 2 0 0 1 2-2h2M17 3h2a2 2 0 0 1 2 2v2M21 17v2a2 2 0 0 1-2 2h-2M7 21H5a2 2 0 0 1-2-2v-2M3 12h18" />
          </svg>
        </div>
        <h1 className="font-display text-[34px] font-extrabold tracking-tight">
          Accès équipe
        </h1>
        <div className="text-[15px] leading-relaxed text-muted">
          {EVENT.nom} · {EVENT.date}
          <br />
          Entre le mot de passe donné par l&apos;organisateur.
        </div>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
        <div className="flex flex-col gap-2">
          <label htmlFor="pwd" className="text-[13px] font-bold text-muted">
            Mot de passe de la soirée
          </label>
          <input
            id="pwd"
            type="password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              setError(false);
            }}
            placeholder="hangar2026"
            className="h-13.5 w-full rounded-2xl border border-line-2 bg-ink-3 px-4 font-mono text-[17px] tracking-wider text-fg outline-none focus:border-accent"
          />
          {error && (
            <div className="text-[13px] font-semibold text-bad">
              Mot de passe incorrect.
            </div>
          )}
        </div>
        <button
          type="submit"
          className="flex h-13.5 items-center justify-center rounded-2xl bg-accent text-[16px] font-bold text-white"
        >
          Ouvrir le scanner
        </button>
      </form>

      <div className="flex items-start gap-2.5 rounded-2xl border border-[#262636] bg-[#171722] px-4 py-4 text-[12.5px] leading-relaxed text-muted">
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#A5A2BC" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mt-0.5 shrink-0" aria-hidden="true">
          <rect x="4" y="10" width="16" height="11" rx="2" />
          <path d="M8 10V7a4 4 0 0 1 8 0v3" />
        </svg>
        <span>
          Démo : mot de passe pré-rempli côté aide-mémoire sur la page
          d&apos;accueil, un seul mot de passe partagé entre tous les
          bénévoles.
        </span>
      </div>
    </main>
  );
}
