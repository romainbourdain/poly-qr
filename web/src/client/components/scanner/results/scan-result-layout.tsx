import Link from "next/link";
import type { ReactNode } from "react";
import { buttonVariants } from "@/client/components/ui/button";
import { cn } from "@/shared/lib/cn";
import type { BilletScanne } from "@/shared/lib/types";

type ResultTone = "good" | "warn" | "bad";

/** Petit libellé de section, comme les libellés de groupe de l'admin. */
export const RESULT_LABEL_CLASSES =
  "font-bold text-[11.5px] text-white/70 uppercase tracking-[0.12em]";

/** Panneau de contenu posé sur la couleur du résultat, aux arrondis des cards de l'app. */
export const RESULT_PANEL_CLASSES = "rounded-[18px] bg-black/20 px-5 py-4";

const TONE_CLASSES: Record<
  ResultTone,
  { page: string; accent: string; button: string }
> = {
  good: {
    page: "bg-[#07432e]",
    accent: "text-[#baffd5]",
    button: "bg-[#eafff1] text-[#073824] hover:bg-white",
  },
  warn: {
    page: "bg-[#57400a]",
    accent: "text-[#ffe18a]",
    button: "bg-[#fff5d7] text-[#372600] hover:bg-white",
  },
  bad: {
    page: "bg-[#5b1925]",
    accent: "text-[#ffb7c1]",
    button: "bg-[#fff0f2] text-[#45101b] hover:bg-white",
  },
};

export function ScanResultLayout({
  tone,
  icon,
  title,
  reason,
  instruction,
  children,
  retourHref,
}: {
  tone: ResultTone;
  icon: ReactNode;
  title: string;
  reason: string;
  instruction?: string;
  children: ReactNode;
  retourHref: string;
}) {
  const classes = TONE_CLASSES[tone];

  return (
    <main className={cn("min-h-dvh w-full text-white", classes.page)}>
      <div className="mx-auto flex min-h-dvh w-full max-w-md flex-col px-6">
        <header className="pt-7">
          <div
            className={cn(
              "mb-4 grid size-13 place-items-center rounded-[14px] bg-white/10 p-3",
              classes.accent,
            )}
          >
            {icon}
          </div>
          <h1 className="max-w-90 font-display font-extrabold text-[40px] leading-[1.02] tracking-tight sm:text-[46px]">
            {title}
          </h1>
          <p className={cn("mt-2.5 font-bold text-[17px]", classes.accent)}>
            {reason}
          </p>
        </header>

        <div className="flex flex-1 flex-col gap-3 py-6">{children}</div>

        {instruction && (
          <p
            className={cn(
              RESULT_PANEL_CLASSES,
              "font-semibold text-[15px] leading-snug",
            )}
          >
            {instruction}
          </p>
        )}

        <div className="pt-4 pb-[max(1.25rem,env(safe-area-inset-bottom))]">
          <Link
            href={retourHref}
            className={cn(
              buttonVariants({ variant: "primary", size: "md" }),
              "h-13 w-full text-[15.5px]",
              classes.button,
            )}
          >
            Scanner le suivant
          </Link>
        </div>
      </div>
    </main>
  );
}

export function BilletIdentity({
  billet,
  showScanTime = false,
}: {
  billet: BilletScanne;
  showScanTime?: boolean;
}) {
  return (
    <section className={RESULT_PANEL_CLASSES}>
      <p className={RESULT_LABEL_CLASSES}>Billet de</p>
      <p className="mt-1.5 break-words font-bold font-display text-[23px] leading-tight tracking-tight">
        {billet.prenom} {billet.nom}
      </p>
      {showScanTime && billet.scanneA && (
        <p className="mt-3 text-[15px] text-white/85 tabular-nums">
          Première entrée à{" "}
          <strong className="text-white">{billet.scanneA}</strong>
        </p>
      )}
    </section>
  );
}
