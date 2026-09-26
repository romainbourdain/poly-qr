"use client";

import { useState } from "react";
import { DesktopSidebar } from "@/client/components/admin/desktop-sidebar";
import { MobileHeader } from "@/client/components/admin/mobile-header";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      <MobileHeader
        open={menuOpen}
        onToggle={() => setMenuOpen((v) => !v)}
        onClose={() => setMenuOpen(false)}
      />
      <DesktopSidebar />
      <div className="min-w-0 flex-1 overflow-x-hidden">{children}</div>
    </div>
  );
}
