import { FeatureCard } from "@/client/components/home/feature-card";
import { EVENT } from "@/shared/mock/event";

export default function Home() {
  return (
    <main className="mx-auto flex min-h-screen max-w-4xl flex-col gap-12 px-6 py-16">
      <div className="flex flex-col gap-3">
        <div className="font-bold text-[11px] text-muted uppercase tracking-[0.18em]">
          Association Poly · Prototype
        </div>
        <h1 className="font-display font-extrabold text-4xl tracking-tight sm:text-5xl">
          PolyQR
        </h1>
        <p className="max-w-xl text-[15px] text-muted leading-relaxed">
          Démo cliquable du système de QR code d&apos;entrée, pour la{" "}
          {EVENT.nom} ({EVENT.date}, {EVENT.lieu}). Les données sont factices et
          réinitialisées à chaque rechargement — ce prototype sert à valider le
          parcours, pas à gérer une vraie soirée.
        </p>
      </div>

      <div className="grid gap-5 sm:grid-cols-3">
        <FeatureCard
          href="/billet?id=t2"
          eyebrow="Participant"
          title="Voir un billet"
          desc="L'écran reçu par email après paiement, avec le QR et les tickets boisson."
          cta="Ouvrir le billet"
          accent="#6C4BF0"
        />
        <FeatureCard
          href="/login"
          eyebrow="Bénévole"
          title="Espace scanner"
          desc="Accès protégé par mot de passe, puis simulation de scans à l'entrée."
          cta="Ouvrir l'accès"
          accent="#45E0A0"
        />
        <FeatureCard
          href="/admin"
          eyebrow="Organisateurs"
          title="Espace admin"
          desc="Événement, création de billets de permanence, liste et invalidation."
          cta="Ouvrir l'admin"
          accent="#FFB020"
        />
      </div>

      <div className="rounded-2xl border border-line bg-ink-2 p-5 text-[13px] text-muted leading-relaxed">
        Mot de passe bénévole pour la démo :{" "}
        <span className="font-bold font-mono text-fg">{EVENT.motDePasse}</span>
      </div>
    </main>
  );
}
