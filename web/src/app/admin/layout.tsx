import type { ReactNode } from "react";
import { AdminShell } from "@/client/components/admin/admin-shell";
import { db } from "@/server/db/client";
import { listerEvenements } from "@/server/services/evenements";

export const dynamic = "force-dynamic";

export default async function AdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  const evenements = await listerEvenements(db);

  return (
    <AdminShell
      evenements={evenements.map(({ id, nom, date }) => ({ id, nom, date }))}
    >
      {children}
    </AdminShell>
  );
}
