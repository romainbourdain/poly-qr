import Link from "next/link";
import { EVENT } from "@/lib/event";

function Card({
  href,
  eyebrow,
  title,
  desc,
  cta,
  accent,
}: {
  href: string;
  eyebrow: string;
  title: string;
  desc: string;
  cta: string;
  accent: string;
}) {
  return (
    <Link
      href={href}
      className="group flex flex-col gap-4 rounded-3xl border border-line bg-ink-2 p-7 transition hover:border-line-2 hover:bg-ink-3"
    >
      <div
        className="flex h-11 w-11 items-center justify-center rounded-xl text-lg font-extrabold"
        style={{ background: accent }}
      >
        →
      </div>
      <div className="flex flex-col gap-2">
        <div className="text-[11px] font-bold tracking-[0.16em] text-muted uppercase">
          {eyebrow}
        </div>
        <div className="font-display text-2xl font-extrabold tracking-tight">
          {title}
        </div>
        <div className="text-[14px] leading-relaxed text-muted">{desc}</div>
      </div>
      <div className="mt-1 text-[14px] font-bold text-accent-3 group-hover:text-accent-2">
        {cta} →
      </div>
    </Link>
  );
}

export default function Home() {
  return (
    <main className="mx-auto flex min-h-screen max-w-4xl flex-col gap-12 px-6 py-16">
      <div className="flex flex-col gap-3">
        <div className="text-[11px] font-bold tracking-[0.18em] text-muted uppercase">
          Association Poly · Prototype
        </div>
        <h1 className="font-display text-4xl font-extrabold tracking-tight sm:text-5xl">
          PolyQR
        </h1>
        <p className="max-w-xl text-[15px] leading-relaxed text-muted">
          Démo cliquable du système de QR code d&apos;entrée, pour la{" "}
          {EVENT.nom} ({EVENT.date}, {EVENT.lieu}). Les données sont
          factices et réinitialisées à chaque rechargement — ce prototype
          sert à valider le parcours, pas à gérer une vraie soirée.
        </p>
      </div>

      <div className="grid gap-5 sm:grid-cols-3">
        <Card
          href="/billet?id=t2"
          eyebrow="Participant"
          title="Voir un billet"
          desc="L'écran reçu par email après paiement, avec le QR et les tickets boisson."
          cta="Ouvrir le billet"
          accent="#6C4BF0"
        />
        <Card
          href="/login"
          eyebrow="Bénévole"
          title="Espace scanner"
          desc="Accès protégé par mot de passe, puis simulation de scans à l'entrée."
          cta="Ouvrir l'accès"
          accent="#45E0A0"
        />
        <Card
          href="/admin"
          eyebrow="Organisateurs"
          title="Espace admin"
          desc="Événement, création de billets de permanence, liste et invalidation."
          cta="Ouvrir l'admin"
          accent="#FFB020"
        />
      </div>

      <div className="rounded-2xl border border-line bg-ink-2 p-5 text-[13px] leading-relaxed text-muted">
        Mot de passe bénévole pour la démo :{" "}
        <span className="font-mono font-bold text-fg">
          {EVENT.motDePasse}
        </span>
      </div>
    </main>
  );
}
