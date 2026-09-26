"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV = [
  { href: "/admin", label: "Événements" },
  { href: "/admin/nouveau", label: "Nouveau billet" },
  { href: "/admin/billets", label: "Billets" },
];

export function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
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
