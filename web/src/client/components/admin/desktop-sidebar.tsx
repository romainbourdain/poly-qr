import Link from "next/link";
import { NavLinks } from "@/client/components/admin/nav-links";

export function DesktopSidebar() {
  return (
    <aside className="hidden w-60 shrink-0 flex-col gap-7 border-line border-r bg-ink-5 px-4 py-6 md:flex">
      <div className="flex flex-col gap-0.5 px-2">
        <div className="font-display font-extrabold text-xl tracking-tight">
          PolyQR
        </div>
        <div className="text-[12px] text-muted">Association Poly</div>
      </div>
      <NavLinks />
      <div className="mt-auto flex flex-col gap-2.5">
        <Link
          href="/scanner"
          className="flex items-center justify-center gap-2 rounded-[11px] border border-line-2 bg-ink-4 p-3 font-semibold text-[13.5px]"
        >
          Ouvrir le scanner
        </Link>
        <div className="px-1 text-[12px] text-faint leading-relaxed">
          Connecté avec le mot de passe admin (démo).
        </div>
      </div>
    </aside>
  );
}
