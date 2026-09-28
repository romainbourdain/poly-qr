"use client";

import { useRef, useState } from "react";
import { BilletQrCard } from "@/client/components/billet/billet-qr-card";
import { BilletStatusCard } from "@/client/components/billet/billet-status-card";
import type { BilletListe } from "@/shared/lib/types";

export function BilletSwiper({
  nom,
  billets,
}: {
  nom: string;
  billets: BilletListe[];
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  function handleScroll() {
    const container = containerRef.current;
    if (!container || container.clientWidth === 0) return;
    const index = Math.round(container.scrollLeft / container.clientWidth);
    setActiveIndex(index);
  }

  return (
    <div className="flex flex-col gap-3">
      <div
        ref={containerRef}
        onScroll={handleScroll}
        className="flex snap-x snap-mandatory overflow-x-auto scroll-smooth [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {billets.map((billet) => (
          <div
            key={billet.id}
            className="flex w-full shrink-0 snap-center flex-col gap-2.5"
          >
            <BilletQrCard nom={nom} billet={billet} />
            <BilletStatusCard billet={billet} />
          </div>
        ))}
      </div>

      <div className="flex items-center justify-center gap-1.5">
        {billets.map((billet, index) => (
          <span
            key={billet.id}
            className={`size-1.5 rounded-full ${
              index === activeIndex ? "bg-fg" : "bg-line-2"
            }`}
          />
        ))}
      </div>

      <div className="text-center text-[12.5px] text-muted">
        Billet {activeIndex + 1} sur {billets.length} · glisse pour voir les
        autres
      </div>
    </div>
  );
}
