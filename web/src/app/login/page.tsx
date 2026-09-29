import { LoginForm } from "@/client/components/login/login-form";
import { db } from "@/server/db/client";
import { obtenirEvenementActif } from "@/server/services/evenements";

export const dynamic = "force-dynamic";

export default async function LoginPage() {
  const evenement = await obtenirEvenementActif(db);

  return (
    <main className="mx-auto flex min-h-screen max-w-sm flex-col justify-center gap-8 px-7">
      <div className="flex flex-col gap-2.5">
        <div className="flex size-13 items-center justify-center rounded-2xl bg-accent">
          <svg
            width="27"
            height="27"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#fff"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M3 7V5a2 2 0 0 1 2-2h2M17 3h2a2 2 0 0 1 2 2v2M21 17v2a2 2 0 0 1-2 2h-2M7 21H5a2 2 0 0 1-2-2v-2M3 12h18" />
          </svg>
        </div>
        <h1 className="font-display font-extrabold text-[34px] tracking-tight">
          Accès équipe
        </h1>
        <div className="text-[15px] text-muted leading-relaxed">
          {evenement
            ? `${evenement.nom} · ${evenement.date}`
            : "Aucun événement actif"}
          <br />
          Entre le mot de passe donné par l&apos;organisateur.
        </div>
      </div>

      <LoginForm />

      <div className="flex items-start gap-2.5 rounded-2xl border border-[#262636] bg-[#171722] p-4 text-[12.5px] text-muted leading-relaxed">
        <svg
          width="17"
          height="17"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#A5A2BC"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="mt-0.5 shrink-0"
          aria-hidden="true"
        >
          <rect x="4" y="10" width="16" height="11" rx="2" />
          <path d="M8 10V7a4 4 0 0 1 8 0v3" />
        </svg>
        <span>
          Un seul mot de passe partagé entre tous les bénévoles, donné par
          l&apos;organisateur pour la soirée.
        </span>
      </div>
    </main>
  );
}
