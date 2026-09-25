"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV = [
  { href: "/admin", label: "Événements" },
  { href: "/admin/nouveau", label: "Nouveau billet" },
  { href: "/admin/billets", label: "Billets" },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="flex min-h-screen">
      <aside className="flex w-60 shrink-0 flex-col gap-7 border-r border-line bg-ink-5 px-4 py-6">
        <div className="flex flex-col gap-0.5 px-2">
          <div className="font-display text-xl font-extrabold tracking-tight">
            PolyQR
          </div>
          <div className="text-[12px] text-muted">Association Poly</div>
        </div>
        <nav className="flex flex-col gap-1">
          {NAV.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
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
      <div className="flex-1 overflow-x-hidden">{children}</div>
    </div>
  );
}
