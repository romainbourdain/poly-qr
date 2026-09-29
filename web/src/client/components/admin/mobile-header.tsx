import Link from "next/link";
import {
  type EvenementOption,
  EvenementSwitcher,
} from "@/client/components/admin/evenement-switcher";
import { NavLinks } from "@/client/components/admin/nav-links";
import { Button } from "@/client/components/ui/button";

function MenuIcon({ open }: { open: boolean }) {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="#EDEBF5"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {open ? (
        <path d="M6 6l12 12M18 6 6 18" />
      ) : (
        <path d="M4 7h16M4 12h16M4 17h16" />
      )}
    </svg>
  );
}

export function MobileHeader({
  open,
  onToggle,
  onClose,
  evenements,
  evenementId,
  avecEvenement,
}: {
  open: boolean;
  onToggle: () => void;
  onClose: () => void;
  evenements: EvenementOption[];
  evenementId: string | null;
  avecEvenement: (href: string) => string;
}) {
  return (
    <div className="md:hidden">
      <div className="flex items-center gap-3 border-line border-b bg-ink-5 px-4 py-3.5">
        <Button
          variant="secondary"
          size="icon"
          aria-label={open ? "Fermer le menu" : "Ouvrir le menu"}
          aria-expanded={open}
          onClick={onToggle}
        >
          <MenuIcon open={open} />
        </Button>
        <div className="flex flex-1 flex-col leading-tight">
          <span className="font-display font-extrabold text-[16px] tracking-tight">
            PolyQR
          </span>
          <span className="text-[12px] text-muted">BDE TPS</span>
        </div>
        {evenementId && (
          <Link
            href={`/scanner/${evenementId}`}
            className="flex h-11 items-center rounded-[9px] border border-line-2 bg-ink-3 px-4 font-semibold text-[13.5px]"
          >
            Scanner
          </Link>
        )}
      </div>

      {open && (
        <div className="flex flex-col gap-3 border-line border-b bg-ink-5 p-4">
          <EvenementSwitcher
            evenements={evenements}
            evenementId={evenementId}
            onNavigate={onClose}
          />
          {evenementId && (
            <NavLinks avecEvenement={avecEvenement} onNavigate={onClose} />
          )}
        </div>
      )}
    </div>
  );
}
