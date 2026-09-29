"use client";

import type { CSSProperties, ReactNode } from "react";
import { ResponsiveContainer } from "recharts";
import { cn } from "@/shared/lib/cn";

export type ChartConfig = Record<string, { label: string; color: string }>;

/**
 * Conteneur de graphique façon shadcn : expose la couleur de chaque série en
 * variable CSS (`--color-<clé>`) et dimensionne le graphique dans sa boîte.
 */
export function ChartContainer({
  config,
  className,
  label,
  children,
}: {
  config: ChartConfig;
  className?: string;
  /** Description accessible du graphique, valeurs comprises. */
  label: string;
  children: ReactNode;
}) {
  const style = Object.fromEntries(
    Object.entries(config).map(([cle, { color }]) => [`--color-${cle}`, color]),
  ) as CSSProperties;

  return (
    <div
      role="img"
      aria-label={label}
      style={style}
      className={cn(
        "aspect-video w-full text-[12px] [&_.recharts-cartesian-axis-tick_text]:fill-muted [&_.recharts-surface]:outline-none",
        className,
      )}
    >
      <ResponsiveContainer>{children as never}</ResponsiveContainer>
    </div>
  );
}

interface TooltipPayload {
  name?: string | number;
  value?: unknown;
  color?: string;
}

/** Infobulle du design system : titre optionnel, puis une ligne par série. */
export function ChartTooltipContent({
  active,
  payload,
  title,
  formatValue = String,
}: {
  active?: boolean;
  payload?: readonly TooltipPayload[];
  title?: string;
  formatValue?: (valeur: unknown) => string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="flex min-w-32 flex-col gap-1.5 rounded-lg border border-line-2 bg-ink-3 px-3 py-2 text-[12.5px] shadow-lg">
      {title && <div className="font-bold text-fg">{title}</div>}
      {payload.map((ligne) => (
        <div key={String(ligne.name)} className="flex items-center gap-2">
          <span
            aria-hidden="true"
            className="size-2.5 shrink-0 rounded-[3px]"
            style={{ background: ligne.color }}
          />
          <span className="text-muted">{ligne.name}</span>
          <span className="ml-auto font-bold text-fg tabular-nums">
            {formatValue(ligne.value)}
          </span>
        </div>
      ))}
    </div>
  );
}
