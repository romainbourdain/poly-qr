export function ScannerHeader({ entrees }: { entrees: number }) {
  return (
    <div className="flex items-center gap-3 py-4.5">
      <div className="flex flex-1 flex-col gap-0.5">
        <div className="font-bold text-[15px]">Soirée d&apos;hiver</div>
        <div className="text-[12.5px] text-muted">
          Poste d&apos;entrée · Léa
        </div>
      </div>
      <div className="flex items-center gap-1.5 rounded-full border border-[#2E2E4A] bg-[#17172A] px-3 py-1.5">
        <span className="size-1.5 rounded-full bg-good" />
        <span className="font-bold text-[13px]">{entrees} entrées</span>
      </div>
    </div>
  );
}
