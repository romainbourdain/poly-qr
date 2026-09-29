"use client";

import { Cell, Label, Pie, PieChart, Tooltip } from "recharts";
import { Card } from "@/client/components/ui/card";
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltipContent,
} from "@/client/components/ui/chart";
import { formatEuros } from "@/shared/lib/prix";

export interface CanalVentes {
  id: string;
  label: string;
  billets: number;
  montantCentimes: number;
  color: string;
}

/** Billets vendus par canal ; le montant, en légende, est une estimation aux prix de l'événement. */
export function CanalDonutCard({ canaux }: { canaux: CanalVentes[] }) {
  const total = canaux.reduce((n, c) => n + c.billets, 0);
  const config = Object.fromEntries(
    canaux.map((c) => [c.id, { label: c.label, color: c.color }]),
  ) satisfies ChartConfig;
  const data = canaux.filter((c) => c.billets > 0);

  return (
    <Card className="flex flex-col gap-4">
      <h2 className="font-bold text-[16px]">Billets par canal</h2>
      {total === 0 ? (
        <p className="text-[13.5px] text-muted">Aucun billet vendu.</p>
      ) : (
        <ChartContainer
          config={config}
          className="mx-auto aspect-square max-h-52"
          label={`Billets vendus par canal : ${canaux.map((c) => `${c.label} ${c.billets}`).join(", ")}.`}
        >
          <PieChart>
            <Tooltip
              content={({ active, payload }) => (
                <ChartTooltipContent active={active} payload={payload} />
              )}
            />
            <Pie
              data={data}
              dataKey="billets"
              nameKey="label"
              innerRadius="62%"
              outerRadius="92%"
              stroke="var(--color-ink-2)"
              strokeWidth={3}
            >
              {data.map((c) => (
                <Cell key={c.id} fill={`var(--color-${c.id})`} />
              ))}
              <Label
                content={({ viewBox }) =>
                  viewBox && "cx" in viewBox ? (
                    <text
                      x={viewBox.cx}
                      y={viewBox.cy}
                      textAnchor="middle"
                      dominantBaseline="middle"
                    >
                      <tspan
                        x={viewBox.cx}
                        y={(viewBox.cy ?? 0) - 6}
                        className="fill-fg font-bold"
                        fontSize={28}
                      >
                        {total}
                      </tspan>
                      <tspan
                        x={viewBox.cx}
                        y={(viewBox.cy ?? 0) + 16}
                        className="fill-muted"
                        fontSize={12}
                      >
                        {total > 1 ? "billets" : "billet"}
                      </tspan>
                    </text>
                  ) : null
                }
              />
            </Pie>
          </PieChart>
        </ChartContainer>
      )}
      <ul className="flex flex-col gap-2.5">
        {canaux.map((c) => (
          <li key={c.id} className="flex items-center gap-3">
            <span
              aria-hidden="true"
              className="size-2.5 shrink-0 rounded-full"
              style={{ background: c.color }}
            />
            <span className="flex-1 font-semibold text-[14px]">{c.label}</span>
            <span className="text-[13px] text-muted tabular-nums">
              {c.billets} · ≈ {formatEuros(c.montantCentimes)}
            </span>
          </li>
        ))}
      </ul>
    </Card>
  );
}
