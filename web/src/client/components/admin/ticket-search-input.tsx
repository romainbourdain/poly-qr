import { Input } from "@/client/components/ui/input";

function SearchIcon() {
  return (
    <svg
      className="pointer-events-none absolute left-3.5"
      width="17"
      height="17"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" />
    </svg>
  );
}

export function TicketSearchInput({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="relative flex flex-1 items-center">
      <SearchIcon />
      <Input
        value={value}
        onValueChange={onChange}
        placeholder="Rechercher un nom ou un email…"
        aria-label="Rechercher un billet"
        className="h-11.5 pr-4 pl-10.5"
      />
    </div>
  );
}
