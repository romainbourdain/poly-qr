"use client";

import { useState } from "react";
import { PermanenceForm } from "@/client/components/admin/permanence-form";
import { SessionTicketList } from "@/client/components/admin/session-ticket-list";
import type { CommandeCreee } from "@/shared/lib/types";

export default function AdminNouveauBilletPage() {
  const [session, setSession] = useState<CommandeCreee[]>([]);

  return (
    <div className="flex flex-col gap-5 px-4 py-6 sm:gap-6 sm:px-6 sm:py-8 md:px-9">
      <div className="flex flex-col gap-1">
        <h1 className="font-display font-extrabold text-[24px] tracking-tight sm:text-[30px]">
          Billet de permanence
        </h1>
        <div className="text-[14px] text-muted">
          Pour une personne qui paye en main propre. Le QR part par email tout
          de suite.
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 lg:gap-7">
        <PermanenceForm
          onCreated={(commande) => setSession((prev) => [commande, ...prev])}
        />
        <div className="flex flex-col gap-4.5">
          <SessionTicketList commandes={session} />
        </div>
      </div>
    </div>
  );
}
