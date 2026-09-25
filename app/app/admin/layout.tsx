"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const NAV = [
  { href: "/admin", label: "Événements" },
  { href: "/admin/nouveau", label: "Nouveau billet" },
  { href: "/admin/billets", label: "Billets" },
];

function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  return (
    <nav className="flex flex-col gap-1">
      {NAV.map((item) => {
        const active = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={`rounded-[10px] px-3 py-2.5 text-[14px] ${
              active
                ? "bg-[#252538] font-bold text-fg"
                : "font-semibold text-muted"
            }`}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      {/* Mobile top bar */}
      <div className="flex items-center gap-3 border-b border-line bg-ink-5 px-4 py-3.5 md:hidden">
        <button
          type="button"
          aria-label="Ouvrir le menu"
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((v) => !v)}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[9px] border border-line-2 bg-ink-3"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#EDEBF5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            {menuOpen ? <path d="M6 6l12 12M18 6 6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
          </svg>
        </button>
        <div className="flex flex-1 flex-col leading-tight">
          <span className="font-display text-[16px] font-extrabold tracking-tight">
            PolyQR
          </span>
          <span className="text-[11px] text-muted">Association Poly</span>
        </div>
        <Link
          href="/scanner"
          className="flex h-9 items-center rounded-[9px] border border-line-2 bg-ink-3 px-3 text-[12.5px] font-semibold"
        >
          Scanner
        </Link>
      </div>

      {menuOpen && (
        <div className="flex flex-col gap-3 border-b border-line bg-ink-5 px-4 py-4 md:hidden">
          <NavLinks onNavigate={() => setMenuOpen(false)} />
        </div>
      )}

      {/* Desktop sidebar */}
      <aside className="hidden w-60 shrink-0 flex-col gap-7 border-r border-line bg-ink-5 px-4 py-6 md:flex">
        <div className="flex flex-col gap-0.5 px-2">
          <div className="font-display text-xl font-extrabold tracking-tight">
            PolyQR
          </div>
          <div className="text-[12px] text-muted">Association Poly</div>
        </div>
        <NavLinks />
        <div className="mt-auto flex flex-col gap-2.5">
          <Link
            href="/scanner"
            className="flex items-center justify-center gap-2 rounded-[11px] border border-line-2 bg-ink-4 px-3 py-3 text-[13.5px] font-semibold"
          >
            Ouvrir le scanner
          </Link>
          <div className="px-1 text-[11.5px] leading-relaxed text-faint">
            Connecté avec le mot de passe admin (démo).
          </div>
        </div>
      </aside>

      <div className="min-w-0 flex-1 overflow-x-hidden">{children}</div>
    </div>
  );
}
