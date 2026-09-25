"use client";

import { useRouter } from "next/navigation";
import { useStore } from "@/lib/store";

export default function ScannerPage() {
  const router = useRouter();
  const { tickets, scanTicket } = useStore();

  function simulateScan(id: string) {
    const outcome = scanTicket(id);
    router.push(`/scanner/resultat?outcome=${outcome.type}&id=${id}`);
  }

  const entrees = tickets.filter((t) => t.statut === "scanne").reduce(
    (sum, t) => sum + t.entrees,
    0,
  );

  return (
    <main className="mx-auto flex min-h-screen max-w-sm flex-col bg-[#08080C] px-5">
      <div className="flex items-center gap-3 py-4.5">
        <div className="flex flex-1 flex-col gap-0.5">
          <div className="text-[15px] font-bold">Soirée d&apos;hiver</div>
          <div className="text-[12.5px] text-muted">Poste d&apos;entrée · Léa</div>
        </div>
        <div className="flex items-center gap-1.5 rounded-full border border-[#2E2E4A] bg-[#17172A] px-3 py-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-good" />
          <span className="text-[13px] font-bold">{entrees} entrées</span>
        </div>
      </div>

      <div className="flex flex-1 flex-col items-center justify-center gap-6 py-4">
        <div className="relative flex h-64 w-64 items-center justify-center rounded-[30px] bg-ink-4">
          <span className="absolute top-0 left-0 h-14 w-14 rounded-tl-[30px] border-t-4 border-l-4 border-accent" />
          <span className="absolute top-0 right-0 h-14 w-14 rounded-tr-[30px] border-t-4 border-r-4 border-accent" />
          <span className="absolute bottom-0 left-0 h-14 w-14 rounded-bl-[30px] border-b-4 border-l-4 border-accent" />
          <span className="absolute right-0 bottom-0 h-14 w-14 rounded-br-[30px] border-r-4 border-b-4 border-accent" />
          <span className="absolute inset-x-6 top-1/2 h-0.5 bg-accent" />
        </div>
        <div className="flex flex-col items-center gap-1.5 text-center">
          <div className="font-display text-xl font-bold tracking-tight">
            Vise le QR code
          </div>
          <div className="max-w-[240px] text-[13.5px] leading-relaxed text-muted">
            Prototype : pas de vraie caméra branchée — choisis un billet
            ci-dessous pour simuler son scan.
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-2 pb-4">
        <div className="text-[11px] font-bold tracking-[0.12em] text-faint uppercase">
          Simuler un scan
        </div>
        <div className="flex max-h-56 flex-col gap-1.5 overflow-y-auto pr-1">
          {tickets.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => simulateScan(t.id)}
              className="flex items-center gap-3 rounded-xl border border-line-2 bg-ink-3 px-3.5 py-2.5 text-left"
            >
              <span className="flex-1 truncate text-[13.5px] font-semibold">
                {t.nom}
              </span>
              <span className="text-[11.5px] text-muted">
                {t.entrees > 1 ? `${t.entrees} entrées` : "1 entrée"}
              </span>
              <span
                className="rounded-full px-2 py-0.5 text-[10.5px] font-bold"
                style={{
                  background:
                    t.statut === "scanne"
                      ? "#0E2A20"
                      : t.statut === "invalide"
                        ? "#261015"
                        : "#1F1F2E",
                  color:
                    t.statut === "scanne"
                      ? "#45E0A0"
                      : t.statut === "invalide"
                        ? "#FF6B6B"
                        : "#A5A2BC",
                }}
              >
                {t.statut === "scanne"
                  ? "scanné"
                  : t.statut === "invalide"
                    ? "invalidé"
                    : "à scanner"}
              </span>
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={() => router.push("/scanner/resultat?outcome=inconnu")}
          className="mt-1 flex h-11 items-center justify-center gap-2 rounded-xl border border-line-2 bg-ink-3 text-[13.5px] font-semibold text-muted"
        >
          Simuler un QR inconnu
        </button>
      </div>
    </main>
  );
}
