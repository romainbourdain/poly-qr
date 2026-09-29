import { FeatureCard } from "@/client/components/home/feature-card";
export default function Home() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-4xl flex-col gap-12 px-6 py-16">
      <div className="flex flex-col gap-3">
        <div className="font-bold text-[12px] text-muted uppercase tracking-[0.18em]">
          BDE TPS · Prototype
        </div>
        <h1 className="font-display font-extrabold text-4xl tracking-tight sm:text-5xl">
          PolyQR
        </h1>
        <p className="max-w-xl text-[15px] text-muted leading-relaxed">
          Démo cliquable du système de QR code d&apos;entrée. Ce prototype sert
          à valider le parcours, pas à gérer une vraie soirée.
        </p>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <FeatureCard
          href="/billet"
          eyebrow="Participant"
          title="Voir un billet"
          desc="L'écran reçu par email après paiement, avec le QR et les tickets boisson."
          cta="Ouvrir le billet"
          accent="#6C4BF0"
        />
        <FeatureCard
          href="/admin"
          eyebrow="Organisateurs"
          title="Espace admin"
          desc="Événements, billets de permanence, liste des billets et accès au scanner de chaque événement."
          cta="Ouvrir l'admin"
          accent="#FFB020"
        />
      </div>
    </main>
  );
}
