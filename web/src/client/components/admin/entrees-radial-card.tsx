"use client";

import {
  Label,
  PolarAngleAxis,
  PolarRadiusAxis,
  RadialBar,
  RadialBarChart,
} from "recharts";
import { Card } from "@/client/components/ui/card";
import { type ChartConfig, ChartContainer } from "@/client/components/ui/chart";
import type { StatsEvenement } from "@/shared/lib/types";

const CONFIG = {
  entrees: { label: "Entrées", color: "var(--color-good)" },
} satisfies ChartConfig;

/** Avancement des entrées : anneau du pourcentage scanné, restants et invalidés. */
export function EntreesRadialCard({ stats }: { stats: StatsEvenement }) {
  const { entreesScannees, billetsVendus, billetsInvalides } = stats;
  const restants = billetsVendus - entreesScannees;
  const pourcentage =
    billetsVendus > 0 ? Math.round((entreesScannees / billetsVendus) * 100) : 0;

  return (
    <Card className="flex flex-col gap-4">
      <h2 className="font-bold text-[16px]">Entrées</h2>
      <ChartContainer
        config={CONFIG}
        className="mx-auto aspect-square max-h-52"
        label={`${pourcentage} % des billets scannés : ${entreesScannees} sur ${billetsVendus}.`}
      >
        <RadialBarChart
          data={[{ name: "entrees", value: pourcentage }]}
          startAngle={90}
          endAngle={-270}
          innerRadius="72%"
          outerRadius="100%"
        >
          <PolarAngleAxis type="number" domain={[0, 100]} tick={false} />
          <RadialBar
            dataKey="value"
            fill="var(--color-entrees)"
            background={{ fill: "var(--color-ink-4)" }}
            cornerRadius={10}
          />
          <PolarRadiusAxis tick={false} tickLine={false} axisLine={false}>
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
                      {pourcentage} %
                    </tspan>
                    <tspan
                      x={viewBox.cx}
                      y={(viewBox.cy ?? 0) + 16}
                      className="fill-muted"
                      fontSize={12}
                    >
                      scannés
                    </tspan>
                  </text>
                ) : null
              }
            />
          </PolarRadiusAxis>
        </RadialBarChart>
      </ChartContainer>
      <dl className="grid grid-cols-3 gap-3 text-[13px]">
        <div className="flex flex-col">
          <dt className="text-muted">Entrés</dt>
          <dd className="font-bold text-[18px] tabular-nums">
            {entreesScannees}
          </dd>
        </div>
        <div className="flex flex-col">
          <dt className="text-muted">Restants</dt>
          <dd className="font-bold text-[18px] tabular-nums">{restants}</dd>
        </div>
        <div className="flex flex-col">
          <dt className="text-muted">Invalidés</dt>
          <dd className="font-bold text-[18px] tabular-nums">
            {billetsInvalides}
          </dd>
        </div>
      </dl>
    </Card>
  );
}
