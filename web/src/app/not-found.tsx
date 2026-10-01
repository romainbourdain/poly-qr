import Link from "next/link";
import { buttonVariants } from "@/client/components/ui/button";
import { cn } from "@/shared/lib/cn";

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-sm flex-col items-center justify-center gap-8 px-7 text-center">
      <div
        aria-hidden="true"
        className="font-display font-extrabold text-8xl text-accent-2 tracking-tight"
      >
        404
      </div>

      <div className="flex flex-col gap-2">
        <h1 className="font-display font-extrabold text-3xl tracking-tight">
          Page introuvable
        </h1>
        <p className="text-[15px] text-muted leading-relaxed">
          Cette page n&apos;existe pas ou n&apos;existe plus. Si tu cherchais
          ton billet, utilise le lien reçu par email.
        </p>
      </div>

      <Link href="/" className={cn(buttonVariants(), "h-12 px-6")}>
        Retour à l&apos;accueil
      </Link>
    </main>
  );
}
