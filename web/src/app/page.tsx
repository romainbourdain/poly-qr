import Link from "next/link";
import { buttonVariants } from "@/client/components/ui/button";
import { cn } from "@/shared/lib/cn";

export default function Home() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-sm flex-col items-center justify-center gap-8 px-7 text-center">
      <div className="flex size-14 items-center justify-center rounded-2xl bg-accent">
        <svg
          width="28"
          height="28"
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

      <div className="flex flex-col gap-2">
        <h1 className="font-display font-extrabold text-4xl tracking-tight">
          PolyQR
        </h1>
        <p className="text-[15px] text-muted leading-relaxed">
          Billetterie des soirées du BDE TPS.
        </p>
      </div>

      <Link href="/admin" className={cn(buttonVariants(), "h-12 px-6")}>
        Espace organisateurs
      </Link>

      <p className="flex items-center gap-2 text-[13px] text-muted">
        <span aria-hidden="true" className="size-2 rounded-full bg-good" />
        Le service est en ligne
      </p>
    </main>
  );
}
