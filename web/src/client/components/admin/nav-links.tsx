"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV = [
  { href: "/admin", label: "Événement" },
  { href: "/admin/nouveau", label: "Nouveau billet" },
  { href: "/admin/billets", label: "Billets" },
];

export function NavLinks({
  avecEvenement,
  onNavigate,
}: {
  /** Ajoute l'événement sélectionné (`?evenement=`) au lien. */
  avecEvenement: (href: string) => string;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();
  return (
    <nav aria-label="Administration" className="flex flex-col gap-1">
      {NAV.map((item) => {
        const active = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={avecEvenement(item.href)}
            onClick={onNavigate}
            aria-current={active ? "page" : undefined}
            className={`rounded-[10px] p-3 text-[14px] ${
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
