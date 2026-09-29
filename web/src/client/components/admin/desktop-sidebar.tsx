import Link from "next/link";
import {
  type EvenementOption,
  EvenementSwitcher,
} from "@/client/components/admin/evenement-switcher";
import { NavLinks } from "@/client/components/admin/nav-links";

export function DesktopSidebar({
  evenements,
  evenementId,
  avecEvenement,
}: {
  evenements: EvenementOption[];
  evenementId: string | null;
  avecEvenement: (href: string) => string;
}) {
  return (
    <aside className="hidden w-64 shrink-0 flex-col gap-7 border-line border-r bg-ink-5 px-4 py-6 md:flex">
      <div className="flex flex-col gap-0.5 px-2">
        <div className="font-display font-extrabold text-xl tracking-tight">
          PolyQR
        </div>
        <div className="text-[12px] text-muted">BDE TPS</div>
      </div>
      <EvenementSwitcher evenements={evenements} evenementId={evenementId} />
      {evenementId && <NavLinks avecEvenement={avecEvenement} />}
      {evenementId && (
        <div className="mt-auto">
          <Link
            href={`/scanner/${evenementId}`}
            className="flex items-center justify-center gap-2 rounded-[11px] border border-line-2 bg-ink-4 p-3 font-semibold text-[13.5px]"
          >
            Ouvrir le scanner
          </Link>
        </div>
      )}
    </aside>
  );
}
