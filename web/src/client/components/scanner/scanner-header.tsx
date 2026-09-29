export function ScannerHeader({
  evenementNom,
  entrees,
}: {
  evenementNom: string;
  entrees: number;
}) {
  return (
    <div className="flex items-center gap-3 py-4.5">
      <div className="flex flex-1 flex-col gap-0.5">
        <div className="font-bold text-[15px]">{evenementNom}</div>
        <div className="text-[13px] text-muted">Poste d&apos;entrée</div>
      </div>
      <div className="flex items-center gap-1.5 rounded-full border border-[#2E2E4A] bg-[#17172A] px-3 py-1.5">
        <span aria-hidden="true" className="size-1.5 rounded-full bg-good" />
        <span className="font-bold text-[14px] tabular-nums">
          {entrees} entrées
        </span>
      </div>
    </div>
  );
}
