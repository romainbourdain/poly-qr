import { cn } from "@/shared/lib/cn";

export function Stat({
  label,
  value,
  className,
}: {
  label: string;
  value: number | string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col gap-1 rounded-[14px] bg-ink-4 px-4 py-3.5 sm:px-4.5 sm:py-4",
        className,
      )}
    >
      <span className="font-semibold text-[12px] text-muted">{label}</span>
      <span className="font-display font-extrabold text-[24px] tabular-nums tracking-tight sm:text-[28px]">
        {value}
      </span>
    </div>
  );
}
