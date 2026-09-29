"use client";

import useEmblaCarousel from "embla-carousel-react";
import { useCallback, useEffect, useState } from "react";
import { BilletQrCard } from "@/client/components/billet/billet-qr-card";
import { Button } from "@/client/components/ui/button";
import type { BilletListe } from "@/shared/lib/types";

function ChevronIcon({ direction }: { direction: "left" | "right" }) {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.4"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d={direction === "left" ? "m15 6-6 6 6 6" : "m9 6 6 6-6 6"} />
    </svg>
  );
}

export function BilletSwiper({
  nom,
  billets,
}: {
  nom: string;
  billets: BilletListe[];
}) {
  const [viewportRef, emblaApi] = useEmblaCarousel({ align: "center" });
  const [activeIndex, setActiveIndex] = useState(0);

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    const onSelect = () => setActiveIndex(emblaApi.selectedScrollSnap());
    emblaApi.on("select", onSelect).on("reInit", onSelect);
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      emblaApi.reInit({ duration: 0 });
    }
    return () => {
      emblaApi.off("select", onSelect).off("reInit", onSelect);
    };
  }, [emblaApi]);

  return (
    <div className="flex flex-col gap-3">
      <section
        ref={viewportRef}
        aria-roledescription="carousel"
        aria-label="Billets de la commande"
        className="overflow-hidden"
      >
        <div className="flex">
          {billets.map((billet, index) => (
            // biome-ignore lint/a11y/useSemanticElements: WAI-ARIA carousel pattern (slide = group), a fieldset would be wrong here
            <div
              key={billet.id}
              role="group"
              aria-roledescription="slide"
              aria-label={`Billet ${index + 1} sur ${billets.length}`}
              className="min-w-0 flex-[0_0_100%]"
            >
              <BilletQrCard nom={nom} billet={billet} />
            </div>
          ))}
        </div>
      </section>

      <div className="flex items-center justify-between gap-3">
        <Button
          variant="ghost"
          size="icon"
          aria-label="Billet précédent"
          disabled={activeIndex === 0}
          onClick={scrollPrev}
        >
          <ChevronIcon direction="left" />
        </Button>
        <div role="status" className="flex flex-col items-center gap-2">
          <div aria-hidden="true" className="flex items-center gap-1.5">
            {billets.map((billet, index) => (
              <span
                key={billet.id}
                className={`size-1.5 rounded-full ${
                  index === activeIndex ? "bg-fg" : "bg-line-2"
                }`}
              />
            ))}
          </div>
          <span className="text-[13px] text-muted">
            Billet {activeIndex + 1} sur {billets.length}
          </span>
        </div>
        <Button
          variant="ghost"
          size="icon"
          aria-label="Billet suivant"
          disabled={activeIndex === billets.length - 1}
          onClick={scrollNext}
        >
          <ChevronIcon direction="right" />
        </Button>
      </div>
    </div>
  );
}
