import { Tabs, TabsList, TabsTab } from "@/client/components/ui/tabs";
import type { StatutFilter } from "@/shared/lib/search-params";

const FILTERS: { key: StatutFilter; label: string }[] = [
  { key: "tous", label: "Tous" },
  { key: "scanne", label: "Scannés" },
  { key: "non_scanne", label: "Non scannés" },
  { key: "invalide", label: "Invalidés" },
];

export function TicketStatusTabs({
  value,
  onChange,
}: {
  value: StatutFilter;
  onChange: (value: StatutFilter) => void;
}) {
  return (
    <Tabs value={value} onValueChange={(v) => onChange(v as StatutFilter)}>
      <TabsList>
        {FILTERS.map((f) => (
          <TabsTab key={f.key} value={f.key}>
            {f.label}
          </TabsTab>
        ))}
      </TabsList>
    </Tabs>
  );
}
