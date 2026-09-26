import Link from "next/link";
import { ResultIconCircle } from "@/client/components/scanner/result-icon-circle";

function CrossIcon() {
  return (
    <svg
      width="46"
      height="46"
      viewBox="0 0 24 24"
      fill="none"
      stroke="#1E0709"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M6 6l12 12M18 6 6 18" />
    </svg>
  );
}

const STEPS = [
  "Vérifie que c'est bien le QR de cette soirée, pas d'un ancien événement.",
  "Cherche son nom dans la liste avec « Chercher par nom ».",
  "Rien trouvé ? Renvoie-la vers la file « paiement sur place ».",
];

export function UnknownResult() {
  return (
    <main className="mx-auto flex min-h-screen max-w-sm flex-col bg-[#1A0C10] px-6 text-[#FBE9EC]">
      <div className="flex flex-1 flex-col items-center gap-5 pt-11">
        <ResultIconCircle className="bg-bad">
          <CrossIcon />
        </ResultIconCircle>
        <div className="flex flex-col items-center gap-2 text-center">
          <div className="font-display font-extrabold text-[#FF8A8A] text-[34px] tracking-tight">
            BILLET INCONNU
          </div>
          <div className="max-w-72.5 text-[#DBB4B8] text-[15px] leading-relaxed">
            Ce QR code ne correspond à aucun billet de cette soirée.
          </div>
        </div>

        <div className="flex w-full flex-col gap-3.5 rounded-[20px] border border-bad-line bg-bad-bg p-5.5">
          <div className="font-bold text-[#DBB4B8] text-[12px] uppercase tracking-[0.14em]">
            Que faire
          </div>
          {STEPS.map((txt, i) => (
            <div key={txt} className="flex items-start gap-2.5">
              <span className="flex size-5.5 shrink-0 items-center justify-center rounded-full bg-bad-line font-bold text-[12px]">
                {i + 1}
              </span>
              <span className="text-[14px] leading-relaxed">{txt}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="flex flex-col gap-2.5 pb-8">
        <Link
          href="/scanner"
          className="flex h-14.5 items-center justify-center rounded-2xl bg-bad font-bold text-[#1E0709] text-[17px]"
        >
          Scanner le suivant
        </Link>
      </div>
    </main>
  );
}
