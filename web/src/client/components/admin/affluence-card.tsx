"use client";

import { Bar, BarChart, CartesianGrid, Tooltip, XAxis, YAxis } from "recharts";
import { Card } from "@/client/components/ui/card";
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltipContent,
} from "@/client/components/ui/chart";
import type { TrancheAffluence } from "@/shared/lib/affluence";

const CONFIG = {
  entrees: { label: "Entrées", color: "var(--color-accent-2)" },
} satisfies ChartConfig;

const heureCourte = (hhmm: string) => hhmm.replace(":", "h");

/** Entrées par tranche de 15 min, pour suivre les pics d'arrivée. */
export function AffluenceCard({ tranches }: { tranches: TrancheAffluence[] }) {
  const total = tranches.reduce((n, t) => n + t.entrees, 0);
  const pic = tranches.reduce((max, t) => (t.entrees > max.entrees ? t : max));

  return (
    <Card className="flex flex-col gap-4">
      <h2 className="font-bold text-[16px]">Affluence à l&apos;entrée</h2>
      {total === 0 && (
        <p className="text-[13.5px] text-muted">
          Aucune entrée pour l&apos;instant.
        </p>
      )}
      {total > 0 && (
        <ChartContainer
          config={CONFIG}
          className="aspect-auto h-64"
          label={`Entrées par tranche de 15 minutes, ${total} au total, pic à ${heureCourte(pic.debut)}.`}
        >
          <BarChart data={tranches} margin={{ left: -12, right: 4, top: 4 }}>
            <CartesianGrid vertical={false} stroke="var(--color-line)" />
            <XAxis
              dataKey="debut"
              tickLine={false}
              axisLine={false}
              ticks={tranches
                .filter((t) => t.debut.endsWith(":00"))
                .map((t) => t.debut)}
              tickFormatter={heureCourte}
              interval="preserveStartEnd"
              minTickGap={24}
            />
            <YAxis
              allowDecimals={false}
              tickLine={false}
              axisLine={false}
              width={40}
            />
            <Tooltip
              cursor={{ fill: "var(--color-ink-4)" }}
              content={({ active, payload }) => {
                const tranche = payload?.[0]?.payload as
                  | TrancheAffluence
                  | undefined;
                return (
                  <ChartTooltipContent
                    active={active}
                    payload={payload}
                    title={
                      tranche
                        ? `${heureCourte(tranche.debut)} – ${heureCourte(tranche.fin)}`
                        : undefined
                    }
                  />
                );
              }}
            />
            <Bar
              dataKey="entrees"
              name="Entrées"
              fill="var(--color-entrees)"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ChartContainer>
      )}
    </Card>
  );
}
